from sqlalchemy.orm.session import Session
from sqlalchemy import text
import json


def fetch_quest_rewarding_id(item_id: int, db: Session):
    fetched = db.execute(
        text(
            """
        SELECT id, name
        FROM quest
        WHERE json_valid(reward_items) = 1 AND json_extract(reward_items, '$."' || :itemid || '"') IS NOT NULL
    """
        ),
        {"itemid": item_id},
    ).fetchall()
    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name}
            obj_list.append(obj)
        return obj_list
    return None


def fetch_recipe_producing_id(item_id: int, db: Session):

    fetched = db.execute(
        text(
            """
SELECT id, name
FROM recipe
WHERE
json_valid(greatsuccess) = 1 AND
    json_type(greatsuccess, '$') = 'array'
    AND EXISTS (
        SELECT 1
        FROM json_each(greatsuccess)
        WHERE json_extract(value, '$.ref') = :itemid
    )
UNION
SELECT id, name
FROM recipe
WHERE
json_valid(success) = 1 AND
    json_type(success, '$') = 'array'
    AND EXISTS (
        SELECT 1
        FROM json_each(success)
        WHERE json_extract(value, '$.ref') = :itemid
    )
UNION
SELECT id, name
FROM recipe
WHERE
json_valid(failure) = 1 AND
    json_type(failure, '$') = 'array'
    AND EXISTS (
        SELECT 1
        FROM json_each(failure)
        WHERE json_extract(value, '$.ref') = :itemid
    )

"""
        ),
        {"itemid": item_id},
    ).fetchall()

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name}
            obj_list.append(obj)
        return obj_list
    return None


def fetch_sellernpc_selling_id(item_id: int, db: Session):

    fetched = db.execute(
        text(
            """
select npcsale.id, npcsale.npc, allData.name as location_name, location_id
from npcsale left join allData on allData.id = npcsale.location_id
    where item_id = :itemid
                              """
        ),
        {"itemid": item_id},
    )

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {
                "id": row.id,
                "npc": row.npc,
                "location_name": row.location_name,
                "location_id": row.location_id,
            }
            obj_list.append(obj)
        return obj_list
    return None


def fetch_shipwreck_producing_id(item_id: int, db: Session):

    fetched = db.execute(
        text(
            """
SELECT id, name
FROM shipwreck
WHERE EXISTS (
  SELECT 1
  FROM json_each(shipwreck.item_id)
  WHERE value = :itemid
);

                              """
        ),
        {"itemid": item_id},
    ).fetchall()

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name}
            obj_list.append(obj)
        return obj_list
    return None


def fetch_treasurebox_producing_id(item_id: int, db: Session):

    fetched = db.execute(
        text(
            """ 
SELECT
    distinct
  t.id,
  t.name
FROM treasurebox AS t,
     json_each(t.item_ids)
WHERE json_each.value = :itemid;

"""
        ),
        {"itemid": item_id},
    ).fetchall()

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name}
            obj_list.append(obj)
        return obj_list
    return None


def fetch_treasuremp_producing_id(item_id: int, db: Session):
    fetched = db.execute(
        text(
            """
SELECT
    t.id,
    t.name
FROM treasuremap AS t,
     json_each(t.reward_item)
WHERE json_each.key = :id
AND json_valid(t.reward_item);

                              """
        ),
        {"id": item_id},
    ).fetchall()

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name}
            obj_list.append(obj)
        return obj_list
    return None


def fetch_gathering_producing_id(item_id: int, db: Session):
    """
    search through 'field' table, 'gatherable' column. multiple methods could exist
    """

    fetched = db.execute(
        text(
            """
SELECT
    f.id AS field_id,
             f.name as field_name,
    g.value ->> '$.method' AS method,
    g.value ->> '$.rank' AS rank
FROM field AS f
JOIN json_each(f.gatherable) AS g
JOIN json_each(g.value, '$.item') AS i
WHERE i.value ->> '$.id' = :itemid;

 """
        ),
        {"itemid": item_id},
    ).fetchall()

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {
                "id": row.field_id,
                "name": row.field_name,
                "method": row.method,
                "rank": row.rank,
            }
            obj_list.append(obj)
        return obj_list
    return None


def fetch_field_npc_drop_producing_id(item_id: int, db: Session):

    fetched = db.execute(
        text(
            """ SELECT DISTINCT l.id, l.name
FROM landnpc AS l
JOIN json_each(l.drop_items) AS je
WHERE json_extract(je.value, '$.id') = :drop_item_id;"""), {'drop_item_id': item_id}).fetchall();
    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name}
            obj_list.append(obj)

        # for each landnpc, fetch field info
        for landnpc in obj_list:
            fetched_field = db.execute(
                text(
                    """ SELECT fields from landnpc where id = :landnpc_id;"""
                ),
                {"landnpc_id": landnpc["id"]},
            ).fetchone()
            field_list = json.loads(fetched_field.fields)
            landnpc["fields"] = field_list
        return obj_list

    return None

def fetch_marine_npc_drop_producing_id(item_id: int, db: Session):

    # fetch (npc id, 획득방법 ) from marinenpc table for given item_id , looking into 'acquire_items' column
    fetched = db.execute(
        text(
            """ SELECT DISTINCT m.id, m.name, m.sea_areas, json_extract(je.value, '$."획득 방법"') AS method
FROM marinenpc AS m
JOIN json_each(m.acquired_items) AS je
WHERE json_extract(je.value, '$.id') = :drop_item_id;"""), {'drop_item_id': item_id}).fetchall()
    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name, "method": row.method, 'sea_areas': json.loads(row.sea_areas)}
            obj_list.append(obj)
        # sort by method
        obj_list.sort(key=lambda x: x["method"])
        return obj_list

    return None

def fetch_field_resurvey_reward_producing_id(item_id: int, db: Session):

    fetched = db.execute(
        text(
            """
             SELECT
    f.id AS field_id,
    f.name AS field_name,
    json_extract(r.value, '$.value') AS value
FROM field AS f
JOIN json_each(f.resurvey_reward) AS r
WHERE json_extract(r.value, '$.id') = :itemid;
"""
        ),
        {"itemid": item_id},
    ).fetchall()

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.field_id, "name": row.field_name, "amount": row.value}
            obj_list.append(obj)
        return obj_list
    return None


def fetch_consumable_producing_id(item_id: int, db: Session):

    fetched = db.execute(
        text(
            """
SELECT
    c.id AS consumable_id,
    c.name AS consumable_name,
    json_extract(i.value, '$."' || :target_id || '"') AS value
FROM consumable AS c
JOIN json_each(c.Item) AS i
WHERE json_valid(c.Item)
  AND json_type(c.Item) = 'array'
  AND json_type(i.value, '$."' || :target_id || '"') IS NOT NULL;


                              """
        ),
        {"target_id": str(item_id)},
    ).fetchall()

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {
                "id": row.consumable_id,
                "name": row.consumable_name,
                "amount": row.value,
            }
            obj_list.append(obj)
        return obj_list
    return None


def fetch_all_obtain_methods(itemid: int, db: Session):

    # fetch obtain from quest
    obtain_method_list = []
    obtainable_quest_list = fetch_quest_rewarding_id(itemid, db)
    if obtainable_quest_list:
        obtain_method_list.append(
            {"from": "quest", "quest_list": obtainable_quest_list}
        )

    obtainable_recipe_list = fetch_recipe_producing_id(itemid, db)
    if obtainable_recipe_list:
        obtain_method_list.append(
            {"from": "recipe", "recipe_list": obtainable_recipe_list}
        )

    obtainable_npcsale_list = fetch_sellernpc_selling_id(itemid, db)
    if obtainable_npcsale_list:
        obtain_method_list.append(
            {"from": "npcsale", "npcsale_list": obtainable_npcsale_list}
        )

    obt_shipwreck_list = fetch_shipwreck_producing_id(itemid, db)
    if obt_shipwreck_list:
        obtain_method_list.append(
            {"from": "shipwreck", "shipwreck_list": obt_shipwreck_list}
        )

    obt_treasurebox_list = fetch_treasurebox_producing_id(itemid, db)
    if obt_treasurebox_list:
        obtain_method_list.append(
            {"from": "treasurebox", "treasurebox_list": obt_treasurebox_list}
        )
    obt_treasuremap_list = fetch_treasuremp_producing_id(itemid, db)
    if obt_treasuremap_list:
        obtain_method_list.append(
            {"from": "treasuremap", "treasuremap_list": obt_treasuremap_list}
        )

    obt_field_gatherable_list = fetch_gathering_producing_id(itemid, db)
    if obt_field_gatherable_list:
        obtain_method_list.append(
            {"from": "field_gatherable", "field_list": obt_field_gatherable_list}
        )

    obt_field_resurvey_reward_list = fetch_field_resurvey_reward_producing_id(
        itemid, db
    )
    if obt_field_resurvey_reward_list:
        obtain_method_list.append(
            {
                "from": "field_resurvey_reward",
                "field_list": obt_field_resurvey_reward_list,
            }
        )

    obt_consumable_list = fetch_consumable_producing_id(itemid, db)
    if obt_consumable_list:
        obtain_method_list.append(
            {"from": "consumable", "consumable_list": obt_consumable_list}
        )

    obt_landnpc_drop_list = fetch_field_npc_drop_producing_id(itemid, db)
    if obt_landnpc_drop_list:
        obtain_method_list.append(
            {"from": "landnpc_drop", "landnpc_list": obt_landnpc_drop_list}
        )

    obt_marinenpc_drop_list = fetch_marine_npc_drop_producing_id(itemid, db)
    if obt_marinenpc_drop_list:
        obtain_method_list.append(
            {"from": "marinenpc_drop", "marinenpc_list": obt_marinenpc_drop_list}
        )
    

    # if empty return None
    if not obtain_method_list:
        return None

    return obtain_method_list
