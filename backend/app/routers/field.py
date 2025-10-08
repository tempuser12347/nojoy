from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
from collections import defaultdict
import json


class TableViewResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/field", tags=["field"])


@router.get("/", response_model=TableViewResponse)
def read_fields(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    fieldtype: Optional[str] = Query(None, description="Search term for fieldtype"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve a list of tradegoods with optional pagination, searching, and sorting.
    """
    query = "SELECT id, name, fieldtype from field"

    # Initial fetch to get all data
    results = db.execute(text(query)).fetchall()

    # Filtering logic
    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]

    if fieldtype:
        term_list = fieldtype.split(",")
        results = [row for row in results if row.fieldtype in term_list]

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


@router.get("/{field_id}", response_model=dict)
def read_field(field_id: int, db: Session = Depends(get_db)):
    return read_field_core(field_id, db)


def read_field_core(field_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single tradegood by its ID.
    """
    query = text(
        """
                SELECT
    f.*,

    -- region info
    CASE WHEN r.id IS NOT NULL THEN
        json_object('id', r.id, 'name', r.name)
    END AS region_resolved,

    -- sea info
    CASE WHEN s.id IS NOT NULL THEN
        json_object('id', s.id, 'name', s.name)
    END AS sea_resolved,

    -- entrance info
    CASE WHEN e.id IS NOT NULL THEN
        json_object('id', e.id, 'name', e.name)
    END AS entrance_resolved,

    -- flag quest info
    CASE WHEN q.id IS NOT NULL THEN
        json_object('id', q.id, 'name', q.name)
    END AS flag_quest_resolved

FROM field AS f
LEFT JOIN allData AS r ON f.region = r.id
LEFT JOIN allData AS s ON f.sea = s.id
LEFT JOIN allData AS e ON f.entrance = e.id
LEFT JOIN allData AS q ON f.flag_quest = q.id
WHERE f.id = :id;

 
                 """
    )
    result = db.execute(query, {"id": field_id}).fetchone()

    if result is None or len(result) == 0:
        raise HTTPException(status_code=404, detail="Tradegood not found")

    # convert to dict
    return_cols = ["id", "name", "description", "coordinates"]
    ret = {}
    for c in return_cols:
        ret[c] = getattr(result, c, None)

    ret["region"] = (
        json.loads(result.region_resolved) if result.region_resolved else None
    )
    ret["sea"] = json.loads(result.sea_resolved) if result.sea_resolved else None
    ret["entrance"] = (
        json.loads(result.entrance_resolved) if result.entrance_resolved else None
    )
    ret["flag_quest"] = (
        json.loads(result.flag_quest_resolved) if result.flag_quest_resolved else None
    )

    ret["survey"] = json.loads(result.survey) if result.survey else None
    ret["resurvey_reward"] = (
        json.loads(result.resurvey_reward) if result.resurvey_reward else None
    )

    ret["gatherable"] = json.loads(result.gatherable) if result.gatherable else None

    return ret
