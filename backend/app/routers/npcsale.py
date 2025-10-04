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
    location_search: int = Query(None, description="Search term for city"),
    item_search: str = Query(None, description="Search term for item"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):

    query = """ 
SELECT
    n.id,
    n.npc,
    json_object(
        'id', n.location_id,
        'name', ad_loc.name
    ) AS location,
    json_group_array(
        json_object(
            'id', n.item_id,
            'name', ad_item.name
        )
    ) AS items
FROM npcsale AS n
LEFT JOIN allData AS ad_loc ON ad_loc.id = n.location_id
LEFT JOIN allData AS ad_item ON ad_item.id = n.item_id
GROUP BY n.id, n.npc, n.location_id, ad_loc.name;

"""

    results = db.execute(text(query)).fetchall()

    if npc_search:
        results = [row for row in results if npc_search.lower() in row.npc.lower()]

    if location_search:
        results = [
            row
            for row in results
            if location_search == (json.loads(row.city)["id"] if row.city else None)
        ]

    if item_search:
        filtered = []

        for row in results:
            items = json.loads(row.items)
            for item in items:
                if item_search.lower() in item["name"].lower():
                    filtered.append(row)
                    break
        results = filtered

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

    # convert items to dict list
    target_field_list = ["id", "npc"]
    item_list = []
    for item in items:
        item_dict = {}
        for field in target_field_list:
            item_dict[field] = getattr(item, field, None)
        item_dict["location"] = json.loads(item.location)
        item_dict["items"] = json.loads(item.items)
        item_list.append(item_dict)

    return {"items": item_list, "total": total}


@router.get("/{npc_id}", response_model=dict)
def read_npcsale_detail(npc_id: int, db: Session = Depends(get_db)):
    return read_npcsale_core(npc_id, db)


def read_npcsale_core(npc_id: int, db: Session = Depends(get_db)):

    query = """ 
SELECT
    n.id,
    n.npc,
    json_object(
        'id', n.location_id,
        'name', ad_loc.name
    ) AS location,
    json_group_array(
        json_object(
            'id', n.item_id,
            'name', ad_item.name,
            'price', n.price,
            'count', n.count,
            'progress', n.progress,
            'invest', n.invest,
            'contribution', n.contribution,
            'centralcity', n.centralcity,
            'era', n.era
        )
    ) AS items
FROM npcsale AS n
LEFT JOIN allData AS ad_loc ON ad_loc.id = n.location_id
LEFT JOIN allData AS ad_item ON ad_item.id = n.item_id
WHERE n.id = :npc_id
GROUP BY n.id, n.npc, n.location_id, ad_loc.name;

"""

    results = db.execute(text(query), {"npc_id": npc_id}).fetchone()

    if not results:
        raise HTTPException(status_code=404, detail="Npc not found")

    # convert to dict
    ret = {}
    ret["id"] = results.id
    ret["npc"] = results.npc
    ret["location"] = json.loads(results.location)
    ret["items"] = json.loads(results.items)

    return ret
