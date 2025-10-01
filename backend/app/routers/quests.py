from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from .. import models
from ..database import get_db
import json


class QuestResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/quests", tags=["quests"])


@router.get("/", response_model=QuestResponse)
def read_quests(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term"),
    location_search: str = Query(None, description="Location search term"),
    destination_search: str = Query(None, description="Destination search term"),
    skills_search: str = Query(None, description="Skills search term"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
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

    if name_search:
        results = [row for row in results if name_search.lower() in row.name.lower()]

    if location_search:
        # split location search by commas and trim spaces
        loc_terms = [term.strip().lower() for term in location_search.split(",")]
        results = [
            row
            for row in results
            if any(term in (row.location or "").lower() for term in loc_terms)
        ]

    if destination_search:
        # destination is a string value. single. check if search term is in destination name
        results = [
            row
            for row in results
            if row.destination_json
            and destination_search.lower()
            in (json.loads(row.destination_json) or {}).get("name", "").lower()
        ]

    if skills_search:
        # split skills search by commas and trim spaces. contains skill ids. all search skill ids must be present in quest skills
        skill_terms = [term.strip() for term in skills_search.split(",")]
        print("Filtering skills with terms:", skill_terms)
        results = [
            row
            for row in results
            if row.grouped_skills
            and all(
                str(skill_id)
                in [str(skill.get("id")) for skill in json.loads(row.grouped_skills)]
                for skill_id in skill_terms
            )
        ]

    # Sorting logic
    if results:
        # Determine if the sort order is descending
        reverse = sort_order.lower() == "desc"

        # Define a sorting key function
        def sort_key(row):
            # Get the value of the sort_by attribute from the row
            value = getattr(row, sort_by, None)
            # Handle None values to prevent errors during sorting
            if value is None:
                # Treat None as a very small number for numeric types or an empty string for others
                # This ensures they are sorted at the beginning (for asc) or end (for desc)
                return (
                    (0, "")
                    if isinstance(getattr(results[0], sort_by, None), (int, float))
                    else ""
                )
            return value

        results.sort(key=sort_key, reverse=reverse)

    total = len(results)
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
    ]

    ret_list = []
    # The query returns Row objects, which can be treated like objects with attributes.
    # We can also access columns by index or by name like a dictionary.
    for quest in quests:
        ret = {
            field: getattr(quest, field, None)
            for field in return_fields
            if field not in ["skills", "destination"]
        }
        # The SQL query aliases the computed skills array as 'grouped_skills'.
        # We map it to the 'skills' key in the response.
        ret["skills"] = json.loads(quest.grouped_skills) if quest.grouped_skills else []
        ret["destination"] = (
            json.loads(quest.destination_json) if quest.destination_json else None
        )
        del ret["grouped_skills"]
        ret_list.append(ret)

    return {"items": ret_list, "total": total}


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
),
required_arr AS (
    SELECT
        q.id AS quest_id,
        json_group_array(
            json_object(
                'id', CAST(je.key AS INTEGER),
                'name', COALESCE(ad.name, ''),
                'value', COALESCE(CAST(je.value AS INTEGER), 0)
            )
        ) AS required_items
    FROM quest q
    JOIN json_each(q.required_items) AS je
        ON 1=1
    LEFT JOIN allData ad
        ON ad.id = CAST(je.key AS INTEGER)
    WHERE q.required_items != '' AND q.id = :quest_id
    GROUP BY q.id
)
SELECT 
    l.*,
    r.skills AS grouped_skills,
    rw.rewards AS grouped_rewards,
    rq.required_items AS grouped_required_items,
    CASE 
        WHEN ad.id IS NULL OR ad.id = '' THEN NULL
        ELSE json_object(
            'id', ad.id,
            'name', ad.name
        )
    END AS destination_json,
    CASE 
        WHEN ad2.id IS NULL OR ad2.id = '' THEN NULL
        ELSE json_object(
            'id', ad2.id,
            'name', ad2.name
        )
    END AS discovery_json,
    CASE 
        WHEN pq.id IS NULL THEN NULL
        ELSE json_object(
            'id', pq.id,
            'name', pq.name
        )
    END AS previous_continuous_quest_json
FROM quest l
LEFT JOIN skill_arr r
    ON l.id = r.quest_id
LEFT JOIN reward_arr rw
    ON l.id = rw.quest_id
LEFT JOIN required_arr rq
    ON l.id = rq.quest_id
LEFT JOIN allData ad
    ON CAST(l.destination AS INTEGER) = ad.id
LEFT JOIN allData ad2
    ON CAST(l.discovery AS INTEGER) = ad2.id
LEFT JOIN quest pq
    ON CAST(l.previous_continuous_quest_id AS INTEGER) = pq.id
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
        "grouped_rewards",
        "grouped_required_items",
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
    ret["reward_items"] = (
        json.loads(result.grouped_rewards) if result.grouped_rewards else []
    )
    ret["required_items"] = (
        json.loads(result.grouped_required_items)
        if result.grouped_required_items
        else []
    )
    ret['discovery'] = json.loads(result.discovery_json) if result.discovery_json else None
    ret['previous_continuous_quest'] = json.loads(result.previous_continuous_quest_json) if result.previous_continuous_quest_json else None

    # handle preceding_discovery_quest. fetch data
    if ret['preceding_discovery_quest']:
        d = json.loads(ret['preceding_discovery_quest'])
        # d is a list of list. the final element is int which is id. need to fetch name from 'allData' table. in the end recreate list of list but with element of {id, name} dict
        out =[]
        for a in d:
            out2 = []
            for b in a:
                fetched = db.execute(text("SELECT name FROM allData WHERE id = :id"), {"id": b}).fetchone()
                if fetched:
                    out2.append({"id": b, "name": fetched.name})
            out.append(out2)
        ret['preceding_discovery_quest'] = out
    else:
        ret['preceding_discovery_quest'] = None
                
    return ret
