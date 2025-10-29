from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class MemorialAlbumResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/memorialalbums", tags=["memorialalbums"])


@router.get("/", response_model=MemorialAlbumResponse)
def read_memorialalbums(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, category, reward_npc, reward_item, items FROM memorialalbum"
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
        if item_dict.get("reward_npc") and isinstance(item_dict["reward_npc"], str):
            try:
                item_dict["reward_npc"] = json.loads(item_dict["reward_npc"])
            except json.JSONDecodeError:
                item_dict["reward_npc"] = None
        if item_dict.get("reward_item") and isinstance(item_dict["reward_item"], str):
            try:
                item_dict["reward_item"] = json.loads(item_dict["reward_item"])
            except json.JSONDecodeError:
                item_dict["reward_item"] = None
        if item_dict.get("items") and isinstance(item_dict["items"], str):
            try:
                item_dict["items"] = json.loads(item_dict["items"])
            except json.JSONDecodeError:
                item_dict["items"] = None
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{memorialalbum_id}", response_model=dict)
def read_memorialalbum(memorialalbum_id: int, db: Session = Depends(get_db)):
    return read_memorialalbum_core(memorialalbum_id, db)


def read_memorialalbum_core(memorialalbum_id: int, db: Session):
    query = text("SELECT * FROM memorialalbum WHERE id = :id")
    result = db.execute(query, {"id": memorialalbum_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="MemorialAlbum not found")

    ret = dict(result._mapping)

    if ret.get("reward_npc") and isinstance(ret["reward_npc"], str):
        try:
            ret["reward_npc"] = json.loads(ret["reward_npc"])
        except json.JSONDecodeError:
            ret["reward_npc"] = None
    if ret.get("reward_item") and isinstance(ret["reward_item"], str):
        try:
            ret["reward_item"] = json.loads(ret["reward_item"])
        except json.JSONDecodeError:
            ret["reward_item"] = None
    if ret.get("items") and isinstance(ret["items"], str):
        try:
            ret["items"] = json.loads(ret["items"])
        except json.JSONDecodeError:
            ret["items"] = None

    return ret