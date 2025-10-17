from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class MajorResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/majors", tags=["majors"])


@router.get("/", response_model=MajorResponse)
def read_majors(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, category, acquisition_conditions FROM major"
    results = db.execute(text(query)).fetchall()

    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
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
        if item_dict.get("acquisition_conditions") and isinstance(item_dict["acquisition_conditions"], str):
            try:
                item_dict["acquisition_conditions"] = json.loads(item_dict["acquisition_conditions"])
            except json.JSONDecodeError:
                item_dict["acquisition_conditions"] = {}
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{major_id}", response_model=dict)
def read_major(major_id: int, db: Session = Depends(get_db)):
    return read_major_core(major_id, db)


def read_major_core(major_id: int, db: Session):
    query = text("SELECT * FROM major WHERE id = :id")
    result = db.execute(query, {"id": major_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Major not found")

    ret = dict(result._mapping)

    if ret.get("acquisition_conditions") and isinstance(ret["acquisition_conditions"], str):
        try:
            ret["acquisition_conditions"] = json.loads(ret["acquisition_conditions"])
        except json.JSONDecodeError:
            ret["acquisition_conditions"] = {}

    return ret
