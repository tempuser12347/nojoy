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
    category_search: str = Query(
        None, description="Search term for treasure map category"
    ),
    academic_field_search: str = Query(
        None, description="Search term for academic field"
    ),
    library_search: str = Query(None, description="Search term for library"),
    destination_search: str = Query(None, description="Search term for destination"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    results = db.execute(
        text(
            """
SELECT
    t.*,
    json_object(
        'id', a.id,
        'name', a.name
    ) AS destination_resolved
FROM treasuremap t
LEFT JOIN allData a
    ON CAST(t.destination AS INT) = a.id;

"""
        )
    ).fetchall()

    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]
    if category_search:
        print(f"category_search: {category_search}")
        results = [
            row for row in results if category_search.lower() == row.category.lower()
        ]
    if academic_field_search:
        print(f"academic_field_search: {academic_field_search}")
        results = [
            row
            for row in results
            if academic_field_search.lower() == row.academic_field.lower()
        ]
    if library_search:
        print(f"library_search: {library_search}")
        # split library search by comma
        library_terms = [term.strip().lower() for term in library_search.split(",")]
        # if each row library contains at least one of the library terms, then it is okay. the row library is also a comma seperated string to split it before matching
        results = [
            row
            for row in results
            if any(
                term in map(lambda x: x.strip(), (row.library or "").split(","))
                for term in library_terms
            )
        ]

    if destination_search:
        print(f"destination_search: {destination_search}")
        filtered = []
        for row in results:
            if row.destination_resolved:
                dest = json.loads(row.destination_resolved)
                if destination_search.lower() in dest["name"].lower():
                    filtered.append(row)
        results = filtered

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
    # print(treasure_maps)

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
        ret["destination"] = (
            json.loads(treasure_map.destination_resolved)
            if treasure_map.destination_resolved
            else None
        )
        ret_list.append(ret)

    return {"items": ret_list, "total": total}


@router.get("/{treasuremap_id}", response_model=dict)
def read_treasuremap(treasuremap_id: int, db: Session = Depends(get_db)):
    return read_treasuremap_core(treasuremap_id, db)


def read_treasuremap_core(treasuremap_id: int, db: Session = Depends(get_db)):

    result = db.execute(
        text(
            """
SELECT
    t.*,
    -- destination as JSON
    json_object(
        'id', adest.id,
        'name', adest.name
    ) AS destination_resolved,

    -- discovery as JSON
    json_object(
        'id', adisc.id,
        'name', adisc.name
    ) AS discovery_resolved


FROM treasuremap t

-- join for destination
LEFT JOIN allData adest
    ON CAST(t.destination AS INT) = adest.id

-- join for discovery
LEFT JOIN allData adisc
    ON CAST(t.discovery AS INT) = adisc.id



WHERE t.id = :treasuremap_id

-- important: group by t.id so json_group_array works
GROUP BY t.id;



"""
        ),
        {"treasuremap_id": treasuremap_id},
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="TreasureMap not found")
    
    # fill preceding data

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

    ret = {field: getattr(result, field, None) for field in return_fields}
    ret["destination"] = (
        json.loads(result.destination_resolved) if result.destination_resolved else None
    )

    if ret['preceding']:
        preceding_ids = [int(pid) for pid in ret['preceding'].split(",") if pid.strip().isdigit()]
        preceding_data = []
        for pid in preceding_ids:
            pdata = db.execute(
                text("SELECT id, name FROM allData WHERE id = :id"),
                {"id": pid}
            ).fetchone()
            if pdata:
                preceding_data.append({"id": pdata.id, "name": pdata.name})
        # override preceding with resolved data
        if not preceding_data:
            preceding_data = None
        ret['preceding'] = preceding_data
    else:
        ret['preceding'] = None
    # ret["preceding"] = (
    #     json.loads(result.preceding_resolved) if result.preceding_resolved else None
    # )
    ret["discovery"] = (
        json.loads(result.discovery_resolved) if result.discovery_resolved else None
    )
    return ret
