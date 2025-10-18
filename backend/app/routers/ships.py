from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, text
from app.database import get_db
from app import models
from ..common import fetch_all_obtain_methods
import json 


router = APIRouter(prefix="/api/ships", tags=["ships"])


@router.get("/", response_model=Dict[str, Any])
def read_ships(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term for ship name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = """
        SELECT
            id,
            name,
            extraname,
            required_levels,
            json_extract(required_levels, '$.adventure') AS required_levels_adventure,
            json_extract(required_levels, '$.trade') AS required_levels_trade,
            json_extract(required_levels, '$.battle') AS required_levels_battle,
            base_material,
            upgrade_count,
            capacity,
            json_extract(capacity, '$.cabin') AS capacity_cabin,
            json_extract(capacity, '$.required_crew') AS capacity_required_crew,
            json_extract(capacity, '$.gunport') AS capacity_gunport,
            json_extract(capacity, '$.cargo') AS capacity_cargo,
            category,
            json_extract(category, '$.purpose') AS category_purpose,
            json_extract(category, '$.size') AS category_size,
            json_extract(category, '$.propulsion') AS category_propulsion,
            base_performance,
            json_extract(base_performance, '$.durability') AS base_performance_durability,
            json_extract(base_performance, '$.vertical_sail') AS base_performance_vertical_sail,
            json_extract(base_performance, '$.horizontal_sail') AS base_performance_horizontal_sail,
            json_extract(base_performance, '$.rowing_power') AS base_performance_rowing_power,
            json_extract(base_performance, '$.maneuverability') AS base_performance_maneuverability,
            json_extract(base_performance, '$.wave_resistance') AS base_performance_wave_resistance,
            json_extract(base_performance, '$.armor') AS base_performance_armor,
            improvement_limit,
            json_extract(improvement_limit, '$.durability') AS improvement_limit_durability,
            json_extract(improvement_limit, '$.vertical_sail') AS improvement_limit_vertical_sail,
            json_extract(improvement_limit, '$.horizontal_sail') AS improvement_limit_horizontal_sail,
            json_extract(improvement_limit, '$.rowing_power') AS improvement_limit_rowing_power,
            json_extract(improvement_limit, '$.maneuverability') AS improvement_limit_maneuverability,
            json_extract(improvement_limit, '$.wave_resistance') AS improvement_limit_wave_resistance,
            json_extract(improvement_limit, '$.armor') AS improvement_limit_armor,
            json_extract(improvement_limit, '$.cabin') AS improvement_limit_cabin,
            json_extract(improvement_limit, '$.gunport') AS improvement_limit_gunport,
            json_extract(improvement_limit, '$.cargo') AS improvement_limit_cargo
        FROM ship
    """
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
            or name_search.lower() in (row.get("extraname") or "").lower()
        ]

    if sort_by:
        results.sort(
            key=lambda x: x.get(sort_by) or "",
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    items = []
    for row in paginated_results:
        item_dict = dict(row)
        # Parse JSON fields for list view
        for field in ["base_material", "upgrade_count"]:
            if item_dict.get(field) and isinstance(item_dict[field], str):
                try:
                    item_dict[field] = json.loads(item_dict[field])
                except json.JSONDecodeError:
                    item_dict[field] = None
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{ship_id}", response_model=dict)
def read_ship(ship_id: int, db: Session = Depends(get_db)):
    return read_ship_core(ship_id, db)


def read_ship_core(ship_id: int, db: Session):
    query = text("SELECT * FROM ship WHERE id = :id")
    result = db.execute(query, {"id": ship_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Ship not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f"{ret['name']} {ret['extraname']}"

    # Parse JSON fields
    for field in [
        "required_levels",
        "base_material",
        "upgrade_count",
        "build_info",
        "base_performance",
        "capacity",
        "improvement_limit",
        "ship_parts",
        "ship_skills",
        "ship_deco",
        "special_build_cities",
        "standard_build_cities",
        "category",
    ]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret
