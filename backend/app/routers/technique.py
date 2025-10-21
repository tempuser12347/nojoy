from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class TechniqueResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/techniques", tags=["techniques"])


@router.get("/", response_model=TechniqueResponse)
def read_techniques(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, technique_type, weapon_type, rank, gauge_cost, hitrange, area, requirements, extraname, effect FROM technique"
    results = db.execute(text(query)).fetchall()

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
        if item_dict.get("extraname"):
            item_dict["name"] = f"{item_dict['name']} {item_dict['extraname']}"
        # Parse JSON fields for list view if needed, though typically done in detail
        if item_dict.get("requirements") and isinstance(item_dict["requirements"], str):
            try:
                item_dict["requirements"] = json.loads(item_dict["requirements"])
            except json.JSONDecodeError:
                item_dict["requirements"] = {}
        if item_dict.get("effect") and isinstance(item_dict["effect"], str):
            try:
                item_dict["effect"] = json.loads(item_dict["effect"])
            except json.JSONDecodeError:
                item_dict["effect"] = {}
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{technique_id}", response_model=dict)
def read_technique(technique_id: int, db: Session = Depends(get_db)):
    return read_technique_core(technique_id, db)


def read_technique_core(technique_id: int, db: Session):
    query = text("SELECT * FROM technique WHERE id = :id")
    result = db.execute(query, {"id": technique_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Technique not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f"{ret['name']} {ret['extraname']}"

    # Parse JSON fields
    for field in ["requirements", "effect"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret
