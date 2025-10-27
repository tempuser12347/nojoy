from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class LegacyResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/legacies", tags=["legacies"])


@router.get("/", response_model=LegacyResponse)
def read_legacies(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, theme, destination, rewards, recommended_clues, requirements FROM legacy"
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
        ]

    # Process JSON fields for display/sorting
    for row in results:
        if row.get("theme") and isinstance(row["theme"], str):
            try:
                row["theme"] = json.loads(row["theme"])
            except json.JSONDecodeError:
                row["theme"] = None
        if row.get("destination") and isinstance(row["destination"], str):
            try:
                row["destination"] = json.loads(row["destination"])
            except json.JSONDecodeError:
                row["destination"] = None
        if row.get("rewards") and isinstance(row["rewards"], str):
            try:
                rewards_data = json.loads(row["rewards"])
                row["rewards_sophia"] = rewards_data.get("sophia")
                row["rewards_items"] = rewards_data.get("items", [])
            except json.JSONDecodeError:
                row["rewards_sophia"] = None
                row["rewards_items"] = []
        if row.get("requirements") and isinstance(row["requirements"], str):
            try:
                reqs = json.loads(row["requirements"])
                row["requirements_display"] = ", ".join([f"{item['name']}" for r in reqs if r["type"] == "선행 발견/퀘스트" for item in r["content"]])
            except json.JSONDecodeError:
                row["requirements_display"] = ""

    if sort_by:
        if sort_by in ['theme', 'destination']:
            sort_f = lambda x: x.get(sort_by)['name'] if x.get(sort_by, None) is not None else ''
        elif sort_by in ['rewards_items']:
            sort_f = lambda x: len(x.get(sort_by)) if x.get(sort_by) is not None else -1
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


@router.get("/{legacy_id}", response_model=dict)
def read_legacy(legacy_id: int, db: Session = Depends(get_db)):
    return read_legacy_core(legacy_id, db)


def read_legacy_core(legacy_id: int, db: Session):
    query = text("SELECT * FROM legacy WHERE id = :id")
    result = db.execute(query, {"id": legacy_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Legacy not found")

    ret = dict(result._mapping)

    # Parse JSON fields
    for field in ["theme", "destination", "rewards", "recommended_clues", "requirements"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret