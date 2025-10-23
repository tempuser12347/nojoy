from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db

class CannonResponse(BaseModel):
    items: List[dict]
    total: int

router = APIRouter(prefix="/api/cannons", tags=["cannons"])

@router.get("/", response_model=CannonResponse)
def read_cannons(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, category, shell_type, durability, penetration, shoot_range, shell_speed, blast_radius, reload_speed FROM cannon"
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

@router.get("/{cannon_id}", response_model=dict)
def read_cannon(cannon_id: int, db: Session = Depends(get_db)):
    return read_cannon_core(cannon_id, db)

def read_cannon_core(cannon_id: int, db: Session):
    query = text("SELECT * FROM cannon WHERE id = :id")
    result = db.execute(query, {"id": cannon_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Cannon not found")

    return dict(result._mapping)
