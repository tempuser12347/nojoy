from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class ShipDecorResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/shipdecors", tags=["shipdecors"])


@router.get("/", response_model=ShipDecorResponse)
def read_shipdecors(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, extraname, description, positions FROM shipdecor"
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    for row in results:
        if row.get("positions") and isinstance(row["positions"], str):
            try:
                positions_data = json.loads(row["positions"])
                row["flag"] = positions_data.get("flag", False)
                row["side_front_right"] = positions_data.get("side_front_right", False)
                row["side_front_left"] = positions_data.get("side_front_left", False)
                row["side_rear_right"] = positions_data.get("side_rear_right", False)
                row["side_rear_left"] = positions_data.get("side_rear_left", False)
            except json.JSONDecodeError:
                raise Exception(f'failed to parse {row.get("positions")}  of id ={row.get("id")}')
                # row["flag"] = False
                # row["side_front_right"] = False
                # row["side_front_left"] = False
                # row["side_rear_right"] = False
                # row["side_rear_left"] = False

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
        if item_dict.get("extraname"):
            item_dict["name"] = f'{item_dict["name"]} {item_dict["extraname"]}'
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{shipdecor_id}", response_model=dict)
def read_shipdecor(shipdecor_id: int, db: Session = Depends(get_db)):
    return read_shipdecor_core(shipdecor_id, db)


def read_shipdecor_core(shipdecor_id: int, db: Session):
    query = text("SELECT * FROM shipdecor WHERE id = :id")
    result = db.execute(query, {"id": shipdecor_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="ShipDecor not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f'{ret["name"]} {ret["extraname"]}'

    # Parse JSON fields
    if ret.get("positions") and isinstance(ret["positions"], str):
        try:
            ret["positions"] = json.loads(ret["positions"])
        except json.JSONDecodeError:
            ret["positions"] = {}

    return ret
