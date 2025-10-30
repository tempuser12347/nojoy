from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json
import re


class ShipMaterialResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/shipmaterials", tags=["shipmaterials"])


@router.get("/", response_model=ShipMaterialResponse)
def read_shipmaterials(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, extraname, durability, vertical_sail, horizontal_sail, rowing_power, maneuverability, wave_resistance, armor, cabin, gunport, cargo FROM shipmaterial"
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    def parse_sort_value(value):
        if isinstance(value, str):
            match = re.match(r"^(-?\d+)", value)
            return int(match.group(1)) if match else value
        if value is None:
            return float('-inf')  # Treat None as smallest possible
        return value

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
            or name_search.lower() in (row.get("extraname") or "").lower()
        ]

    if sort_by:
        # Define columns that require custom numeric parsing
        numeric_string_columns = [
            "durability", "vertical_sail", "horizontal_sail", "rowing_power",
            "maneuverability", "wave_resistance", "armor", "cabin", "gunport", "cargo"
        ]
        if sort_by in numeric_string_columns:
            results.sort(
                key=lambda x: parse_sort_value(x.get(sort_by, "")), # Default to empty string for missing values
                reverse=(sort_order.lower() == "desc"),
            )
        else:
            results.sort(
                key=lambda x: x.get(sort_by) or "",
                reverse=(sort_order.lower() == "desc"),
            )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    items = []
    for row in paginated_results:
        item_dict = dict(row)
        if item_dict.get("extraname"):
            item_dict["name"] = f'{item_dict["name"]} {item_dict["extraname"]}'
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{shipmaterial_id}", response_model=dict)
def read_shipmaterial(shipmaterial_id: int, db: Session = Depends(get_db)):
    return read_shipmaterial_core(shipmaterial_id, db)


def read_shipmaterial_core(shipmaterial_id: int, db: Session):
    query = text("SELECT * FROM shipmaterial WHERE id = :id")
    result = db.execute(query, {"id": shipmaterial_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="ShipMaterial not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f'{ret["name"]} {ret["extraname"]}'

    # Parse JSON fields
    for field in ["base_ship_material", "features"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret
