#!/usr/bin/env python3
"""
TruLearnix Old Website → MongoDB Migration Script
Migrates: users, user_details, products (as courses), orders (as payments)
"""

import re
import json
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId

MONGO_URI = "mongodb://localhost:27017/trulearnix"
SQL_FILE = "/tmp/trulearnix_old.sql"

client = MongoClient(MONGO_URI)
db = client["trulearnix"]

# ─────────────────────────────────────────────────────────────
# SQL Parsing Helpers
# ─────────────────────────────────────────────────────────────

def parse_sql_values(block: str):
    """Extract rows from a multi-row INSERT VALUES block."""
    rows = []
    # Remove trailing semicolon
    block = block.strip().rstrip(';')
    # Find all top-level (...) groups (handles nested parens in JSON strings)
    depth = 0
    current = []
    inside = False
    i = 0
    while i < len(block):
        c = block[i]
        if c == '(' and not inside:
            depth += 1
            if depth == 1:
                inside = True
                current = []
                i += 1
                continue
        if inside:
            if c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
                if depth == 0:
                    rows.append(''.join(current))
                    inside = False
                    i += 1
                    continue
            current.append(c)
        i += 1
    return rows

def parse_row(row_str: str):
    """Parse a single CSV-like row from SQL INSERT (handles NULL, strings, numbers)."""
    values = []
    i = 0
    s = row_str.strip()
    while i < len(s):
        if s[i] == "'":
            # String value - find closing quote, handling escaped quotes
            j = i + 1
            result = []
            while j < len(s):
                if s[j] == '\\':
                    nxt = s[j+1] if j+1 < len(s) else ''
                    if nxt == "'":
                        result.append("'")
                        j += 2
                    elif nxt == '\\':
                        result.append('\\')
                        j += 2
                    elif nxt == 'n':
                        result.append('\n')
                        j += 2
                    elif nxt == 'r':
                        result.append('\r')
                        j += 2
                    else:
                        result.append(s[j])
                        j += 1
                elif s[j] == "'":
                    j += 1
                    break
                else:
                    result.append(s[j])
                    j += 1
            values.append(''.join(result))
            i = j
            # skip comma
            while i < len(s) and s[i] in (' ', ','):
                i += 1
        elif s[i:i+4].upper() == 'NULL':
            values.append(None)
            i += 4
            while i < len(s) and s[i] in (' ', ','):
                i += 1
        else:
            # number or unquoted value
            j = i
            while j < len(s) and s[j] not in (',',):
                j += 1
            val = s[i:j].strip()
            try:
                if '.' in val:
                    values.append(float(val))
                else:
                    values.append(int(val))
            except ValueError:
                values.append(val)
            i = j
            while i < len(s) and s[i] in (' ', ','):
                i += 1
    return values

def extract_table_data(sql_content: str, table: str):
    """Extract all INSERT rows for a given table."""
    pattern = rf"INSERT INTO `{table}` \(([^)]+)\) VALUES\n([\s\S]+?)(?=\n\n|\Z)"
    matches = re.findall(pattern, sql_content)
    all_rows = []
    for columns_str, values_block in matches:
        columns = [c.strip().strip('`') for c in columns_str.split(',')]
        row_strings = parse_sql_values(values_block)
        for row_str in row_strings:
            try:
                values = parse_row(row_str)
                if len(values) == len(columns):
                    all_rows.append(dict(zip(columns, values)))
                else:
                    # Try to align partial rows
                    row_dict = dict(zip(columns[:len(values)], values))
                    all_rows.append(row_dict)
            except Exception as e:
                pass
    return all_rows

def parse_dt(val):
    if not val:
        return None
    try:
        return datetime.strptime(val, '%Y-%m-%d %H:%M:%S')
    except:
        try:
            return datetime.strptime(val, '%Y-%m-%d')
        except:
            return None

def generate_affiliate_code():
    import random
    import string
    chars = string.ascii_uppercase + string.digits
    return 'TL' + ''.join(random.choices(chars, k=6))

# ─────────────────────────────────────────────────────────────
# Load SQL
# ─────────────────────────────────────────────────────────────
print("Loading SQL file...")
with open(SQL_FILE, 'r', encoding='utf-8', errors='replace') as f:
    sql_content = f.read()
print(f"File loaded: {len(sql_content)} chars")

# ─────────────────────────────────────────────────────────────
# Step 1: Extract all table data
# ─────────────────────────────────────────────────────────────
print("\nExtracting table data...")
users_data = extract_table_data(sql_content, 'users')
user_details_data = extract_table_data(sql_content, 'user_details')
products_data = extract_table_data(sql_content, 'products')
orders_data = extract_table_data(sql_content, 'orders')

print(f"  Users:        {len(users_data)}")
print(f"  User Details: {len(user_details_data)}")
print(f"  Products:     {len(products_data)}")
print(f"  Orders:       {len(orders_data)}")

# Build user_details lookup by user_id
ud_by_user = {ud['user_id']: ud for ud in user_details_data}

# ─────────────────────────────────────────────────────────────
# Step 2: Migrate Users
# ─────────────────────────────────────────────────────────────
print("\n--- Migrating Users ---")
users_coll = db['users']

old_id_to_mongo = {}  # old MySQL id → MongoDB ObjectId
skipped_users = 0
inserted_users = 0
updated_users = 0

for u in users_data:
    email = (u.get('email') or '').lower().strip()
    if not email:
        skipped_users += 1
        continue

    ud = ud_by_user.get(u.get('id'))

    # Map role
    old_role = u.get('role', 'user')
    role = 'admin' if old_role == 'admin' else 'student'

    # Fix password: PHP $2y$ → Node bcryptjs $2b$
    pwd = u.get('password', '')
    if pwd.startswith('$2y$'):
        pwd = '$2b$' + pwd[4:]

    # KYC status
    kyc_status = 'verified' if u.get('is_kyc_verified') == 1 else 'pending'

    # Affiliate code
    aff_code = generate_affiliate_code()

    doc = {
        'name': u.get('name', '').strip(),
        'email': email,
        'phone': str(u.get('contact') or '').strip(),
        'password': pwd,
        'role': role,
        'avatar': u.get('image') or 'user.jpg',
        'isVerified': bool(u.get('email_verified_at')),
        'isActive': u.get('status') == 1,
        'packageTier': 'free',
        'isAffiliate': False,
        'commissionRate': 0,
        'affiliateCode': aff_code,
        'wallet': 0,
        'totalEarnings': 0,
        'totalWithdrawn': 0,
        'xpPoints': int(u.get('reward_points') or 0),
        'level': 1,
        'badges': [],
        'streak': 0,
        'loginCount': 0,
        'packageSuspended': False,
        'promoDiscountPercent': 0,
        'favoriteCourses': [],
        'country': 'India',
        'kyc': {
            'status': kyc_status,
            'aadhar': ud.get('aadhar') if ud else None,
            'pan': ud.get('pancard') if ud else None,
        },
        'bio': ud.get('about') if ud else None,
        'state': ud.get('state') if ud else None,
        '_migratedFromOldId': u.get('id'),
        '_migratedAt': datetime.utcnow(),
        'createdAt': parse_dt(u.get('created_at')) or datetime.utcnow(),
        'updatedAt': parse_dt(u.get('updated_at')) or datetime.utcnow(),
    }

    # Remove None values for cleanliness (keep kyc)
    doc = {k: v for k, v in doc.items() if v is not None or k in ('bio', 'state', 'avatar')}

    # Check if user already exists
    existing = users_coll.find_one({'email': email})
    if existing:
        old_id_to_mongo[u.get('id')] = existing['_id']
        updated_users += 1
    else:
        result = users_coll.insert_one(doc)
        old_id_to_mongo[u.get('id')] = result.inserted_id
        inserted_users += 1

print(f"  Inserted: {inserted_users}, Already existed (skipped): {updated_users}, Skipped (no email): {skipped_users}")

# ─────────────────────────────────────────────────────────────
# Step 3: Migrate Products → Courses
# ─────────────────────────────────────────────────────────────
print("\n--- Migrating Products → Courses ---")
courses_coll = db['courses']

# Get admin user to use as mentor
admin_user = users_coll.find_one({'role': 'admin'})
admin_id = admin_user['_id'] if admin_user else ObjectId()

old_product_to_course = {}  # old product id → MongoDB course ObjectId
inserted_courses = 0
skipped_courses = 0

for p in products_data:
    title = (p.get('title') or '').strip()
    if not title or title == 'default':
        skipped_courses += 1
        continue

    slug = (p.get('slug') or re.sub(r'[^a-z0-9]+', '-', title.lower())).strip('-')

    # Map level
    level_map = {'beginner': 'beginner', 'intermediate': 'intermediate', 'advanced': 'advanced'}
    level_raw = (p.get('level') or 'Intermediate').lower()
    level = level_map.get(level_raw, 'intermediate')

    try:
        price = int(float(str(p.get('price') or 0).replace('`', '')))
    except (ValueError, TypeError):
        price = 0
    try:
        actual_price = float(str(p.get('actual_price') or price).replace('`', ''))
    except (ValueError, TypeError):
        actual_price = float(price)

    doc = {
        'title': title,
        'slug': slug + '-old-' + str(p.get('id')),  # unique slug with old product id
        'description': p.get('description') or '',
        'shortDescription': (p.get('subtitle') or '')[:200],
        'thumbnail': p.get('thumbnail_img') or '',
        'mentor': admin_id,
        'category': 'General',
        'tags': [],
        'price': price,
        'discountPrice': int(actual_price) if actual_price < price else None,
        'modules': [],
        'level': level,
        'language': p.get('language') or 'English',
        'requirements': [],
        'outcomes': [],
        'highlights': [],
        'faqs': [],
        'status': 'published' if p.get('status') == 1 else 'draft',
        'enrolledCount': 0,
        'rating': 0,
        'ratingCount': 0,
        'reviews': [],
        'certificate': False,
        '_migratedFromOldId': p.get('id'),
        '_migratedAt': datetime.utcnow(),
        'createdAt': parse_dt(p.get('created_at')) or datetime.utcnow(),
        'updatedAt': parse_dt(p.get('updated_at')) or datetime.utcnow(),
    }

    # Check for existing by old product id
    try:
        existing = courses_coll.find_one({'_migratedFromOldId': p.get('id')})
        if existing:
            old_product_to_course[p.get('id')] = existing['_id']
            skipped_courses += 1
        else:
            result = courses_coll.insert_one(doc)
            old_product_to_course[p.get('id')] = result.inserted_id
            inserted_courses += 1
    except Exception as e:
        print(f"  Warning: Could not insert course '{title}': {e}")
        skipped_courses += 1

print(f"  Inserted: {inserted_courses}, Already existed (skipped): {skipped_courses}")

# ─────────────────────────────────────────────────────────────
# Step 4: Migrate Orders → Payments
# ─────────────────────────────────────────────────────────────
print("\n--- Migrating Orders → Payments ---")
payments_coll = db['payments']

inserted_payments = 0
skipped_payments = 0

for o in orders_data:
    user_mongo_id = old_id_to_mongo.get(o.get('user_id'))
    if not user_mongo_id:
        skipped_payments += 1
        continue

    course_mongo_id = old_product_to_course.get(o.get('product_id'))
    if not course_mongo_id:
        skipped_payments += 1
        continue

    payment_status = o.get('payment_status', '').upper()
    status_map = {'PAID': 'paid', 'PENDING': 'created', 'FAILED': 'failed', 'APPROVED': 'paid', 'REFUNDED': 'refunded'}
    status = status_map.get(payment_status, 'created')

    order_no = o.get('order_no') or o.get('order_id') or f"MIGRATED-{o.get('id')}"
    payment_id = o.get('payment_id') or ''

    # Check duplicate by old order id
    existing = payments_coll.find_one({'_migratedFromOldId': o.get('id')})
    if existing:
        skipped_payments += 1
        continue

    doc = {
        'user': user_mongo_id,
        'course': course_mongo_id,
        'amount': float(o.get('amount') or 0),
        'currency': o.get('currency') or 'INR',
        'razorpayOrderId': str(order_no),
        'razorpayPaymentId': str(payment_id) if payment_id else None,
        'status': status,
        '_migratedFromOldId': o.get('id'),
        '_migratedGateway': o.get('gateway') or 'stripe',
        '_migratedAt': datetime.utcnow(),
        'createdAt': parse_dt(o.get('created_at')) or datetime.utcnow(),
        'updatedAt': parse_dt(o.get('updated_at')) or datetime.utcnow(),
    }

    payments_coll.insert_one(doc)
    inserted_payments += 1

print(f"  Inserted: {inserted_payments}, Skipped (no user/product match): {skipped_payments}")

# ─────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────
print("\n" + "="*50)
print("MIGRATION COMPLETE")
print("="*50)
print(f"Users    → Inserted: {inserted_users}, Skipped (duplicate): {updated_users}")
print(f"Courses  → Inserted: {inserted_courses}, Skipped: {skipped_courses}")
print(f"Payments → Inserted: {inserted_payments}, Skipped: {skipped_payments}")
print("\nNote: Old bcrypt passwords ($2y$) converted to $2b$ for Node.js compatibility.")
print("Note: All migrated records have '_migratedFromOldId' field for traceability.")
print("="*50)

client.close()
