from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
from collections import defaultdict
import json


class TreasureboxResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/treasurebox", tags=["treasurebox"])


@router.get("/", response_model=TreasureboxResponse)
def read_treasureboxes(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve a list of tradegoods with optional pagination, searching, and sorting.
    """
    query = "SELECT distinct id, name, sell_period, price FROM treasurebox"

    # Initial fetch to get all data
    results = db.execute(text(query)).fetchall()

    # Filtering logic
    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]

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
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{treasurebox_id}", response_model=dict)
def read_treasurebox(treasurebox_id: int, db: Session = Depends(get_db)):
    return read_treasurebox_core(treasurebox_id, db)


def read_treasurebox_core(treasurebox_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single tradegood by its ID.
    """
    query = text("SELECT * FROM treasurebox WHERE id = :id")
    result = db.execute(query, {"id": treasurebox_id}).fetchall()

    if result is None or len(result) == 0:
        raise HTTPException(status_code=404, detail="Tradegood not found")

    # get name, description, sell_period, price
    ret = {}
    ret["name"] = result[0].name
    ret["description"] = result[0].description
    ret["sell_period"] = result[0].sell_period
    ret["price"] = result[0].price

    # parse items and aggregate them
    setname_items_dict = defaultdict(lambda: [])
    group_index = 0
    for row in result:

        setname = row.setname
        names = json.loads(row.names)
        item_ids = json.loads(row.item_ids)
        extras = json.loads(row.extras)
        count = row.count

        subitem_list = []
        for n, i in zip(names, item_ids):
            subitem = {}
            subitem["name"] = n
            subitem["id"] = i
            subitem_list.append(subitem)

        if extras:
            extra = extras[0]
            subitem_list[-1]["name"] += f" {extra}"

        row_dict = {"items": subitem_list, "count": count}
        if not setname:
            setname = group_index
            group_index += 1
        setname_items_dict[setname].append(row_dict)

    # convert setname_items_dict to dict
    item_dict = dict(setname_items_dict)
    ret["items"] = item_dict

    return ret
