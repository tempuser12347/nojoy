from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class SeaResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/seas", tags=["seas"])


@router.get("/", response_model=SeaResponse)
def read_seas(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search for a sea by name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT * FROM sea"
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

    items = []
    for row in paginated_results:
        item = dict(row._mapping)
        try:
            item['region'] = json.loads(item['region']) if item['region'] else None
        except (json.JSONDecodeError, TypeError):
            item['region'] = None
        try:
            item['gatherable'] = json.loads(item['gatherable']) if item['gatherable'] else None
        except (json.JSONDecodeError, TypeError):
            item['gatherable'] = None
        items.append(item)

    return {"items": items, "total": total}


@router.get("/{sea_id}", response_model=dict)
def read_sea(sea_id: int, db: Session = Depends(get_db)):
    result = db.execute(text("SELECT * FROM sea WHERE id = :id"), {"id": sea_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Sea not found")

    sea = dict(result._mapping)

    try:
        sea['region'] = json.loads(sea['region']) if sea['region'] else None
    except (json.JSONDecodeError, TypeError):
        sea['region'] = None
    try:
        sea['gatherable'] = json.loads(sea['gatherable']) if sea['gatherable'] else None
    except (json.JSONDecodeError, TypeError):
        sea['gatherable'] = None

    # Parse boundary
    if sea['boundary']:
        try:
            boundary_dict = {}
            parts = sea['boundary'].split(', ')
            for part in parts:
                key, value = part.split(' : ')
                boundary_dict[key.strip()] = int(value.strip())
            sea['boundary'] = boundary_dict
        except (ValueError, IndexError):
            # Keep as string if parsing fails
            pass

    return sea
