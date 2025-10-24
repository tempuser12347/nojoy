from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class OrnamentResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/ornaments", tags=["ornaments"])


@router.get("/", response_model=OrnamentResponse)
def read_ornaments(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, acquisition, crafter, discovery_card, installation_effect, city, cost FROM ornament"
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    for row in results:
        if row.get('city', None) is not None:
            row['city'] = json.loads(row['city'])
        if row.get("discovery_card") and isinstance(row["discovery_card"], str):
            try:
                row["discovery_card"] = json.loads(row["discovery_card"])
            except json.JSONDecodeError:
                row["discovery_card"] = []

        if row.get("installation_effect") and isinstance(row["installation_effect"], str):
            try:
                row["installation_effect"] = json.loads(row["installation_effect"])
            except json.JSONDecodeError:
                row["installation_effect"] = []

        if row.get("cost") and isinstance(row["cost"], str):
            try:
                row["cost"] = json.loads(row["cost"])
            except json.JSONDecodeError:
                row["cost"] = None

    # valid_sort_columns = ["id", "name", "description", "acquisition", "crafter", "city"]
    # if sort_by not in valid_sort_columns:
    #     raise HTTPException(status_code=400, detail=f"Invalid sort_by column: {sort_by}")

    if sort_by:
        if sort_by in ['discovery_card', 'installation_effect']:
            sort_f = lambda x: len(x.get(sort_by, None)) if x.get(sort_by, None) is not None else -1
        elif sort_by in  ['city']:
            sort_f = lambda x: x.get(sort_by).get('name', '') if x.get(sort_by, None) is not None else ''
        else:
            sort_f = lambda x: x.get(sort_by) or ''
        results.sort(
            key=sort_f,
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    items = []
    for row in paginated_results:
        item_dict = dict(row)
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{ornament_id}", response_model=dict)
def read_ornament(ornament_id: int, db: Session = Depends(get_db)):
    return read_ornament_core(ornament_id, db)


def read_ornament_core(ornament_id: int, db: Session):
    query = text("SELECT * FROM ornament WHERE id = :id")
    result = db.execute(query, {"id": ornament_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Ornament not found")

    ret = dict(result._mapping)

    # Parse JSON fields
    for field in ["discovery_card", "installation_effect", "cost"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret
