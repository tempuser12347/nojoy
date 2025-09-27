from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from .. import models
from ..database import get_db
import json

router = APIRouter(prefix="/api/quests", tags=["quests"])


@router.get("/", response_model=List[dict])
def read_quests(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    search: str = Query(None, description="Search term"),
    db: Session = Depends(get_db),
):
    results = db.execute(
        text(
            """
            WITH skill_arr AS (
    SELECT
        q.id AS quest_id,
        q.name AS quest_name,
        json_group_array(
            json_object(
                'id', s.id,
                'name', COALESCE(s.name, ''),
                'value', COALESCE(CAST(je.value AS INTEGER), 0)
            )
        ) AS skills
    FROM quest q
    JOIN json_each(q.skills) AS je
        ON 1=1
    LEFT JOIN skill s
        ON s.id = CAST(je.key AS INTEGER)
    WHERE q.skills != ''
    GROUP BY q.id, q.name
)
SELECT 
    l.*,
    r.skills AS grouped_skills,
    CASE 
        WHEN ad.id IS NULL OR ad.id = '' THEN NULL
        ELSE json_object(
            'id', ad.id,
            'name', ad.name
            -- ,'category', ad.category  -- add if needed
        )
    END AS destination_json
FROM quest l
LEFT JOIN skill_arr r
    ON l.id = r.quest_id
LEFT JOIN allData ad
    ON CAST(l.destination AS INTEGER) = ad.id;

                      """
        )
    ).fetchall()

    if search:
        results = [row for row in results if search.lower() in row.name.lower()]

    quests = results[skip : skip + limit]

    return_fields = [
        "id",
        "type",
        "name",
        "description",
        "difficulty",
        "location",
        "destination",
        "skills",
        "discovery",
        "preceding_discovery_quest",
        "grouped_skills",
        "destination_json",
    ]

    ret_list = []
    # The query returns Row objects, which can be treated like objects with attributes.
    # We can also access columns by index or by name like a dictionary.
    for quest in quests:
        ret = {
            field: getattr(quest, field, None)
            for field in return_fields
            if field not in ["skills", "destination_json"]
        }
        # The SQL query aliases the computed skills array as 'grouped_skills'.
        # We map it to the 'skills' key in the response.
        ret["skills"] = json.loads(quest.grouped_skills) if quest.grouped_skills else []
        ret["destination"] = (
            json.loads(quest.destination_json) if quest.destination_json else None
        )
        del ret["grouped_skills"]
        ret_list.append(ret)

    return ret_list


@router.get("/{quest_id}", response_model=dict)
def read_quest(quest_id: int, db: Session = Depends(get_db)):

    result = db.execute(
        text(
            """
WITH skill_arr AS (
    SELECT
        q.id AS quest_id,
        q.name AS quest_name,
        json_group_array(
            json_object(
                'id', s.id,
                'name', COALESCE(s.name, ''),
                'value', COALESCE(CAST(je.value AS INTEGER), 0)
            )
        ) AS skills
    FROM quest q
    JOIN json_each(q.skills) AS je
        ON 1=1
    LEFT JOIN skill s
        ON s.id = CAST(je.key AS INTEGER)
    WHERE q.skills != '' AND q.id = :quest_id
    GROUP BY q.id, q.name
),
reward_arr AS (
    SELECT
        q.id AS quest_id,
        json_group_array(
            json_object(
                'id', CAST(je.key AS INTEGER),
                'name', COALESCE(ad.name, ''),
                'value', COALESCE(CAST(je.value AS INTEGER), 0)
            )
        ) AS rewards
    FROM quest q
    JOIN json_each(q.reward_items) AS je
        ON 1=1
    LEFT JOIN allData ad
        ON ad.id = CAST(je.key AS INTEGER)
    WHERE q.reward_items != '' AND q.id = :quest_id
    GROUP BY q.id
)
SELECT 
    l.*,
    r.skills AS grouped_skills,
    rw.rewards AS grouped_rewards,
    CASE 
        WHEN ad.id IS NULL OR ad.id = '' THEN NULL
        ELSE json_object(
            'id', ad.id,
            'name', ad.name
            -- ,'category', ad.category  -- add if needed
        )
    END AS destination_json
FROM quest l
LEFT JOIN skill_arr r
    ON l.id = r.quest_id
LEFT JOIN reward_arr rw
    ON l.id = rw.quest_id
LEFT JOIN allData ad
    ON CAST(l.destination AS INTEGER) = ad.id
WHERE l.id = :quest_id;

                      """
        ),
        {"quest_id": quest_id},
    ).fetchone()

    print(result)

    return_fields = [
        "id",
        "type",
        "name",
        "additional_name",
        "description",
        "series",
        "difficulty",
        "era",
        "category",
        "location",
        "destination_coordinates",
        "discovery",
        "preceding_discovery_quest",
        "deadline",
        "required_items",
        "guide",
        "progress",
        "previous_continuous_quest_id",
        "episode",
        "one_time_only",
        "rare",
        "association_required",
        "skills",
        "additional_skills",
        "association_skills",
        "sophia_rank",
        "sophia_points",
        "nationality",
        "occupation",
        "port_permission",
        "reputation",
        "other",
        "reward_money",
        "advance_payment",
        "report_experience",
        "report_reputation",
        "reward_immigrants",
        "reward_techniques",
        "reward_title",
        "destination_json",
        'grouped_rewards'
    ]
    ret = {
        field: getattr(result, field, None)
        for field in return_fields
        if field != "skills"
    }
    ret["skills"] = json.loads(result.grouped_skills) if result.grouped_skills else []
    ret["destination"] = (
        json.loads(result.destination_json) if result.destination_json else None
    )
    ret['reward_items'] = json.loads(result.grouped_rewards) if result.grouped_rewards else []
    return ret
