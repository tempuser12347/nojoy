from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db

class SpecialEquipmentResponse(BaseModel):
    items: List[dict]
    total: int

router = APIRouter(prefix="/api/specialequipments", tags=["specialequipments"])

@router.get("/", response_model=SpecialEquipmentResponse)
def read_specialequipments(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, durability, vertical_sail, horizontal_sail, melee_support, ballistic_defense, fire_resistance, firepower, shoot_range, shoot_area, cooling_speed, ramming, proximity_effect, effect FROM specialequipment"
    results = db.execute(text(query)).fetchall()

    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
        ]

    if sort_by:
        if sort_by in ['durability', 'vertical_sail', 'horizontal_sail', 'melee_support', 'ballistic_defense', 'fire_resistance', 'firepower', 'shoot_range', 'cooling_speed', 'ramming', 'proximity_effect']:
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

@router.get("/{specialequipment_id}", response_model=dict)
def read_specialequipment(specialequipment_id: int, db: Session = Depends(get_db)):
    return read_specialequipment_core(specialequipment_id, db)

def read_specialequipment_core(specialequipment_id: int, db: Session):
    query = text("SELECT * FROM specialequipment WHERE id = :id")
    result = db.execute(query, {"id": specialequipment_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="SpecialEquipment not found")

    return dict(result._mapping)
