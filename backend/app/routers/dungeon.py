from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class DungeonResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/dungeons", tags=["dungeons"])


@router.get("/", response_model=DungeonResponse)
def read_dungeons(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, extraname, description, category, floors, dungeon_rank, dungeon_exploration, boarding_pass, entrance, requirements, discoveries, acquisition_items FROM dungeon"
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

    # Process JSON fields for display/sorting
    for row in results:
        if row.get("entrance") and isinstance(row["entrance"], str):
            try:
                row["entrance"] = json.loads(row["entrance"])
            except json.JSONDecodeError:
                row["entrance"] = None
        if row.get("requirements") and isinstance(row["requirements"], str):
            try:
                row["requirements_objects"] = json.loads(row["requirements"])
            except json.JSONDecodeError:
                row["requirements_objects"] = []
        if row.get("discoveries") and isinstance(row["discoveries"], str):
            try:
                row["discoveries_objects"] = [d["discovery"] for d in json.loads(row["discoveries"])]
            except json.JSONDecodeError:
                row["discoveries_objects"] = []
        if row.get("acquisition_items") and isinstance(row["acquisition_items"], str):
            try:
                row["acquisition_items_objects"] = json.loads(row["acquisition_items"])
            except json.JSONDecodeError:
                row["acquisition_items_objects"] = {}

    if sort_by:
        if sort_by in ['floors', 'dungeon_rank', 'dungeon_exploration', 'boarding_pass']:
            sort_f = lambda x: x.get(sort_by) or -1
        elif sort_by in ['discoveries_objects']:
            sort_f = lambda x: len(x.get(sort_by)) if x.get(sort_by, None) is not None else -1
        else:
            sort_f = lambda x: x.get(sort_by) or ''
        results.sort(
            key=sort_f,
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


@router.get("/{dungeon_id}", response_model=dict)
def read_dungeon(dungeon_id: int, db: Session = Depends(get_db)):
    return read_dungeon_core(dungeon_id, db)


def read_dungeon_core(dungeon_id: int, db: Session):
    query = text("SELECT * FROM dungeon WHERE id = :id")
    result = db.execute(query, {"id": dungeon_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Dungeon not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f'{ret["name"]} {ret["extraname"]}'

    # Parse JSON fields
    for field in ["entrance", "requirements", "discoveries", "acquisition_items"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret