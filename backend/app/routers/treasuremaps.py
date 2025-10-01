from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, text
from .. import models
from ..database import get_db
import json

router = APIRouter(prefix="/api/treasuremaps", tags=["treasuremaps"])


@router.get("/", response_model=Dict[str, Any])
def read_treasuremaps(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term for treasure map name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    results = db.execute(text("""
SELECT
    t.*,
    json_object(
        'id', a.id,
        'name', a.name
    ) AS destination_resolved
FROM treasuremap t
LEFT JOIN allData a
    ON CAST(t.destination AS INT) = a.id;

""")).fetchall()

    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]

    total = len(results)

    # do sorting
    if results:
        # Determine if the sort order is descending
        reverse = sort_order.lower() == "desc"

        # Define a sorting key function
        def sort_key(row):
            # Get the value of the sort_by attribute from the row
            value = getattr(row, sort_by, None)
            # Handle None values to prevent errors during sorting
            if value is None:
                return 0
            else:
                return value

        results.sort(key=sort_key, reverse=reverse)

    # do skip and limit
    treasure_maps = results[skip : skip + limit]
    print(treasure_maps)

    return_fields = [
        "id",
        "name",
        "description",
        "category",
        "required_skill",
        "academic_field",
        "library",
        "discovery",
        "city_conditions",
        "preceding",
        "reward_dukat",
        "reward_item",
        "strategy",
    ]

    ret_list = []
    for treasure_map in treasure_maps:
        ret = {field: getattr(treasure_map, field, None) for field in return_fields}
        ret['destination'] = json.loads(treasure_map.destination_resolved) if treasure_map.destination_resolved else None
        ret_list.append(ret)

    

    return {"items": ret_list, "total": total}


@router.get("/{treasuremap_id}", response_model=dict)
def read_treasuremap(treasuremap_id: int, db: Session = Depends(get_db)):
    treasure_map = (
        db.query(models.TreasureMap)
        .filter(models.TreasureMap.id == treasuremap_id)
        .first()
    )
    if treasure_map is None:
        raise HTTPException(status_code=404, detail="TreasureMap not found")

    return_fields = [
        "id",
        "name",
        "description",
        "category",
        "required_skill",
        "academic_field",
        "library",
        "destination",
        "discovery",
        "city_conditions",
        "preceding",
        "reward_dukat",
        "reward_item",
        "strategy",
    ]

    ret = {field: getattr(treasure_map, field, None) for field in return_fields}
    return ret
