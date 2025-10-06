from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.database import get_db
from app import models
import json

router = APIRouter(prefix="/api/region", tags=["region"])


@router.get("/")
async def get_regions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "name",
    sort_order: str = "asc",
):

    results = db.execute(
        text(
            """
    select id, name from allData where category="region"
"""
        )
    ).fetchall()

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

    # convert to dict
    fetch_field_list = ["id", "name"]

    item_dict_list = []
    for item in items:
        item_dict = {}
        for field in fetch_field_list:
            item_dict[field] = getattr(item, field, None)
        item_dict_list.append(item_dict)

    return {"items": item_dict_list, "total": total}


@router.get("/{region_id}")
async def get_region(region_id: int, db: Session = Depends(get_db)):
    return get_region_core(region_id, db)


def get_region_core(region_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        text(
            """
select id, name from allData where id=:id
"""
        ),
        {"id": region_id},
    ).fetchone()

    # discovery = db.query(models.Discovery).filter(models.Discovery.id == discovery_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Discovery not found")

    ret = {
        "id": result.id,
        "name": result.name,
    }

    return ret
