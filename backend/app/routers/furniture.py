from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json
from ..common import fetch_all_obtain_methods


class FurnitureResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/furnitures", tags=["furnitures"])


@router.get("/", response_model=FurnitureResponse)
def read_furnitures(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    category_search: Optional[str] = Query(
        None, description="Comma-separated list of categories to filter by"
    ),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, extraname, description, category, installation_effect FROM furniture"
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    for row in results:
        if row.get("installation_effect") and isinstance(row["installation_effect"], str):
            try:
                effect_data = json.loads(row["installation_effect"])
                row["installation_effect_type"] = effect_data.get("type")
                row["installation_effect_value"] = effect_data.get("value")
            except json.JSONDecodeError:
                row["installation_effect_type"] = None
                row["installation_effect_value"] = None

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
            or name_search.lower() in (row.get("extraname") or "").lower()
        ]

    if category_search:
        categories = [c.strip().lower() for c in category_search.split(",")]
        results = [
            row for row in results if (row.get("category") or "").lower() in categories
        ]

    valid_sort_columns = ["id", "name", "extraname", "description", "category", "installation_effect_type", "installation_effect_value"]
    if sort_by not in valid_sort_columns:
        raise HTTPException(status_code=400, detail=f"Invalid sort_by column: {sort_by}")

    if sort_by:
        if sort_by in ['installation_effect_value']:
            sort_f = lambda x: x.get(sort_by) if x.get(sort_by) is not None else -1
        else:
            sort_f = lambda x: x.get(sort_by) if x.get(sort_by) is not None else ''

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


@router.get("/{furniture_id}", response_model=dict)
def read_furniture(furniture_id: int, db: Session = Depends(get_db)):
    return read_furniture_core(furniture_id, db)


def read_furniture_core(furniture_id: int, db: Session):
    query = text("SELECT * FROM furniture WHERE id = :id")
    result = db.execute(query, {"id": furniture_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Furniture not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f'{ret["name"]} {ret["extraname"]}'

    # Parse JSON fields
    if ret.get("installation_effect") and isinstance(ret["installation_effect"], str):
        try:
            ret["installation_effect"] = json.loads(ret["installation_effect"])
        except json.JSONDecodeError:
            ret["installation_effect"] = None

    
    obtain_method_list = fetch_all_obtain_methods(furniture_id, db)
    if obtain_method_list:
        ret["obtain_method"] = obtain_method_list

    return ret
