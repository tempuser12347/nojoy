from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json

class GanadorResponse(BaseModel):
    items: List[dict]
    total: int

router = APIRouter(prefix="/api/ganadors", tags=["ganadors"])

@router.get("/", response_model=GanadorResponse)
def read_ganadors(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, category, era, difficulty, durability, crew, attack_power, defense_power, preparation_item, feature FROM ganador"
    results = db.execute(text(query)).fetchall()

    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]

    if sort_by:
        results.sort(
            key=lambda x: getattr(x, sort_by) or "",
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    items = []
    for row in paginated_results:
        item_dict = dict(row._mapping)
        if item_dict.get('preparation_item') and isinstance(item_dict['preparation_item'], str):
            try:
                item_dict['preparation_item'] = json.loads(item_dict['preparation_item'])
            except json.JSONDecodeError:
                item_dict['preparation_item'] = None
        items.append(item_dict)

    return {"items": items, "total": total}

@router.get("/{ganador_id}", response_model=dict)
def read_ganador(ganador_id: int, db: Session = Depends(get_db)):
    return read_ganador_core(ganador_id, db)

def read_ganador_core(ganador_id: int, db: Session):
    query = text("SELECT * FROM ganador WHERE id = :id")
    result = db.execute(query, {"id": ganador_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Ganador not found")

    ret = dict(result._mapping)

    # Parse JSON fields
    for field in ['preparation_item', 'requirements', 'acquired_items']:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None
    
    return ret
