from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from .. import models
from ..database import get_db
from ..common import fetch_all_obtain_methods
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
    skills_search: str = Query(None, description="Skills search term"),
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
        # print("Filtering by classifications:", classifications)
        if classifications:
            results = [
                row
                for row in results
                if row.classification != None and row.classification in classifications
            ]

    if skills_search:
        skill_terms = [int(term.strip()) for term in skills_search.split(",")]
        print("Filtering skills with terms:", skill_terms)
        results = [
            row
            for row in results
            if row.skills_json
            and all(
                skill_id in [skill.get("id") for skill in json.loads(row.skills_json)]
                for skill_id in skill_terms
            )
        ]

    # Sorting logic
    if results:
        reverse = sort_order.lower() == "desc"
    print(f"sort by: {sort_by}, reverse: {reverse}")

    def sort_key(row):
        value = getattr(row, sort_by, None)

        if sort_by == "skills":
            if row.skills_json:
                skills = json.loads(row.skills_json)
                max_value = 0
                for skill in skills:
                    if skill and skill.get("value", 0) > max_value:
                        max_value = skill.get("value", 0)
                return max_value
            return 0 # Default for no skills

        if value is None:
            # Provide a default value for None based on expected type
            # Assuming numeric columns should sort as 0, others as empty string
            if sort_by in ["id", "attack_power", "defense_power", "durability"]:
                return 0
            return ""
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
    return read_equipment_core(equipment_id, db)


def read_equipment_core(equipment_id: int, db: Session = Depends(get_db)):

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
    ret["skills"] = [a for a in ret["skills"] if a is not None]
    ret["use_effect"] = json.loads(result.use_effect) if result.use_effect else None
    ret["equipped_effect"] = (
        json.loads(result.equipped_effect) if result.equipped_effect else None
    )
    ret["requirements"] = (
        json.loads(result.requirements) if result.requirements else None
    )

    # fetch obtain methods from other tables

    ## check obtainable from quest
    obtm_list = fetch_all_obtain_methods(equipment_id, db)
    ret["obtain_method"] = obtm_list

    ## check obtainable from treasuremap
    return ret
