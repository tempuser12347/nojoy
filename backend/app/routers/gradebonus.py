from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class GradeBonusResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/gradebonuses", tags=["gradebonuses"])


@router.get("/", response_model=GradeBonusResponse)
def read_gradebonuses(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, category FROM gradebonus"
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

    return {"items": paginated_results, "total": total}


@router.get("/{gradebonus_id}", response_model=dict)
def read_gradebonus(gradebonus_id: int, db: Session = Depends(get_db)):
    return read_gradebonus_core(gradebonus_id, db)


def read_gradebonus_core(gradebonus_id: int, db: Session):
    query = text("SELECT * FROM gradebonus WHERE id = :id")
    result = db.execute(query, {"id": gradebonus_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="GradeBonus not found")

    ret = dict(result._mapping)

    # Parse JSON fields
    for field in ["performance_improvement", "ship_skill"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                # if it's not a valid json, it might be a simple string
                pass

    return ret
