from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class Research(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    building_level: Optional[int]
    major: Optional[dict]
    job: Optional[dict]
    required_pages: Optional[int]
    research_actions: Optional[List[dict]]
    rewards: Optional[List[dict]]

    class Config:
        orm_mode = True


class ResearchResponse(BaseModel):
    items: List[Research]
    total: int


router = APIRouter(prefix="/api/researches", tags=["researches"])


@router.get("/", response_model=ResearchResponse)
def read_researches(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, category, building_level, major, job, required_pages, research_actions, rewards FROM research"

    where_clauses = []
    params = {}

    if name_search:
        where_clauses.append("name LIKE :name_search")
        params["name_search"] = f"%{name_search}%"

    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)

    count_query = f"SELECT COUNT(*) FROM ({query}) as sub"
    total = db.execute(text(count_query), params).scalar()

    if sort_by in [
        "id",
        "name",
        "description",
        "category",
        "building_level",
        "required_pages",
    ]:
        order = "DESC" if sort_order.lower() == "desc" else "ASC"
        query += f" ORDER BY {sort_by} {order}"

    query += " LIMIT :limit OFFSET :skip"
    params["limit"] = limit
    params["skip"] = skip

    results = db.execute(text(query), params).fetchall()
    items = []
    for row in results:
        item_dict = dict(row._mapping)
        for field in ["major", "job", "research_actions", "rewards"]:
            if item_dict.get(field) and isinstance(item_dict[field], str):
                try:
                    item_dict[field] = json.loads(item_dict[field])
                except json.JSONDecodeError:
                    item_dict[field] = None
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{research_id}", response_model=Research)
def read_research(research_id: int, db: Session = Depends(get_db)):
    return read_research_core(research_id, db)


def read_research_core(research_id: int, db: Session):
    query = text(
        "SELECT id, name, description, category, building_level, major, job, required_pages, research_actions, rewards FROM research WHERE id = :id"
    )
    result = db.execute(query, {"id": research_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Research not found")

    ret = dict(result._mapping)

    for field in ["major", "job", "research_actions", "rewards"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret
