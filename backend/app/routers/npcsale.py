from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from .. import models
from ..database import get_db
import json


class NpcSaleResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/npcsale", tags=["npcsale"])


@router.get("/", response_model=NpcSaleResponse)
def read_npcsale(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    npc_search: str = Query(None, description="Search term for npc"),
    city_search: str = Query(None, description="Search term for city"),
    item_search: str = Query(None, description="Search term for item"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):

    query = "SELECT * FROM npcsale"
    
    results = db.execute(text(query)).fetchall()

    if npc_search:
        results = [row for row in results if npc_search.lower() in row.npc.lower()]
    
    if city_search:
        results = [row for row in results if city_search.lower() in row.city.lower()]

    if item_search:
        results = [row for row in results if item_search.lower() in row.item.lower()]


    # Sorting logic
    if results:
        # Determine if the sort order is descending
        reverse = sort_order.lower() == "desc"

        # Define a sorting key function
        def sort_key(row):
            # Get the value of the sort_by attribute from the row
            value = getattr(row, sort_by, None)
            # Handle None values to prevent errors during sorting
            if value is None:
                # Treat None as a very small number for numeric types or an empty string for others
                # This ensures they are sorted at the beginning (for asc) or end (for desc)
                return (
                    (0, "")
                    if isinstance(getattr(results[0], sort_by, None), (int, float))
                    else ""
                )
            return value

        results.sort(key=sort_key, reverse=reverse)

    total = len(results)
    items = results[skip : skip + limit]

    return {"items": items, "total": total}
