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
    purpose_search: str = Query(
        None, description="Comma-separated list of purposes to filter by"
    ),
    size_search: str = Query(
        None, description="Comma-separated list of sizes to filter by"
    ),
    propulsion_search: str = Query(
        None, description="Comma-separated list of propulsions to filter by"
    ),
    ship_skill_search: str = Query(
        None, description="Comma-separated list of ship skills to filter by"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):

    query_parts = []
    params = {}

    select_clause = """
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
                    -- max limit
                    json_extract(base_performance, '$.durability') + json_extract(improvement_limit, '$.durability') AS max_durability,
                    json_extract(base_performance, '$.vertical_sail') + json_extract(improvement_limit, '$.vertical_sail') AS max_vertical_sail,
                    json_extract(base_performance, '$.horizontal_sail') + json_extract(improvement_limit, '$.horizontal_sail') AS max_horizontal_sail,
                    json_extract(base_performance, '$.rowing_power') + json_extract(improvement_limit, '$.rowing_power') AS max_rowing_power,
                    json_extract(base_performance, '$.maneuverability') + json_extract(improvement_limit, '$.maneuverability') AS max_maneuverability,
                    json_extract(base_performance, '$.wave_resistance') + json_extract(improvement_limit, '$.wave_resistance') AS max_wave_resistance,
                    json_extract(base_performance, '$.armor') + json_extract(improvement_limit, '$.armor') AS max_armor,
                    json_extract(capacity, '$.cabin') + json_extract(improvement_limit, '$.cabin') AS max_cabin,
                    json_extract(capacity, '$.gunport') + json_extract(improvement_limit, '$.gunport') AS max_gunport,
                    json_extract(capacity, '$.cargo') + json_extract(improvement_limit, '$.cargo') AS max_cargo,
                    -- custom metric
                    json_extract(base_performance, '$.vertical_sail') + json_extract(improvement_limit, '$.vertical_sail') + json_extract(base_performance, '$.horizontal_sail') + json_extract(improvement_limit, '$.horizontal_sail') as max_sum_sail ,
                    json_extract(base_performance, '$.vertical_sail') + json_extract(improvement_limit, '$.vertical_sail') + json_extract(base_performance, '$.horizontal_sail') + json_extract(improvement_limit, '$.horizontal_sail') + json_extract(base_performance, '$.rowing_power') + json_extract(improvement_limit, '$.rowing_power') as max_sum_sail_row_power,
                    ship_skills
                FROM ship    """

    query_parts.append(select_clause)
    where_clauses = []
    if name_search:
        where_clauses.append("(name LIKE :name_search OR extraname LIKE :name_search)")
        params["name_search"] = f"%{name_search}%"

    if purpose_search:
        purposes = purpose_search.split(",")
        purpose_conditions = [
            f"json_extract(category, '$.purpose') = :purpose_{i}"
            for i in range(len(purposes))
        ]
        where_clauses.append(f"({' OR '.join(purpose_conditions)})")
        for i, purpose in enumerate(purposes):
            params[f"purpose_{i}"] = purpose

    if size_search:
        sizes = size_search.split(",")
        size_conditions = [
            f"json_extract(category, '$.size') = :size_{i}" for i in range(len(sizes))
        ]
        where_clauses.append(f"({' OR '.join(size_conditions)})")
        for i, size in enumerate(sizes):
            params[f"size_{i}"] = size

    if propulsion_search:
        propulsions = propulsion_search.split(",")
        propulsion_conditions = [
            f"json_extract(category, '$.propulsion') = :propulsion_{i}"
            for i in range(len(propulsions))
        ]
        where_clauses.append(f"({' OR '.join(propulsion_conditions)})")
        for i, propulsion in enumerate(propulsions):
            params[f"propulsion_{i}"] = propulsion

    if where_clauses:
        query_parts.append("WHERE " + " AND ".join(where_clauses))

    query = " ".join(query_parts)

    results = db.execute(text(query), params).fetchall()

    if ship_skill_search:
        skill_terms = [s.strip() for s in ship_skill_search.split(",")]
        # print("Filtering ship skills with terms:", skill_terms)
        filtered_results = []
        for row in results:
            ship_skills = []
            if row.ship_skills and isinstance(row.ship_skills, str):
                try:
                    ship_skills = json.loads(row.ship_skills)
                except json.JSONDecodeError:
                    raise Exception("Invalid JSON in ship_skills field")
            skill_names = [skill.get("skill").get("name") for skill in ship_skills]
            if all(term in skill_names for term in skill_terms):
                filtered_results.append(row)
        results = filtered_results

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    if sort_by:

        def get_sort_key(row):
            value = row.get(sort_by, None)
            if value is None:
                if sort_by in [
                    "id",
                    "required_levels_adventure",
                    "required_levels_trade",
                    "required_levels_battle",
                    "capacity_cabin",
                    "capacity_required_crew",
                    "capacity_gunport",
                    "capacity_cargo",
                    "category_purpose",
                    "category_size",
                    "category_propulsion",
                    "base_performance_durability",
                    "base_performance_vertical_sail",
                    "base_performance_horizontal_sail",
                    "base_performance_rowing_power",
                    "base_performance_maneuverability",
                    "base_performance_wave_resistance",
                    "base_performance_armor",
                    "improvement_limit_durability",
                    "improvement_limit_vertical_sail",
                    "improvement_limit_horizontal_sail",
                    "improvement_limit_rowing_power",
                    "improvement_limit_maneuverability",
                    "improvement_limit_wave_resistance",
                    "improvement_limit_armor",
                    "improvement_limit_cabin",
                    "improvement_limit_gunport",
                    "improvement_limit_cargo",
                    "max_durability",
                    "max_vertical_sail",
                    "max_horizontal_sail",
                    "max_rowing_power",
                    "max_maneuverability",
                    "max_wave_resistance",
                    "max_armor",
                    "max_cabin",
                    "max_gunport",
                    "max_cargo",
                    "max_sum_sail",
                    "max_sum_sail_row_power",
                ]:
                    return -1  # Treat None as less than any number
                else:
                    return ""  # Treat None as less than any string
            else:
                return value

        results.sort(
            key=get_sort_key,
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

    obtain_method_list = fetch_all_obtain_methods(ship_id, db)
    if obtain_method_list:
        ret["obtain_method"] = obtain_method_list

    return ret
