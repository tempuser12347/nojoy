from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class PetResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/pets", tags=["pets"])


@router.get("/", response_model=PetResponse)
def read_pets(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, extraname, description, apartment_rank, certificate, feed, skills FROM pet"
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
        # Parse JSON fields for list view if needed
        for field in ["certificate", "feed", "skills"]:
            if item_dict.get(field) and isinstance(item_dict[field], str):
                try:
                    item_dict[field] = json.loads(item_dict[field])
                except json.JSONDecodeError:
                    item_dict[field] = None
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{pet_id}", response_model=dict)
def read_pet(pet_id: int, db: Session = Depends(get_db)):
    return read_pet_core(pet_id, db)


def read_pet_core(pet_id: int, db: Session):
    query = text("SELECT * FROM pet WHERE id = :id")
    result = db.execute(query, {"id": pet_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Pet not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f"{ret['name']} {ret['extraname']}"

    # Parse JSON fields
    for field in ["certificate", "feed", "skills"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret