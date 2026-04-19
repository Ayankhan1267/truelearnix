#!/usr/bin/env python3
"""
TruLearnix Phase 2 Migration:
1. Mark package courses (isPackage=true)
2. Set user referredBy + upline1 relationships
3. Migrate product_referrals → Commission records
4. Set isAffiliate for all partners who referred anyone
"""

import re
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId

MONGO_URI = "mongodb://localhost:27017/trulearnix"
SQL_FILE = "/tmp/trulearnix_old.sql"

client = MongoClient(MONGO_URI)
db = client["trulearnix"]

def parse_dt(val):
    if not val: return None
    try: return datetime.strptime(val, '%Y-%m-%d %H:%M:%S')
    except:
        try: return datetime.strptime(val, '%Y-%m-%d')
        except: return None

print("Loading SQL...")
with open(SQL_FILE, 'r', encoding='utf-8', errors='replace') as f:
    sql = f.read()

# ── Build old_id → MongoDB _id map ──────────────────────────────────
print("Building ID map...")
users_map = {}  # old_mysql_id → mongo _id
for u in db.users.find({'_migratedFromOldId': {'$exists': True}}, {'_id': 1, '_migratedFromOldId': 1}):
    users_map[u['_migratedFromOldId']] = u['_id']

products_map = {}  # old product id → mongo course _id
for c in db.courses.find({'_migratedFromOldId': {'$exists': True}}, {'_id': 1, '_migratedFromOldId': 1}):
    products_map[c['_migratedFromOldId']] = c['_id']

print(f"  Users mapped: {len(users_map)}, Courses mapped: {len(products_map)}")

# ── Step 1: Mark package courses ────────────────────────────────────
print("\n--- Step 1: Mark package courses ---")
# Old package product IDs: TRU StarterX(1), TRU BoosterX(2), TRU AdvanceX(3),
# TRU Premium InfinityX(4), TRU Pro-EdgeX(5), TRU PROFITX(26)
PACKAGE_IDS = [1, 2, 3, 4, 5, 26]

pkg_updated = 0
for old_id in PACKAGE_IDS:
    mongo_id = products_map.get(old_id)
    if mongo_id:
        db.courses.update_one({'_id': mongo_id}, {'$set': {'isPackage': True}})
        pkg_updated += 1

# Also mark courses whose title starts with "TRU " as packages
tru_result = db.courses.update_many(
    {'title': {'$regex': '^TRU ', '$options': 'i'}, '_migratedFromOldId': {'$exists': True}},
    {'$set': {'isPackage': True}}
)
print(f"  Marked by ID: {pkg_updated}, Marked by TRU prefix: {tru_result.modified_count}")
total_pkgs = db.courses.count_documents({'isPackage': True})
print(f"  Total package courses: {total_pkgs}")

# ── Step 2: Parse old users for referred_by ──────────────────────────
print("\n--- Step 2: Set referredBy + upline1 ---")

# Extract users INSERT to get referred_by column
users_insert = re.search(
    r'INSERT INTO `users` \(([^)]+)\) VALUES\n([\s\S]+?)(?=\n--|\Z)',
    sql
)

ref_updated = 0
if users_insert:
    cols_str = users_insert.group(1)
    cols = [c.strip().strip('`') for c in cols_str.split(',')]
    ref_idx = cols.index('referred_by') if 'referred_by' in cols else -1
    id_idx = cols.index('id') if 'id' in cols else 0

    if ref_idx >= 0:
        # Parse each row
        rows_block = users_insert.group(2)
        for line in rows_block.split('\n'):
            line = line.strip().rstrip(',').rstrip(';')
            if not line.startswith('('): continue
            # Simple split by first-level commas
            inner = line[1:-1] if line.endswith(')') else line[1:]
            # Extract id and referred_by using regex
            all_vals = re.findall(r"'(?:[^'\\]|\\.)*'|NULL|\d+(?:\.\d+)?", inner)
            if len(all_vals) > ref_idx:
                try:
                    old_id = int(all_vals[id_idx])
                    ref_val = all_vals[ref_idx]
                    if ref_val != 'NULL' and ref_val.isdigit():
                        ref_old_id = int(ref_val)
                        mongo_user = users_map.get(old_id)
                        mongo_ref = users_map.get(ref_old_id)
                        if mongo_user and mongo_ref:
                            db.users.update_one(
                                {'_id': mongo_user},
                                {'$set': {
                                    'referredBy': mongo_ref,
                                    'upline1': mongo_ref,
                                    'isAffiliate': True  # if they were referred, they joined the network
                                }}
                            )
                            # Mark the referrer as affiliate
                            db.users.update_one({'_id': mongo_ref}, {'$set': {'isAffiliate': True}})
                            ref_updated += 1
                except: pass

print(f"  Referral relationships set: {ref_updated}")

# ── Step 3: Parse product_referrals → Commission ─────────────────────
print("\n--- Step 3: Migrate product_referrals → Commission ---")

# Extract product_referrals data
ref_blocks = re.findall(
    r'INSERT INTO `product_referrals` \([^)]+\) VALUES\n([\s\S]+?)(?=\n--|\Z)',
    sql
)

Commission = db['commissions']
inserted_comm = 0
skipped_comm = 0

for block in ref_blocks:
    for line in block.split('\n'):
        line = line.strip().rstrip(',').rstrip(';')
        if not line.startswith('('): continue
        m = re.match(
            r'\((\d+),\s*(\d+),\s*(\d+|NULL),\s*(\d+),\s*(\d+),\s*(\d+),\s*\'([^\']+)\',\s*\'([^\']+)\'',
            line
        )
        if not m: continue

        old_id    = int(m.group(1))
        ref_by    = int(m.group(2))     # partner who earned
        ref_to    = m.group(3)           # buyer (may be NULL)
        product_id = int(m.group(4))
        order_id  = int(m.group(5))
        commission = int(m.group(6))
        created_at = parse_dt(m.group(7))

        earner_id = users_map.get(ref_by)
        buyer_id  = users_map.get(int(ref_to)) if ref_to != 'NULL' else None
        course_id = products_map.get(product_id)

        if not earner_id:
            skipped_comm += 1
            continue

        # Check duplicate
        if Commission.find_one({'_migratedFromOldId': old_id}):
            skipped_comm += 1
            continue

        # Get earner tier
        earner = db.users.find_one({'_id': earner_id}, {'packageTier': 1, 'name': 1})
        earner_tier = earner.get('packageTier', 'free') if earner else 'free'

        doc = {
            'earner': earner_id,
            'earnerTier': earner_tier,
            'earnerCommissionRate': 0,
            'buyer': buyer_id,
            'buyerPackageTier': 'free',
            'level': 1,
            'levelRate': 0,
            'saleAmount': commission * 2,  # approx sale amount
            'commissionAmount': commission,
            'saleType': 'course',
            'status': 'approved',
            '_migratedFromOldId': old_id,
            '_migratedOrderId': order_id,
            'createdAt': created_at or datetime.utcnow(),
            'updatedAt': created_at or datetime.utcnow(),
        }
        if course_id:
            doc['paymentId'] = course_id  # store course ref

        Commission.insert_one(doc)

        # Update earner's totalEarnings
        db.users.update_one(
            {'_id': earner_id},
            {'$inc': {'totalEarnings': commission}, '$set': {'isAffiliate': True}}
        )
        inserted_comm += 1

print(f"  Commission records inserted: {inserted_comm}, Skipped: {skipped_comm}")

# ── Step 4: Recalculate totalEarnings from commissions ───────────────
print("\n--- Step 4: Sync totalEarnings for all affiliate users ---")

pipeline = [
    {'$match': {'status': {'$in': ['approved', 'paid']}}},
    {'$group': {'_id': '$earner', 'total': {'$sum': '$commissionAmount'}}}
]
earnings_agg = list(Commission.aggregate(pipeline))
sync_count = 0
for e in earnings_agg:
    if e['_id']:
        db.users.update_one({'_id': e['_id']}, {'$set': {'totalEarnings': e['total']}})
        sync_count += 1
print(f"  Synced earnings for {sync_count} users")

# ── Step 5: Mark all package-tier users as affiliates ────────────────
print("\n--- Step 5: Mark all package-tier migrated users as affiliates ---")
result = db.users.update_many(
    {
        '_migratedFromOldId': {'$exists': True},
        'xpPoints': {'$gt': 0}
    },
    {'$set': {'isAffiliate': True}}
)
print(f"  Marked as affiliates: {result.modified_count}")

# ── Summary ──────────────────────────────────────────────────────────
print("\n" + "="*50)
print("PHASE 2 MIGRATION COMPLETE")
print("="*50)
print(f"Package courses marked: {total_pkgs}")
print(f"User referral links set: {ref_updated}")
print(f"Commission records: {inserted_comm}")
print(f"Affiliate users: {db.users.count_documents({'isAffiliate': True, '_migratedFromOldId': {'$exists': True}})}")
print(f"Leaderboard eligible: {db.users.count_documents({'isAffiliate': True, 'totalEarnings': {'$gt': 0}})}")
print("="*50)

client.close()
