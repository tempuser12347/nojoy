from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from .. import models
from ..database import get_db
import json


class EquipmentResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/equipment", tags=["equipment"])


@router.get("/", response_model=EquipmentResponse)
def read_equipments(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    classification: str = Query(None, description="Classification filter"),
    db: Session = Depends(get_db),
):

    results = db.execute(
        text(
            """
SELECT
    e.*,
    CASE
        WHEN COUNT(je.value) = 0 THEN NULL
        ELSE json_group_array(je.value)
    END AS skills_json
FROM equipment e
LEFT JOIN json_each(e.skills) je
    ON je.value IS NOT NULL
GROUP BY e.id;

"""
        )
    ).fetchall()

    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]

    if classification:
        classifications = [c.strip() for c in classification.split(",") if c.strip()]
        print("Filtering by classifications:", classifications)
        if classifications:
            results = [
                row
                for row in results
                if row.classification != None
                and row.classification in classifications
            ]

    # Sorting logic
    if results:
        reverse = sort_order.lower() == "desc"

        def sort_key(row):
            value = getattr(row, sort_by, None)
            if value is None:
                return (
                    (0, "")
                    if isinstance(getattr(results[0], sort_by, None), (int, float))
                    else ""
                )
            return value

        results.sort(key=sort_key, reverse=reverse)

    total = len(results)
    equipments = results[skip : skip + limit]

    return_fields = [
        "id",
        "name",
        "description",
        "type",
        "classification",
        "attack_power",
        "defense_power",
        "durability",
        "attire",
        "disguise",
        "use_effect",
        "equipped_effect",
        "requirements",
        "skills_json",
    ]
    print(equipments)
    ret_list = []
    for equipment in equipments:
        ret = {
            field: getattr(equipment, field, None)
            for field in return_fields
            if field not in ["skills_json"]
        }
        ret["skills"] = (
            json.loads(equipment.skills_json) if equipment.skills_json else []
        )
        ret["use_effect"] = (
            json.loads(equipment.use_effect) if equipment.use_effect else None
        )
        ret["equipped_effect"] = (
            json.loads(equipment.equipped_effect) if equipment.equipped_effect else None
        )
        ret_list.append(ret)

    return {"items": ret_list, "total": total}


@router.get("/{equipment_id}", response_model=dict)
def read_equipment(equipment_id: int, db: Session = Depends(get_db)):

    result = db.execute(
        text(
            """
            SELECT
                e.*,
                json_group_array(je.value) as skills_json
            FROM equipment e
            LEFT JOIN json_each(e.skills) je ON 1=1
            WHERE e.id = :equipment_id
            GROUP BY e.id
            """
        ),
        {"equipment_id": equipment_id},
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Equipment not found")

    return_fields = [
        "id",
        "name",
        "description",
        "type",
        "classification",
        "attack_power",
        "defense_power",
        "durability",
        "attire",
        "disguise",
        "use_effect",
        "equipped_effect",
        "requirements",
        "skills_json",
    ]
    ret = {
        field: getattr(result, field, None)
        for field in return_fields
        if field != "skills_json"
    }
    ret["skills"] = json.loads(result.skills_json) if result.skills_json else []
    return ret
