from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.database import get_db
from app import models
import json

router = APIRouter(prefix="/api/discoveries", tags=["discoveries"])


@router.get("/")
async def get_discoveries(
    search: str = None,
    category: str = None,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):

    results = db.execute(
        text(
            """
    select id, name, category, difficulty, discovery_method from discovery
"""
        )
    ).fetchall()
    if search:
        results = [row for row in results if search.lower() in row.name.lower()]

    if category:
        results = [row for row in results if category.lower() == row.category.lower()]

    total = len(results)
    items = results[skip : skip + limit]

    # convert to dict
    fetch_field_list = ["id", "name", "category", "difficulty", "discovery_method"]

    item_dict_list = []
    for item in items:
        item_dict = {}
        for field in fetch_field_list:
            item_dict[field] = getattr(item, field, None)
        item_dict_list.append(item_dict)

    return {"items": item_dict_list, "total": total}


@router.get("/{discovery_id}")
async def get_discovery(discovery_id: int, db: Session = Depends(get_db)):
    print(f"discovery_id: {discovery_id}")
    result = db.execute(
        text(
            """
SELECT
    d.*,
    json_group_array(
        json_object(
            'id', ad.id,
            'name', ad.name
        )
    ) AS discovery_location_resolved
FROM discovery d
LEFT JOIN json_each(d.discovery_location) je
    ON 1=1
LEFT JOIN allData ad
    ON ad.id = je.value
WHERE d.id = :discovery_id
GROUP BY d.id;

"""
        ),
        {"discovery_id": discovery_id},
    ).fetchone()

    # print(result)

    # discovery = db.query(models.Discovery).filter(models.Discovery.id == discovery_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Discovery not found")

    # convert to dict
    """
    CREATE TABLE discovery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `type` VARCHAR(255),
    `name` VARCHAR(255),
    `additional_name` VARCHAR(255),
    `name_key` VARCHAR(255),
    `description` TEXT,
    `category` VARCHAR(255),
    `difficulty` INT,
    `card_points` INT,
    `discovery_experience` INT,
    `card_acquisition_experience` INT,
    `report_reputation` INT,
    `discovery_method` VARCHAR(255),
    `discovery_location` VARCHAR(255),
    `discovery_rank` TEXT,
    `additional_description` TEXT,
    `era` VARCHAR(255),
    `time_period` VARCHAR(255),
    `weather` VARCHAR(255),
    `coordinates` VARCHAR(255)
    """
    fetch_field_list = [
        "id",
        "type",
        "name",
        "additional_name",
        "name_key",
        "description",
        "category",
        "difficulty",
        "card_points",
        "discovery_experience",
        "card_acquisition_experience",
        "report_reputation",
        "discovery_method",
        "discovery_rank",
        "additional_description",
        "era",
        "time_period",
        "weather",
        "coordinates",
    ]

    ret = {}
    for field in fetch_field_list:
        ret[field] = getattr(result, field, None)

    ret["discovery_location"] = (
        json.loads(result.discovery_location_resolved)
        if result.discovery_location_resolved
        else None
    )
    print(ret)

    return ret
