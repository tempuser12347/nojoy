from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class RelicPieceResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/relicpieces", tags=["relicpieces"])


@router.get("/", response_model=RelicPieceResponse)
def read_relicpieces(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, theme, piece_rank, quest FROM relicpiece"
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
        if item_dict.get("theme") and isinstance(item_dict["theme"], str):
            try:
                item_dict["theme"] = json.loads(item_dict["theme"])
            except json.JSONDecodeError:
                item_dict["theme"] = None
        if item_dict.get("quest") and isinstance(item_dict["quest"], str):
            try:
                item_dict["quest"] = json.loads(item_dict["quest"])
            except json.JSONDecodeError:
                item_dict["quest"] = None
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{relicpiece_id}", response_model=dict)
def read_relicpiece(relicpiece_id: int, db: Session = Depends(get_db)):
    return read_relicpiece_core(relicpiece_id, db)


def read_relicpiece_core(relicpiece_id: int, db: Session):
    query = text("SELECT * FROM relicpiece WHERE id = :id")
    result = db.execute(query, {"id": relicpiece_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="RelicPiece not found")

    ret = dict(result._mapping)

    if ret.get("theme") and isinstance(ret["theme"], str):
        try:
            ret["theme"] = json.loads(ret["theme"])
        except json.JSONDecodeError:
            ret["theme"] = None
    if ret.get("quest") and isinstance(ret["quest"], str):
        try:
            ret["quest"] = json.loads(ret["quest"])
        except json.JSONDecodeError:
            ret["quest"] = None

    print(f'relic piece id: {relicpiece_id}')
    # Find associated relic
    relic_query = text(''' 
SELECT
    r.id,
    r.name,
    r.extraname
FROM relic AS r
JOIN json_each(r.relic_pieces) AS p
  ON json_extract(p.value, '$.relic_piece.id') = :relicpiece_id

''')
    relic_result = db.execute(relic_query, {"relicpiece_id": relicpiece_id}).fetchone()
    if relic_result:
        print('Associated relic found')
        relic_dict = dict(relic_result._mapping)
        if relic_dict.get("extraname"):
            relic_dict["name"] = f'{relic_dict["name"]} {relic_dict["extraname"]}'
        ret["associated_relic"] = relic_dict
    else:
        print('No associated relic found')
        ret["associated_relic"] = None

    return ret