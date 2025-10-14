from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json

class LandNpcResponse(BaseModel):
    items: List[dict]
    total: int

router = APIRouter(prefix="/api/landnpcs", tags=["landnpcs"])

@router.get("/", response_model=LandNpcResponse)
def read_landnpcs(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, level, fields, feature FROM landnpc"
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
        if item_dict.get('fields') and isinstance(item_dict['fields'], str):
            try:
                item_dict['fields'] = json.loads(item_dict['fields'])
            except json.JSONDecodeError:
                item_dict['fields'] = None
        items.append(item_dict)

    return {"items": items, "total": total}

@router.get("/{landnpc_id}", response_model=dict)
def read_landnpc(landnpc_id: int, db: Session = Depends(get_db)):
    return read_landnpc_core(landnpc_id, db)

def read_landnpc_core(landnpc_id: int, db: Session):
    query = text("SELECT * FROM landnpc WHERE id = :id")
    result = db.execute(query, {"id": landnpc_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Land NPC not found")

    ret = dict(result._mapping)

    # Parse JSON fields
    for field in ['fields', 'techniques', 'drop_items']:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None
    
    return ret
