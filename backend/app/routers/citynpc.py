from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class CityNpcResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/citynpcs", tags=["citynpcs"])


@router.get("/", response_model=CityNpcResponse)
def read_citynpcs(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, extraname, description, city, preferential_report, skills, tarot_cards, gifts FROM citynpc"
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
        # Parse JSON fields for list view if needed, though typically done in detail
        if item_dict.get("skills") and isinstance(item_dict["skills"], str):
            try:
                item_dict["skills"] = json.loads(item_dict["skills"])
            except json.JSONDecodeError:
                item_dict["skills"] = []
        if item_dict.get("city") and isinstance(item_dict["city"], str):
            try:
                item_dict["city"] = json.loads(item_dict["city"])
            except json.JSONDecodeError:
                item_dict["city"] = None
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{citynpc_id}", response_model=dict)
def read_citynpc(citynpc_id: int, db: Session = Depends(get_db)):
    return read_citynpc_core(citynpc_id, db)


def read_citynpc_core(citynpc_id: int, db: Session):
    query = text("SELECT * FROM citynpc WHERE id = :id")
    result = db.execute(query, {"id": citynpc_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="CityNpc not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f"{ret['name']} {ret['extraname']}"

    # Parse JSON fields
    for field in ["city", "skills", "tarot_cards", "gifts"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret
