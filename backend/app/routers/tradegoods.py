from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class TradegoodResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/tradegoods", tags=["tradegoods"])


@router.get("/", response_model=TradegoodResponse)
def read_tradegoods(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    category_search: Optional[str] = Query(
        None, description="Search term for category"
    ),
    classification_search: Optional[str] = Query(
        None, description="Search term for classification"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve a list of tradegoods with optional pagination, searching, and sorting.
    """
    query = "SELECT * FROM tradegoods"

    # Initial fetch to get all data
    results = db.execute(text(query)).fetchall()

    # Filtering logic
    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]

    if category_search:
        results = [
            row
            for row in results
            if category_search.lower() in (row.category or "").lower()
        ]

    if classification_search:
        results = [
            row
            for row in results
            if classification_search.lower() in (row.classification or "").lower()
        ]

    # Sorting logic
    if sort_by:
        results.sort(
            key=lambda x: getattr(x, sort_by) or "",
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    # Process results to handle JSON in 'culture'
    items = []
    for row in paginated_results:
        item_dict = dict(row._mapping)
        if item_dict.get("culture"):
            try:
                item_dict["culture"] = json.loads(item_dict["culture"])
            except (json.JSONDecodeError, TypeError):
                # If it's not valid JSON, keep the original string
                pass
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{tradegood_id}", response_model=dict)
def read_tradegood(tradegood_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single tradegood by its ID.
    """
    query = text("SELECT * FROM tradegoods WHERE id = :id")
    result = db.execute(query, {"id": tradegood_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Tradegood not found")

    item_dict = dict(result._mapping)
    if item_dict.get("culture"):
        try:
            item_dict["culture"] = json.loads(item_dict["culture"])
        except (json.JSONDecodeError, TypeError):
            pass

    return item_dict
