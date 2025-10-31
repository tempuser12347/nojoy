import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
from ..common import fetch_all_obtain_methods

class SailorEquipmentResponse(BaseModel):
    items: List[dict]
    total: int

router = APIRouter(prefix="/api/sailorequipments", tags=["sailorequipments"])

@router.get("/", response_model=SailorEquipmentResponse)
def read_sailorequipments(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, durability, vertical_sail, horizontal_sail, wave_resistance, armor, maneuverability, equipment_effect FROM sailorequipment"
    results = db.execute(text(query)).fetchall()

    results = [dict(row._mapping) for row in results]

    for row in results:
        if row.get('equipment_effect') and isinstance(row['equipment_effect'], str):
            try:
                equipment_effect_json = json.loads(row['equipment_effect'])
                row['equipment_effect'] = equipment_effect_json.get('name')
            except (json.JSONDecodeError, AttributeError):
                pass # Keep as string if not valid JSON or not a dict with name

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
        ]

    if sort_by:
        if sort_by in ['durability', 'vertical_sail', 'horizontal_sail', 'wave_resistance', 'armor', 'maneuverability']:
            key_f = lambda x: x.get(sort_by) if x.get(sort_by) is not None else float('-inf')
        else:
            key_f = lambda x: x.get(sort_by, '') if x.get(sort_by) is not None else ''
        results.sort(
            key=key_f,
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    return {"items": paginated_results, "total": total}

@router.get("/{sailorequipment_id}", response_model=dict)
def read_sailorequipment(sailorequipment_id: int, db: Session = Depends(get_db)):
    return read_sailorequipment_core(sailorequipment_id, db)

def read_sailorequipment_core(sailorequipment_id: int, db: Session):
    query = text("SELECT * FROM sailorequipment WHERE id = :id")
    result = db.execute(query, {"id": sailorequipment_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="SailorEquipment not found")

    ret = dict(result._mapping)
    if ret.get('equipment_effect') and isinstance(ret['equipment_effect'], str):
        try:
            ret['equipment_effect'] = json.loads(ret['equipment_effect'])
        except json.JSONDecodeError:
            pass


    obtain_method_list = fetch_all_obtain_methods(sailorequipment_id, db)
    if obtain_method_list:
        ret["obtain_method"] = obtain_method_list
    return ret
