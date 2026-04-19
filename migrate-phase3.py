#!/usr/bin/env python3
"""
TruLearnix Phase 3 — Complete Migration
Migrates: Enrollments, Contacts→Leads, Videos→Course Lessons,
          Categories, Settings, Addresses, Webinars/Events
"""
import re, json
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017/trulearnix")
db = client["trulearnix"]

def parse_dt(v):
    if not v or v=='NULL': return None
    for fmt in ('%Y-%m-%d %H:%M:%S','%Y-%m-%d'):
        try: return datetime.strptime(v.strip("'"), fmt)
        except: pass
    return None

def clean(v):
    if v is None or v=='NULL': return None
    v=str(v).strip()
    if v.startswith("'") and v.endswith("'"): v=v[1:-1]
    return v or None

print("Loading SQL...")
with open("/tmp/trulearnix_old.sql","r",encoding="utf-8",errors="replace") as f:
    sql = f.read()

# ── ID Maps ──────────────────────────────────────────────────────────
users_map={u['_migratedFromOldId']:u['_id'] for u in db.users.find({'_migratedFromOldId':{'$exists':True}},{'_id':1,'_migratedFromOldId':1})}
courses_map={c['_migratedFromOldId']:c['_id'] for c in db.courses.find({'_migratedFromOldId':{'$exists':True}},{'_id':1,'_migratedFromOldId':1})}
payments_map={p['_migratedFromOldId']:p['_id'] for p in db.payments.find({'_migratedFromOldId':{'$exists':True}},{'_id':1,'_migratedFromOldId':1})}

print(f"Maps: users={len(users_map)}, courses={len(courses_map)}, payments={len(payments_map)}")

def parse_rows(table):
    """Parse all INSERT rows for a table → list of dicts"""
    rows=[]
    blocks=re.findall(rf'INSERT INTO `{re.escape(table)}` \(([^)]+)\) VALUES\n([\s\S]+?)(?=\n--|\n\n|;$|\Z)',sql)
    for cols_raw, body in blocks:
        cols=[c.strip().strip('`') for c in cols_raw.split(',')]
        for line in body.split('\n'):
            line=line.strip().rstrip(',').rstrip(';')
            if not line.startswith('('): continue
            inner=line[1:line.rfind(')')]
            # tokenize
            vals,cur,depth,in_str,esc=[],[],0,False,False
            for ch in inner:
                if esc: cur.append(ch);esc=False;continue
                if ch=='\\': esc=True;cur.append(ch);continue
                if ch=="'" and not in_str: in_str=True;cur.append(ch);continue
                if ch=="'" and in_str: in_str=False;cur.append(ch);continue
                if in_str: cur.append(ch);continue
                if ch=='(': depth+=1;cur.append(ch);continue
                if ch==')': depth-=1;cur.append(ch);continue
                if ch==',' and depth==0:
                    vals.append(''.join(cur).strip()); cur=[]
                else: cur.append(ch)
            if cur: vals.append(''.join(cur).strip())
            if len(vals)==len(cols):
                rows.append({c:clean(v) for c,v in zip(cols,vals)})
    return rows

# ═══════════════════════════════════════════════════════════════════
# 1. ENROLLMENTS from orders (user bought a product = enrolled)
# ═══════════════════════════════════════════════════════════════════
print("\n--- 1. Enrollments ---")
Enrollment=db['enrollments']
orders=parse_rows('orders')
ins_enroll=skip_enroll=0

for o in orders:
    uid=int(o.get('user_id') or 0)
    pid=int(o.get('product_id') or 0) if o.get('product_id') else None
    oid=int(o.get('id') or 0)
    status=(o.get('payment_status') or '').upper()

    if not pid or status not in ('PAID','APPROVED'):
        skip_enroll+=1; continue

    student=users_map.get(uid)
    course=courses_map.get(pid)
    if not student or not course:
        skip_enroll+=1; continue

    # Skip duplicate by orderId or by student+course combo
    if Enrollment.find_one({'_migratedFromOldId':oid}):
        skip_enroll+=1; continue
    if Enrollment.find_one({'student':student,'course':course}):
        skip_enroll+=1; continue

    payment_id=payments_map.get(oid)
    Enrollment.insert_one({
        'student': student,
        'course': course,
        'paymentId': payment_id,
        'status': 'active',
        'progress': 0,
        'completedLessons': [],
        '_migratedFromOldId': oid,
        'createdAt': parse_dt(o.get('created_at')) or datetime.utcnow(),
        'updatedAt': parse_dt(o.get('updated_at')) or datetime.utcnow(),
    })
    # Update course enrolledCount
    db.courses.update_one({'_id':course},{'$inc':{'enrolledCount':1}})
    ins_enroll+=1

print(f"  Enrollments: inserted={ins_enroll}, skipped={skip_enroll}")

# ═══════════════════════════════════════════════════════════════════
# 2. CONTACTS → Leads
# ═══════════════════════════════════════════════════════════════════
print("\n--- 2. Contacts → Leads ---")
Lead=db['leads']
contacts=parse_rows('contacts')
ins_lead=0
status_map={'0':'rejected','1':'new','2':'junk','3':'contacted'}

for c in contacts:
    cid=int(c.get('id') or 0)
    email=(c.get('email') or '').lower().strip()
    name=c.get('name') or 'Unknown'
    if not email or '@' not in email: continue
    if Lead.find_one({'_migratedFromOldId':cid}): continue
    Lead.insert_one({
        'name': name,
        'email': email,
        'phone': c.get('contact'),
        'message': c.get('message'),
        'status': status_map.get(str(c.get('status') or '1'),'new'),
        'source': 'website_contact_form',
        '_migratedFromOldId': cid,
        'createdAt': parse_dt(c.get('created_at')) or datetime.utcnow(),
        'updatedAt': parse_dt(c.get('updated_at')) or datetime.utcnow(),
    })
    ins_lead+=1

print(f"  Leads inserted: {ins_lead}")

# ═══════════════════════════════════════════════════════════════════
# 3. PRODUCT_VIDEOS → Course lessons/modules
# ═══════════════════════════════════════════════════════════════════
print("\n--- 3. Product Videos → Course Lessons ---")
videos=parse_rows('product_videos')
# Group by product_id
from collections import defaultdict
vids_by_product=defaultdict(list)
for v in videos:
    pid=int(v.get('product_id') or 0)
    if v.get('status')=='1' or v.get('status')==1:
        vids_by_product[pid].append(v)

ins_lessons=0
for old_pid, vids in vids_by_product.items():
    course_id=courses_map.get(old_pid)
    if not course_id: continue
    course=db.courses.find_one({'_id':course_id})
    if not course: continue

    # Build module with lessons
    existing_modules=course.get('modules',[])
    if existing_modules: continue  # skip if already has modules

    lessons=[]
    for i,v in enumerate(vids):
        url=v.get('video_url') or ''
        lessons.append({
            '_id': ObjectId(),
            'title': v.get('title') or f'Lesson {i+1}',
            'type': 'video',
            'videoUrl': url,
            'order': i+1,
            'isPreview': i==0,  # first lesson is preview
            'duration': 0,
        })
        ins_lessons+=1

    if lessons:
        module={
            '_id': ObjectId(),
            'title': 'Course Content',
            'order': 1,
            'lessons': lessons
        }
        db.courses.update_one({'_id':course_id},{'$set':{'modules':[module]}})

print(f"  Lessons added: {ins_lessons}")

# ═══════════════════════════════════════════════════════════════════
# 4. CATEGORIES → Update course categories
# ═══════════════════════════════════════════════════════════════════
print("\n--- 4. Categories → Update courses ---")
cats=parse_rows('categories')
cat_map={int(c.get('id') or 0): c.get('name') or 'General' for c in cats}
print(f"  Categories found: {cat_map}")

# Get products with their category_id from SQL
prod_cats={}
for line in sql.split('\n'):
    line=line.strip().rstrip(',')
    if not line.startswith('('): continue
    if "'single'" not in line and "'package'" not in line: continue
    # product row: (id, title, subtitle, desc, slug, category_id, ...)
    m=re.match(r'\((\d+),\s*\'[^\']*\',\s*\'[^\']*\',\s*(?:\'[^\']*\'|NULL),\s*\'[^\']*\',\s*(\d+|NULL),', line)
    if m:
        prod_cats[int(m.group(1))]=int(m.group(2)) if m.group(2)!='NULL' else None

updated_cats=0
for old_pid, cat_id in prod_cats.items():
    course_id=courses_map.get(old_pid)
    cat_name=cat_map.get(cat_id,'General') if cat_id else 'General'
    if course_id and cat_name:
        db.courses.update_one({'_id':course_id},{'$set':{'category':cat_name}})
        updated_cats+=1

print(f"  Course categories updated: {updated_cats}")

# ═══════════════════════════════════════════════════════════════════
# 5. SETTINGS → Platform settings
# ═══════════════════════════════════════════════════════════════════
print("\n--- 5. Settings ---")
settings=parse_rows('settings')
settings_dict={}
for s in settings:
    key=s.get('key') or s.get('name')
    val=s.get('value') or s.get('val')
    if key and val:
        settings_dict[key]=val

if settings_dict:
    # Update existing platform settings
    ps=db.platformsettings.find_one()
    if ps:
        update={}
        if settings_dict.get('site_name'): update['siteName']=settings_dict['site_name']
        if settings_dict.get('site_email'): update['supportEmail']=settings_dict['site_email']
        if settings_dict.get('site_address'): update['address']=settings_dict['site_address']
        if settings_dict.get('contact_phone'): update['phone']=settings_dict['contact_phone']
        if settings_dict.get('site_logo'): update['logo']='https://trulearnix.com/images/logos/'+settings_dict['site_logo']
        if update:
            db.platformsettings.update_one({'_id':ps['_id']},{'$set':update})
            print(f"  Platform settings updated: {list(update.keys())}")
    print(f"  Total settings found: {len(settings_dict)}")

# ═══════════════════════════════════════════════════════════════════
# 6. ADDRESSES → Add to users
# ═══════════════════════════════════════════════════════════════════
print("\n--- 6. Addresses → Users ---")
addresses=parse_rows('addresses')
upd_addr=0
for a in addresses:
    uid=int(a.get('user_id') or 0)
    mongo_id=users_map.get(uid)
    if not mongo_id: continue
    user=db.users.find_one({'_id':mongo_id},{'state':1,'country':1})
    update={}
    if not user.get('state') and a.get('state'): update['state']=a['state']
    if a.get('city'): update['city']=a['city']
    if a.get('country') and a['country']!='India': update['country']=a['country']
    if update:
        db.users.update_one({'_id':mongo_id},{'$set':update})
        upd_addr+=1

print(f"  Addresses merged: {upd_addr}")

# ═══════════════════════════════════════════════════════════════════
# 7. EVENTS → Webinars
# ═══════════════════════════════════════════════════════════════════
print("\n--- 7. Events → Webinars ---")
Webinar=db['webinars']
events=parse_rows('events')
ins_web=0
for e in events:
    eid=int(e.get('id') or 0)
    if Webinar.find_one({'_migratedFromOldId':eid}): continue
    img=e.get('image') or ''
    Webinar.insert_one({
        'title': e.get('title') or e.get('name') or 'Event',
        'description': e.get('description') or '',
        'price': float(e.get('amount') or 0),
        'thumbnail': ('https://trulearnix.com/images/product/'+img) if img else '',
        'startDate': parse_dt(e.get('start')),
        'endDate': parse_dt(e.get('expiry')),
        'status': 'published' if e.get('status')=='1' else 'draft',
        'isActive': e.get('status')=='1',
        '_migratedFromOldId': eid,
        'createdAt': parse_dt(e.get('created_at')) or datetime.utcnow(),
        'updatedAt': parse_dt(e.get('updated_at')) or datetime.utcnow(),
    })
    ins_web+=1

print(f"  Webinars inserted: {ins_web}")

# ═══════════════════════════════════════════════════════════════════
# 8. PACKAGE PURCHASES — users who bought packages get proper tier
# ═══════════════════════════════════════════════════════════════════
print("\n--- 8. Set package tiers for buyers ---")
# Package products: 1=StarterX(4999), 2=BoosterX(7999), 3=AdvanceX(11999), 4=PremiumInfinityX(21500), 5=ProEdgeX(15500)
# Map to new tiers by price
PRICE_TO_TIER={
    4999:'starter', 7999:'pro', 11999:'pro',
    15500:'elite', 21500:'elite', 29999:'supreme', 31999:'elite'
}
pkg_product_ids={1,2,3,4,5,26}

tier_set=0
for o in orders:
    uid=int(o.get('user_id') or 0)
    pid=int(o.get('product_id') or 0) if o.get('product_id') else None
    status=(o.get('payment_status') or '').upper()
    if status not in ('PAID','APPROVED'): continue
    if not pid: continue

    amount=float(o.get('amount') or 0)
    mongo_user=users_map.get(uid)
    if not mongo_user: continue

    # Determine tier
    tier=None
    if pid in pkg_product_ids:
        tier=PRICE_TO_TIER.get(int(amount),'starter')

    if tier:
        from datetime import timedelta
        purchased=parse_dt(o.get('created_at')) or datetime.utcnow()
        db.users.update_one({'_id':mongo_user},{'$set':{
            'packageTier': tier,
            'packagePurchasedAt': purchased,
            'isAffiliate': True,
        }})
        tier_set+=1

print(f"  Package tiers set: {tier_set}")

# ═══════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════
print("\n"+"="*55)
print("PHASE 3 MIGRATION COMPLETE")
print("="*55)
print(f"Enrollments:     {db.enrollments.count_documents({'_migratedFromOldId':{'$exists':True}})}")
print(f"Leads:           {db.leads.count_documents({'_migratedFromOldId':{'$exists':True}})}")
print(f"Webinars:        {db.webinars.count_documents({'_migratedFromOldId':{'$exists':True}})}")
print(f"Course videos:   {ins_lessons} lessons added to courses")
print(f"Categories:      {updated_cats} courses updated")
print(f"Package tiers:   {tier_set} users updated")
print(f"\nMongoDB Collections:")
for col in ['users','enrollments','courses','payments','commissions','leads','webinars']:
    print(f"  {col:20s}: {db[col].count_documents({})}")
print("="*55)

client.close()
