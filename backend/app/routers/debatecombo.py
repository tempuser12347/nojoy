from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class DebateComboResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/debatecombos", tags=["debatecombos"])


@router.get("/", response_model=DebateComboResponse)
def read_debatecombos(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, category_info, total_points, discovery_cards FROM debatecombo"
    results = db.execute(text(query)).fetchall()

    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
        ]

    if sort_by:
        if sort_by == 'category':
            sort_f = lambda x: json.loads(x.get('category_info')).get('category') if x.get('category_info') else ""
        elif sort_by == 'bonus':
            sort_f = lambda x: json.loads(x.get('category_info')).get('bonus') if x.get('category_info') else ""
        elif sort_by == 'total_points':
            sort_f = lambda x: x.get('total_points') or -1
        else:
            sort_f = lambda x: x.get(sort_by) or ""
        results.sort(
            key=sort_f,
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    items = []
    for row in paginated_results:
        item_dict = dict(row)
        if item_dict.get("category_info") and isinstance(item_dict["category_info"], str):
            try:
                item_dict["category_info"] = json.loads(item_dict["category_info"])
            except json.JSONDecodeError:
                item_dict["category_info"] = None
        if item_dict.get("discovery_cards") and isinstance(item_dict["discovery_cards"], str):
            try:
                item_dict["discovery_cards"] = json.loads(item_dict["discovery_cards"])
            except json.JSONDecodeError:
                item_dict["discovery_cards"] = None
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{debatecombo_id}", response_model=dict)
def read_debatecombo(debatecombo_id: int, db: Session = Depends(get_db)):
    return read_debatecombo_core(debatecombo_id, db)


def read_debatecombo_core(debatecombo_id: int, db: Session):
    query = text("SELECT * FROM debatecombo WHERE id = :id")
    result = db.execute(query, {"id": debatecombo_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="DebateCombo not found")

    ret = dict(result._mapping)

    if ret.get("category_info") and isinstance(ret["category_info"], str):
        try:
            ret["category_info"] = json.loads(ret["category_info"])
        except json.JSONDecodeError:
            ret["category_info"] = None
    if ret.get("discovery_cards") and isinstance(ret["discovery_cards"], str):
        try:
            ret["discovery_cards"] = json.loads(ret["discovery_cards"])
        except json.JSONDecodeError:
            ret["discovery_cards"] = None

    return ret