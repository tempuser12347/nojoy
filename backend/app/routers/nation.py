from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class NationResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/nations", tags=["nations"])


@router.get("/", response_model=NationResponse)
def read_nations(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, npc_nation, is_basic FROM nation"
    results = db.execute(text(query)).fetchall()

    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]

    if sort_by:
        results.sort(
            key=lambda x: getattr(x, sort_by) or "",
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    items = [dict(row._mapping) for row in paginated_results]

    return {"items": items, "total": total}


@router.get("/{nation_id}", response_model=dict)
def read_nation(nation_id: int, db: Session = Depends(get_db)):
    return read_nation_core(nation_id, db)


def read_nation_core(nation_id: int, db: Session):
    query = text("SELECT * FROM nation WHERE id = :id")
    result = db.execute(query, {"id": nation_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Nation not found")

    return dict(result._mapping)
