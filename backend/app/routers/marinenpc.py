from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json

class MarineNpcResponse(BaseModel):
    items: List[dict]
    total: int

router = APIRouter(prefix="/api/marinenpcs", tags=["marinenpcs"])

@router.get("/", response_model=MarineNpcResponse)
def read_marinenpcs(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, fleet_count, sea_areas, acquired_items, nationality, feature, deck_battle, penalty_level FROM marinenpc"
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
        if item_dict.get('sea_areas') and isinstance(item_dict['sea_areas'], str):
            try:
                item_dict['sea_areas'] = json.loads(item_dict['sea_areas'])
            except json.JSONDecodeError:
                item_dict['sea_areas'] = None
        if item_dict.get('acquired_items') and isinstance(item_dict['acquired_items'], str):
            try:
                item_dict['acquired_items'] = json.loads(item_dict['acquired_items'])
            except json.JSONDecodeError:
                item_dict['acquired_items'] = None
        if item_dict.get('nationality') and isinstance(item_dict['nationality'], str):
            try:
                item_dict['nationality'] = json.loads(item_dict['nationality'])
            except json.JSONDecodeError:
                item_dict['nationality'] = None
        if item_dict.get('deck_battle') and isinstance(item_dict['deck_battle'], str):
            try:
                item_dict['deck_battle'] = json.loads(item_dict['deck_battle'])
            except json.JSONDecodeError:
                item_dict['deck_battle'] = None
        items.append(item_dict)

    return {"items": items, "total": total}

@router.get("/{marinenpc_id}", response_model=dict)
def read_marinenpc(marinenpc_id: int, db: Session = Depends(get_db)):
    return read_marinenpc_core(marinenpc_id, db)

def read_marinenpc_core(marinenpc_id: int, db: Session):
    query = text("SELECT * FROM marinenpc WHERE id = :id")
    result = db.execute(query, {"id": marinenpc_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Marine NPC not found")

    ret = dict(result._mapping)

    # Parse JSON fields
    for field in ['sea_areas', 'acquired_items', 'nationality', 'deck_battle']:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None
    
    return ret
