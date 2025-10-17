from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class TitleResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/titles", tags=["titles"])


@router.get("/", response_model=TitleResponse)
def read_titles(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, requirements, effect FROM title"
    results = db.execute(text(query)).fetchall()

    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
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
        # Parse JSON fields for list view if needed, though typically done in detail
        # if item_dict.get("requirements") and isinstance(item_dict["requirements"], str):
        #     try:
        #         item_dict["requirements"] = json.loads(item_dict["requirements"])
        #     except json.JSONDecodeError:
        #         item_dict["requirements"] = {}
        if item_dict.get("effect") and isinstance(item_dict["effect"], str):
            try:
                item_dict["effect"] = json.loads(item_dict["effect"])
            except json.JSONDecodeError:
                item_dict["effect"] = {}
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{title_id}", response_model=dict)
def read_title(title_id: int, db: Session = Depends(get_db)):
    return read_title_core(title_id, db)


def read_title_core(title_id: int, db: Session):
    query = text("SELECT * FROM title WHERE id = :id")
    result = db.execute(query, {"id": title_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Title not found")

    ret = dict(result._mapping)

    # Handle requirements: attempt to parse as JSON, otherwise keep as string
    if ret.get("requirements"):
        ret["requirements"] = ret["requirements"]

    # Handle effect as a plain string, replacing newlines with <br/> for display
    if ret.get("effect"):
        ret["effect"] = ret["effect"].replace("\n", "<br/>")

    return ret
