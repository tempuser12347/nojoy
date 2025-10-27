from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class TreasureHuntThemeResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/treasurehuntthemes", tags=["treasurehuntthemes"])


@router.get("/", response_model=TreasureHuntThemeResponse)
def read_treasurehuntthemes(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, theme_rank, requirements FROM treasurehunttheme"
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
        if item_dict.get("requirements") and isinstance(item_dict["requirements"], str):
            try:
                item_dict["requirements"] = json.loads(item_dict["requirements"])
            except json.JSONDecodeError:
                item_dict["requirements"] = None
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{treasurehunttheme_id}", response_model=dict)
def read_treasurehunttheme(treasurehunttheme_id: int, db: Session = Depends(get_db)):
    return read_treasurehunttheme_core(treasurehunttheme_id, db)


def read_treasurehunttheme_core(treasurehunttheme_id: int, db: Session):
    query = text("SELECT * FROM treasurehunttheme WHERE id = :id")
    result = db.execute(query, {"id": treasurehunttheme_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="TreasureHuntTheme not found")

    ret = dict(result._mapping)

    if ret.get("requirements") and isinstance(ret["requirements"], str):
        try:
            ret["requirements"] = json.loads(ret["requirements"])
        except json.JSONDecodeError:
            ret["requirements"] = None

    return ret