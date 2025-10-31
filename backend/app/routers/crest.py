from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
from ..common import fetch_all_obtain_methods

class CrestResponse(BaseModel):
    items: List[dict]
    total: int

router = APIRouter(prefix="/api/crests", tags=["crests"])

@router.get("/", response_model=CrestResponse)
def read_crests(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description FROM crest"
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
            key=lambda x: x.get(sort_by, '') if x.get(sort_by) is not None else '',
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    return {"items": paginated_results, "total": total}

@router.get("/{crest_id}", response_model=dict)
def read_crest(crest_id: int, db: Session = Depends(get_db)):
    return read_crest_core(crest_id, db)

def read_crest_core(crest_id: int, db: Session):
    query = text("SELECT * FROM crest WHERE id = :id")
    result = db.execute(query, {"id": crest_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Crest not found")
    
    ret = dict(result._mapping)

    obtain_method_list = fetch_all_obtain_methods(crest_id, db)
    if obtain_method_list:
        ret["obtain_method"] = obtain_method_list

    return ret