from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class ItemEffectResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/itemeffects", tags=["itemeffects"])


@router.get("/", response_model=ItemEffectResponse)
def read_itemeffects(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, extraname, description, category, skill FROM itemeffect"
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
            or name_search.lower() in (row.get("extraname") or "").lower()
        ]

    # Process skill for display/sorting
    for row in results:
        if row.get("skill") and isinstance(row["skill"], str):
            try:
                row["skill_objects"] = json.loads(row["skill"])
            except json.JSONDecodeError:
                row["skill_objects"] = []
        else:
            row["skill_objects"] = []

    if sort_by:
        results.sort(
            key=lambda x: x.get(sort_by) or "",
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    items = []
    for row in paginated_results:
        item_dict = dict(row)
        if item_dict.get("extraname"):
            item_dict["name"] = f'{item_dict["name"]} {item_dict["extraname"]}'
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{itemeffect_id}", response_model=dict)
def read_itemeffect(itemeffect_id: int, db: Session = Depends(get_db)):
    return read_itemeffect_core(itemeffect_id, db)


def read_itemeffect_core(itemeffect_id: int, db: Session):
    query = text("SELECT * FROM itemeffect WHERE id = :id")
    result = db.execute(query, {"id": itemeffect_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="ItemEffect not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f'{ret["name"]} {ret["extraname"]}'

    # Parse JSON fields
    for field in ["skill"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret