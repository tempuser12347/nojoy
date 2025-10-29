from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class RelicResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/relics", tags=["relics"])


@router.get("/", response_model=RelicResponse)
def read_relics(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, extraname, description, theme, relic_pieces, adventure_log FROM relic"
    results = db.execute(text(query)).fetchall()

    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
            or name_search.lower() in (row.get("extraname") or "").lower()
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
        # if item_dict.get("extraname"):
        #     item_dict["name"] = f'{item_dict["name"]} {item_dict["extraname"]}'
        if item_dict.get("relic_pieces") and isinstance(item_dict["relic_pieces"], str):
            try:
                item_dict["relic_pieces"] = json.loads(item_dict["relic_pieces"])
            except json.JSONDecodeError:
                raise Exception()
        if item_dict.get('theme'):
            item_dict['theme'] = json.loads(item_dict.get('theme'))
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{relic_id}", response_model=dict)
def read_relic(relic_id: int, db: Session = Depends(get_db)):
    return read_relic_core(relic_id, db)


def read_relic_core(relic_id: int, db: Session):
    query = text("SELECT * FROM relic WHERE id = :id")
    result = db.execute(query, {"id": relic_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Relic not found")

    ret = dict(result._mapping)

    if ret.get("extraname"):
        ret["name"] = f'{ret["name"]} {ret["extraname"]}'

    if ret.get("relic_pieces") and isinstance(ret["relic_pieces"], str):
        try:
            ret["relic_pieces"] = json.loads(ret["relic_pieces"])
        except json.JSONDecodeError:
            raise Exception(f'json decode fail on relic_pieces')
    if ret.get('theme'):
        ret['theme'] = json.loads(ret.get('theme'))

    # for each relic piece, add quest info if available
    for rp in ret['relic_pieces']:
        relic_piece_id = rp.get('relic_piece', {}).get('id')
        print(f'relic piece id: {relic_piece_id}')
        if relic_piece_id:
            rp_query = text("SELECT quest FROM relicpiece WHERE id = :id")
            rp_result = db.execute(rp_query, {"id": relic_piece_id}).fetchone()
            quest = rp_result[0]
            if quest:
                rp['quest'] = json.loads(quest)
            else:
                rp['quest'] = None

    return ret