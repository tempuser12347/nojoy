from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class ShipBaseMaterialResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/shipbasematerials", tags=["shipbasematerials"])


@router.get("/", response_model=ShipBaseMaterialResponse)
def read_shipbasematerials(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, durability, vertical_sail, horizontal_sail, normal_build FROM shipbasematerial"
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


@router.get("/{shipbasematerial_id}", response_model=dict)
def read_shipbasematerial(shipbasematerial_id: int, db: Session = Depends(get_db)):
    return read_shipbasematerial_core(shipbasematerial_id, db)


def read_shipbasematerial_core(shipbasematerial_id: int, db: Session):
    query = text("SELECT * FROM shipbasematerial WHERE id = :id")
    result = db.execute(query, {"id": shipbasematerial_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="ShipBaseMaterial not found")

    return dict(result._mapping)
