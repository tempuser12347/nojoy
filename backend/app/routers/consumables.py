from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from ..database import get_db
from ..common import (
    fetch_all_obtain_methods,
)
import json


def normalize_items(raw):
    """
    Convert [{"1881": 1}, {"1890": 1}] → [{"id": 1881, "value": 1}, ...]
    """
    if not raw:
        return None
    try:
        lst = json.loads(raw)
        normalized = []
        for d in lst:
            for k, v in d.items():
                normalized.append({"id": int(k), "value": v})
        if not normalized:
            return None
        return normalized
    except Exception:
        return None


def handle_usage_effect(raw):
    if not raw:
        return []
    parsed_list = json.loads(raw)
    ret_list = []
    for a in parsed_list:
        o = {"id": a["ref"], "name": a["name"]}
        if "value" in a:
            o["value"] = a["value"]
        ret_list.append(o)

    return ret_list


class ConsumableResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/consumables", tags=["consumables"])


@router.get("/", response_model=ConsumableResponse)
def read_consumables(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit number of records returned"),
    name_search: Optional[str] = Query(None, description="Search by name"),
    category: Optional[str] = Query(None, description="Search by category"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    results = db.execute(text("SELECT * FROM consumable")).fetchall()

    # Apply filters
    if name_search:
        results = [
            row for row in results if name_search.lower() in (row.name or "").lower()
        ]

    if category:
        term_list = category.split(",")
        results = [row for row in results if row.category in term_list]

    # do sorting
    if results:
        reverse = sort_order.lower() == "desc"

        def sort_key(row):
            value = getattr(row, sort_by, None)
            if value is None:
                return (
                    (0, "")
                    if isinstance(getattr(results[0], sort_by, None), (int, float))
                    else ""
                )
            return value

        results.sort(key=sort_key, reverse=reverse)

    total = len(results)
    consumables = results[skip : skip + limit]

    ret_list = []
    for c in consumables:
        ret = {
            "id": c.id,
            "type": c.type,
            "name": c.name,
            "additional_name": c.additional_Name,
            "description": c.description,
            "category": c.category,
            "usage_effect": handle_usage_effect(c.usage_Effect),
            "features": c.features if c.features else None,
            "item": normalize_items(c.Item),
        }
        ret_list.append(ret)

    return {"items": ret_list, "total": total}


@router.get("/{consumable_id}", response_model=dict)
def read_consumable(consumable_id: int, db: Session = Depends(get_db)):
    return read_consumable_core(consumable_id, db)


def read_consumable_core(consumable_id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT * FROM consumable WHERE id = :id"), {"id": consumable_id}
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Consumable not found")

    ret = {
        "id": row.id,
        "type": row.type,
        "name": row.name,
        "additional_name": row.additional_Name,
        "description": row.description,
        "category": row.category,
        "usage_effect": handle_usage_effect(row.usage_Effect),
        "features": row.features if row.features else None,
        "item": normalize_items(row.Item),
    }

    # get names of item
    if ret["item"]:
        for item in ret["item"]:
            itemid = item["id"]
            name = db.execute(
                text("SELECT name FROM allData WHERE id = :id"), {"id": itemid}
            ).fetchone()
            if name:
                item["name"] = name.name

    obtain_method_list = fetch_all_obtain_methods(consumable_id, db)
    if obtain_method_list:
        ret["obtain_method"] = obtain_method_list

    return ret
