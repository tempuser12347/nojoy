from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class GradePerformanceResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/gradeperformances", tags=["gradeperformances"])


@router.get("/", response_model=GradePerformanceResponse)
def read_gradeperformances(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, ship_size, ship_type, grade, accumulated_stats FROM gradeperformance"
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


@router.get("/{gradeperformance_id}", response_model=dict)
def read_gradeperformance(gradeperformance_id: int, db: Session = Depends(get_db)):
    return read_gradeperformance_core(gradeperformance_id, db)


def read_gradeperformance_core(gradeperformance_id: int, db: Session):
    query = text("SELECT * FROM gradeperformance WHERE id = :id")
    result = db.execute(query, {"id": gradeperformance_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="GradePerformance not found")

    ret = dict(result._mapping)

    # Parse JSON fields
    if ret.get("accumulated_stats") and isinstance(ret["accumulated_stats"], str):
        try:
            ret["accumulated_stats"] = json.loads(ret["accumulated_stats"])
        except json.JSONDecodeError:
            ret["accumulated_stats"] = None

    return ret
