from sqlalchemy.orm.session import Session
from sqlalchemy import text
import json


def fetch_quest_rewarding_id(item_id: int, db: Session):
    fetched = db.execute(
        text(
            """
        with A as (SELECT id, name, series, location, destination
        FROM quest
        WHERE json_valid(reward_items) = 1 AND json_extract(reward_items, '$."' || :itemid || '"') IS NOT NULL)
        select A.id, A.name, A.series, A.location, A.destination as destination_id, allData.name as destination_name from A 
        left join allData on A.destination = allData.id;
    """
        ),
        {"itemid": item_id},
    ).fetchall()
    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name, 'series': row.series, "location": row.location,
                   "destination": {"id": row.destination_id, "name": row.destination_name} if row.destination_id else None}
            obj_list.append(obj)
        return obj_list
    return None


def fetch_recipe_producing_id(item_id: int, db: Session):

    fetched = db.execute(
        text(
            """
            WITH A as (
SELECT id, name, recipe_book_id, required_Skill, ingredients
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
SELECT id, name, recipe_book_id, required_Skill, ingredients
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
SELECT id, name, recipe_book_id, required_Skill, ingredients
FROM recipe
WHERE
json_valid(failure) = 1 AND
    json_type(failure, '$') = 'array'
    AND EXISTS (
        SELECT 1
        FROM json_each(failure)
        WHERE json_extract(value, '$.ref') = :itemid
    )

    )
    select distinct A.id, A.name, recipe_book_id as bookid, B.name as bookname, A.required_Skill, A.ingredients from A 
    left join recipebook as B on A.recipe_book_id = B.id

"""
        ),
        {"itemid": item_id},
    ).fetchall()

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name}
            obj['recipe_book'] = {"id": row.bookid, "name": row.bookname}
            obj['skill'] = json.loads(row.required_Skill)
            obj['ingredients'] = json.loads(row.ingredients)

            # change ref -> id in skill, ingredients
            if obj['ingredients']:
                for ingredient in obj['ingredients']:
                    if 'ref' in ingredient:
                        ingredient['id'] = ingredient.pop('ref')
            if obj['skill']:
                for skill in obj['skill']:
                    if 'ref' in skill:
                        skill['id'] = skill.pop('ref')
            obj_list.append(obj)
        return obj_list
    return None


def fetch_sellernpc_selling_id(item_id: int, db: Session):

    fetched = db.execute(
        text(
            """

            with field_region as (
            select f.id, r.name from field  as f 
            left join allData as r on f.region = r.id
            )
select npcsale.id, npcsale.npc, allData.name as location_name, npcsale.location_id, coalesce(city.region , fr.name) as region
from npcsale 
left join allData on allData.id = npcsale.location_id
left join city on city.id = npcsale.location_id
left join field_region as fr on fr.id = npcsale.location_id

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
                'region': row.region
            }
            obj_list.append(obj)
        # group by (npc, region)
        grouped = {}
        for item in obj_list:
            key = (item['npc'], item['region'])
            if key not in grouped:
                grouped[key] = {
                    "npc": item['npc'],
                    "region": item['region'],
                    "locations": []
                }
            grouped[key]['locations'].append({
                "id": item['location_id'],
                "name": item['location_name']
            })

        grouped_list = list(grouped.values())
        # sort by npc, region (where region none or empty goes last)
        grouped_list.sort(key=lambda x: (x['npc'], x['region'] or ''))
        return grouped_list
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

def fetch_ganador_producing_id(itemid: int, db: Session):

    fetched = db.execute(
        text(
            """
        SELECT
    g.id,
    g.name,
    g.category,
    g.difficulty
FROM ganador AS g,
     json_each(g.acquired_items) AS je
WHERE json_extract(je.value, '$.id') = :itemid;
            """), {'itemid': itemid}).fetchall()
    
    if fetched:
        obj_list = []
        for row in fetched:
            obj = {
                "id": row.id,
                "name": row.name,
                "category": row.category,
                "difficulty": row.difficulty
            }
            obj_list.append(obj)
        # group by (category, difficulty)
        grouped = {}
        for item in obj_list:
            key = (item['category'], item['difficulty'])
            if key not in grouped:
                grouped[key] = {
                    "category": item['category'],
                    "difficulty": item['difficulty'],
                    "ganador_list": []
                }
            grouped[key]['ganador_list'].append({
                "id": item['id'],
                "name": item['name']
            })
        obj_list = list(grouped.values())
        # sort by category, difficulty (where difficulty none or empty goes last)
        obj_list.sort(key=lambda x: (x['category'], x['difficulty'] or ''))
        return obj_list

    return None

def fetch_citynpc_gift_producing_id(itemid: int, db: Session):
    fetched = db.execute(
        text(
            """
        WITH A AS (
    SELECT DISTINCT
        c.id,
        c.name,
        c.extraname,
        c.city
    FROM citynpc AS c
    JOIN json_each(
        CASE
            WHEN json_valid(c.gifts) THEN c.gifts
            ELSE '[]'
        END
    ) AS je
    WHERE json_extract(je.value, '$.id') = :itemid
)
SELECT
    A.id,
    A.name,
    A.extraname,
    A.city,
    city.region
FROM A
LEFT JOIN city
    ON json_extract(A.city, '$.id') = city.id;

          """
        ), {'itemid': itemid}).fetchall()
    if fetched:
        obj_list = []
        for row in fetched:
            obj = {
                "id": row.id,
                "name": row.name,
                "extraname": row.extraname,
                "city": json.loads(row.city),
                "region": row.region
            }
            obj_list.append(obj)

        # group by (region, city)
        grouped = {}
        for item in obj_list:
            key = (item['region'], item['city']['id'])
            if key not in grouped:
                grouped[key] = {
                    "region": item['region'],
                    "city": item['city'],
                    "citynpc_list": []
                }
            grouped[key]['citynpc_list'].append({
                "id": item['id'],
                "name": item['name'],
                "extraname": item['extraname']
            })
        obj_list = list(grouped.values())
        # sort by (region, )
        obj_list.sort(key=lambda x: (x['region'] or '', x['city']['name']))


        return obj_list
    return None

def fetch_dungeon_producing_id(itemid: int, db: Session):
    
    fetched = db.execute(
        text(
            """
            SELECT distinct d.id, d.name, box.key as boxname
FROM dungeon AS d
JOIN json_each(d.acquisition_items) AS box
JOIN json_each(box.value) AS content
JOIN json_each(content.value, '$.items') AS item
WHERE json_extract(item.value, '$.id') = :itemid;
    """), {'itemid': itemid}).fetchall()

    if fetched:
        obj_list = []
        for row in fetched:
            obj = {"id": row.id, "name": row.name, "box_name": row.boxname}
            obj_list.append(obj)

        # group by boxname
        grouped = {}
        for item in obj_list:
            key = item['box_name']
            if key not in grouped:
                grouped[key] = {
                    "boxtype": item['box_name'],
                    "dungeon_list": []
                }
            grouped[key]['dungeon_list'].append({
                "id": item['id'],
                "name": item['name']
            })
        return list(grouped.values())

    return None

def fetch_sea_producing_id(itemid: int, db: Session):
    fetched = db.execute( text(""" 
WITH A as (SELECT
distinct
  t.id, t.name, t.region, activity.key as activity, json_extract(rank_type.value, '$.랭크') as reqrank
FROM
  sea t,
  json_each(t.gatherable) AS activity,
  json_each(activity.value) AS rank_type,
  json_each(rank_type.value, '$.아이템') AS item_list

where json_extract(item_list.value, '$.id') = :itemid)
                         select A.id, A.name, json_extract(r.value, '$.name') as region_name, A.activity, A.reqrank 
                         from A,
                         json_each(A.region) as r;
    """), {'itemid': itemid}).fetchall()
    if fetched:
        obj_list = []
        for row in fetched:
            obj = {
                "id": row.id,
                "name": row.name,
                "region_name": row.region_name,
                "activity": row.activity,
                "reqrank": row.reqrank
            }
            obj_list.append(obj)
        # group by (activity, rank, region_name)
        grouped = {}
        for item in obj_list:
            key = (item['activity'], item['reqrank'], item['region_name'])
            if key not in grouped:
                grouped[key] = {
                    "activity": item['activity'],
                    "reqrank": item['reqrank'],
                    "region_name": item['region_name'],
                    "sea_list": []
                }
            grouped[key]['sea_list'].append({
                "id": item['id'],
                "name": item['name']
            })
        obj_list = list(grouped.values())
        # sort by (activity, reqrank, region_name)
        obj_list.sort(key=lambda x: (x['activity'], x['reqrank'] or '', x['region_name'] or ''))
        return obj_list
    return None

def fetch_private_farm_producing_id(itemid: int, db: Session):

    fetched = db.execute(text(""" 
                select t.id, t.name, json_extract(item.value, '$.id') , json_extract(facility.value , '$.facility') as fname from privatefarm t,
        json_each(t.products) as ftype,
        json_each(ftype.value) as facility,
        json_each(facility.value, '$.items') as itemsets,
        json_each(itemsets.value) as item
        where json_extract(item.value, '$.id') = :itemid;
 
                              """), {'itemid': itemid}).fetchall()
    
    if fetched:
        obj_list = []
        for row in fetched:
            obj = {
                "id": row.id,
                "name": row.name,
                "facility": row.fname
            }
            obj_list.append(obj)
        # group by facility
        grouped = {}
        for item in obj_list:
            key = item['facility']
            if key not in grouped:
                grouped[key] = {
                    "facility": item['facility'],
                    "privatefarm_list": []
                }
            grouped[key]['privatefarm_list'].append({
                "id": item['id'],
                "name": item['name']
            })
        return list(grouped.values())

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

    obt_ganador_list = fetch_ganador_producing_id(itemid, db)
    if obt_ganador_list:
        obtain_method_list.append(
            {"from": "ganador", "ganador_list": obt_ganador_list}
        )

    obt_citynpc_gift_list = fetch_citynpc_gift_producing_id(itemid, db)
    if obt_citynpc_gift_list:
        obtain_method_list.append(
            {"from": "citynpc_gift", "citynpc_list": obt_citynpc_gift_list}
        )

    obt_dungoen_list = fetch_dungeon_producing_id(itemid, db)
    if obt_dungoen_list:
        obtain_method_list.append(
            {"from": "dungeon", "dungeon_list": obt_dungoen_list}
        )
    obt_sea_list = fetch_sea_producing_id(itemid, db)
    if obt_sea_list:
        obtain_method_list.append(
            {"from": "sea", "sea_list": obt_sea_list}
        )

    obt_privatefarm_list = fetch_private_farm_producing_id(itemid, db)
    if obt_privatefarm_list:
        obtain_method_list.append(
            {"from": "private_farm", "privatefarm_list": obt_privatefarm_list}
        )    

    # if empty return None
    if not obtain_method_list:
        return None

    return obtain_method_list
