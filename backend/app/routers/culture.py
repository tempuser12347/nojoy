from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json

class CultureResponse(BaseModel):
    items: List[dict]
    total: int

router = APIRouter(prefix="/api/cultures", tags=["cultures"])

@router.get("/", response_model=CultureResponse)
def read_cultures(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search for a culture by name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT * FROM culture"
    results = db.execute(text(query)).fetchall()

    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]

    # Sorting logic
    if results and hasattr(results[0], sort_by):
        reverse = sort_order.lower() == "desc"
        
        is_numeric = False
        for row in results:
            val = getattr(row, sort_by)
            if val is not None:
                if isinstance(val, (int, float)):
                    is_numeric = True
                break
        
        if is_numeric:
            results.sort(key=lambda r: getattr(r, sort_by) if getattr(r, sort_by) is not None else float('-inf'), reverse=reverse)
        else:
            results.sort(key=lambda r: str(getattr(r, sort_by)) if getattr(r, sort_by) is not None else '', reverse=reverse)

    total = len(results)
    paginated_results = results[skip : skip + limit]

    items = [dict(row._mapping) for row in paginated_results]

    return {"items": items, "total": total}

@router.get("/{culture_id}", response_model=dict)
def read_culture(culture_id: int, db: Session = Depends(get_db)):
    result = db.execute(text("SELECT * FROM culture WHERE id = :id"), {"id": culture_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Culture not found")

    return dict(result._mapping)
