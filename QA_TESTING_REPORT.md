# TruLearnix QA Testing Report

**Date:** 2026-04-18
**Tester:** Claude Code AI (Automated QA)
**Environment:** Production — peptly.in
**Platform Version:** API v2.1 | Next.js 14.0.4
**Repo:** Ayankhan1267/truelearnix

---

## Executive Summary

| Category | Result |
|---|---|
| Services Running | ✅ 3/3 PASS |
| API Endpoints Tested | 14 endpoints |
| Critical Issues Found | 🔴 3 |
| High Issues Found | 🟠 5 |
| Medium Issues Found | 🟡 6 |
| Low Issues Found | 🟢 5 |
| TypeScript Errors | ✅ 0 (clean build) |
| PM2 Runtime Errors | ⚠️ Multiple recurring warnings |

> **Overall Verdict:** Platform is operational but has **3 critical security/data-integrity issues** that must be fixed before accepting real payments or launching to public users.

---

## 1. Service Status

| Service | Port | Status | Notes |
|---|---|---|---|
| API (Express + TypeScript) | 5000 | ✅ RUNNING | Health check passes |
| Web Frontend (Next.js) | 3000 | ✅ RUNNING | Minor recurring image 404 errors |
| Admin Panel (Next.js) | 3003 | ✅ RUNNING | `sharp` package missing warning |
| MongoDB | 27017 | ✅ CONNECTED | All DB queries succeed |
| Redis | 6379 | ✅ CONNECTED | Confirmed via PM2 logs |

---

## 2. API Endpoint Tests

| Endpoint | Method | HTTP Code | Result | Notes |
|---|---|---|---|---|
| `/health` | GET | 200 | ✅ PASS | Typo: "TureLearnix" in response |
| `/api/auth/register` | POST | 201 | ⚠️ CRITICAL | `_devOtp` exposed in production response |
| `/api/auth/login` | POST | 401 | ✅ PASS | Correct invalid credential handling |
| `/api/auth/verify-otp` | POST | 400 | ⚠️ FAIL | OTP expired; WhatsApp delivery broken |
| `/api/courses` | GET | 200 | ✅ PASS | Paginated results returned correctly |
| `/api/packages` | GET | 200 | ✅ PASS | All active packages returned |
| `/api/blog` | GET | 200 | ✅ PASS | Empty (no blog posts yet) |
| `/api/users/me` | GET (unauth) | 401 | ✅ PASS | Correctly blocked |
| `/api/users/enrolled-courses` | GET (unauth) | 401 | ✅ PASS | Correctly blocked |
| `/api/users/available-courses` | GET (unauth) | 401 | ✅ PASS | Correctly blocked |
| `/api/packages/my` | GET (unauth) | **500** | 🔴 FAIL | Route order bug — leaks DB schema error |
| `/api/admin` | GET (unauth) | 401 | ✅ PASS | Admin routes correctly protected |
| `/api/admin/users` | GET (unauth) | 401 | ✅ PASS | Correctly blocked |
| `/api/checkout/validate-code` | POST | 404 | ⚠️ MEDIUM | No rate limiting — enumeration risk |

---

## 3. Code Quality Issues

### 🔴 CRITICAL-1 — `/api/packages/my` Route Ordering Bug

**File:** `apps/api/src/routes/packages.ts`

```typescript
router.get('/:id', getPackageById);       // registered FIRST — wrong
router.get('/my', protect, getMyPackage); // NEVER REACHED
```

Express matches `/my` against `/:id`, treating `"my"` as a MongoDB ObjectId. This throws an unhandled Mongoose `CastError` returning HTTP 500 with:
```
"Cast to ObjectId failed for value \"my\" at path \"_id\" for model \"Package\""
```
This leaks internal DB schema details AND the endpoint is completely non-functional.

**Fix:** Move `router.get('/my', ...)` **above** `router.get('/:id', ...)`.

---

### 🔴 CRITICAL-2 — OTP Plaintext Exposed in Production API Responses

**File:** `apps/api/src/controllers/authController.ts`

Every OTP endpoint returns `_devOtp` in the production JSON response:
```json
{
  "success": true,
  "_devOtp": "436121",
  "message": "OTP sent"
}
```

This was **confirmed live** on the running production API. Any attacker can call `/register` and read the OTP directly from the response — completely defeating OTP security.

**Fix:** Remove `_devOtp` from all production responses. Gate behind `NODE_ENV !== 'production'` check.

---

### 🔴 CRITICAL-3 — PhonePe Payment Gateway in SANDBOX Mode on Production

**File:** `apps/api/.env`
```
NODE_ENV=production
PHONEPE_ENV=SANDBOX   ← BUG
```

Real user payments are processed against PhonePe test environment. Actual money will NOT be collected.

**Fix:** Set `PHONEPE_ENV=PRODUCTION` and verify production credentials.

---

### 🟠 HIGH-1 — Rate Limiter Completely Bypassed for Authenticated Users

**File:** `apps/api/src/index.ts`

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  skip: (req) => !!req.headers.authorization || !!req.headers.cookie  // ← bypasses ALL logged-in users
});
```

Any logged-in attacker can make unlimited API calls — hammering DB-heavy endpoints (leaderboards, commission aggregations) with zero throttling.

---

### 🟠 HIGH-2 — WhatsApp Meta Integration Not Configured

**Log:** `logs/api-error-13.log`
```
[NOVA-WA] META_PHONE_NUMBER_ID or META_WHATSAPP_TOKEN not set
```

`META_PHONE_NUMBER_ID` and `META_WHATSAPP_TOKEN` are missing from `.env`. All WhatsApp OTP messages and notifications silently fail. Since OTP delivery is WhatsApp-only (no SMS/email fallback), new user registration is broken in normal usage.

---

### 🟠 HIGH-3 — Razorpay Account Number is a Placeholder

**File:** `apps/api/.env`
```
RAZORPAY_ACCOUNT_NUMBER=your_razorpayx_account_number
```

RazorpayX payouts (partner withdrawals) will fail at processing time. Users can submit withdrawal requests that will never be paid out.

---

### 🟠 HIGH-4 — Affiliate Code Endpoint Has No Rate Limiting

**File:** `apps/api/src/routes/checkout.ts`

`POST /api/checkout/validate-code` is public, unauthenticated, and unthrottled. An attacker can enumerate all partner affiliate codes (format: `TL` + 6 alphanumeric chars) to map out the entire partner network.

---

### 🟠 HIGH-5 — AI Coach Running in Placeholder/Fallback Mode

**File:** `apps/api/src/routes/users.ts`

`OPENAI_API_KEY` is not set in `.env`. AI Coach returns hardcoded string-matching placeholder responses:
```typescript
const placeholders = { commission: "...", course: "...", default: "..." }
```
The UI prominently advertises "AI Coach — Ask anything" but users receive scripted canned replies.

---

### 🟡 MEDIUM-1 — Duplicate Mongoose Schema Indexes

**Files:** `models/User.ts`, `models/WhatsAppChat.ts`, `models/Blog.ts`

Fields like `affiliateCode`, `contactPhone`, and `slug` are declared with `unique: true` in the schema AND again via `schema.index()`. This generates recurring Mongoose warnings on every restart and creates extra indexes in MongoDB.

---

### 🟡 MEDIUM-2 — GST Rate Hardcoded in Frontend

**File:** `apps/web/app/(public)/checkout/page.tsx`
```typescript
const GST_RATE = 0.18  // hardcoded
```

The backend fetches GST rate dynamically from `PlatformSettings`. If admin changes the GST rate, the checkout page shows incorrect totals — a compliance and accounting risk.

---

### 🟡 MEDIUM-3 — Flash of Incorrect Content (FOUC) on Dashboard

**File:** `apps/web/app/(student)/student/dashboard/page.tsx`

```typescript
const isPaid = tier !== 'free' || !enrollmentsLoaded || ...
```

`!enrollmentsLoaded` is `true` before React Query fetch completes, making `isPaid = true` briefly. Free users momentarily see paid-tier content before it disappears once data loads.

---

### 🟡 MEDIUM-4 — EMI Commission Calculated on Partial Amount

**File:** `apps/api/src/routes/checkout.ts`

```typescript
const commSaleAmount = purchase.isEmi
  ? Math.ceil(purchase.amount / emiMonthsFinal)   // ← wrong
  : purchase.amount;
```

For EMI purchases, MLM commission is calculated on just 1 installment. Subsequent installments don't re-trigger `creditMLM`. Partners receive only ~25% of expected commission from EMI sales.

---

### 🟡 MEDIUM-5 — Placeholder WhatsApp Number in Checkout

**File:** `apps/web/app/(public)/checkout/page.tsx`

```html
<a href="https://wa.me/919999999999">Chat on WhatsApp</a>
```

`919999999999` is a fake placeholder. Users clicking "Chat on WhatsApp" at the critical checkout moment will reach a non-existent number.

---

### 🟡 MEDIUM-6 — Mentor Apply Endpoint Has No Input Validation

**File:** `apps/api/src/routes/auth.ts`

`/auth/mentor-apply` is public with no email/phone format validation, no duplicate phone check, and no captcha. Can be used to bulk-create junk "pending mentor" records.

---

### 🟢 LOW-1 — "TureLearnix" Typo in Service Name

**Files:** `apps/api/src/index.ts`, `apps/api/src/routes/users.ts`

`"TureLearnix"` appears instead of `"TruLearnix"` in: the `/health` endpoint response, startup log, and AI Coach system prompt.

---

### 🟢 LOW-2 — `sharp` Package Missing in Admin Panel

**Log:** Admin PM2 logs (every restart)
```
⚠ sharp package strongly recommended for production Image Optimization
```

`sharp` is in monorepo root but not detected by `apps/admin`. Admin panel serves images without optimization.

---

### 🟢 LOW-3 — Achievement Images Missing

**Log:** `apps/web/logs/web-error.log`
```
⨯ The requested resource isn't a valid image for /achievements/img-1.jpg
```

`/apps/web/public/achievements/` directory is empty. Images `img-1.jpg` through `img-5.jpg` are missing.

---

### 🟢 LOW-4 — Next.js Server Actions Proxy Header Error

**Log:** `apps/web/logs/web-error.log`
```
Missing `origin` header from a forwarded Server Actions request.
```

Nginx is not passing the `Origin` header to the Next.js upstream. Can cause intermittent form submission failures.

---

### 🟢 LOW-5 — Social Sharing `metadataBase` Not Set

**Log:** `apps/web/logs/web-error.log`
```
⚠ metadata.metadataBase is not set for resolving social open graph images
```

Open Graph / Twitter card images will use `http://localhost:3000` as base URL when shared on social media — broken links in all social previews.

---

## 4. TypeScript Build Results

| Project | Command | Result |
|---|---|---|
| `apps/api` | `npx tsc --noEmit` | ✅ **PASS** — 0 errors |
| `apps/web` | `npx tsc --noEmit` | ✅ **PASS** — 0 errors |

Both projects compile cleanly with no TypeScript errors.

---

## 5. Security Audit

| Check | Severity | Status |
|---|---|---|
| OTP plaintext in production API response | 🔴 CRITICAL | FAIL |
| PhonePe in SANDBOX mode on production | 🔴 CRITICAL | FAIL |
| Rate limiter bypassed for authenticated users | 🟠 HIGH | FAIL |
| Affiliate code enumeration (no rate limit) | 🟠 HIGH | FAIL |
| CORS whitelist | ✅ — | PASS |
| Admin route protection | ✅ — | PASS |
| Partner route protection | ✅ — | PASS |
| JWT configuration | ✅ — | PASS |
| Helmet middleware | ✅ — | PASS |
| Internal DB schema leaked in 500 error | 🟡 MEDIUM | FAIL |

---

## 6. Frontend Page Tests

| Page | URL | HTTP Code | Result | Notes |
|---|---|---|---|---|
| Homepage | `localhost:3000` | 200 | ✅ PASS | Loads correctly |
| Courses page | `localhost:3000/courses` | 200 | ✅ PASS | Loads correctly |
| Login page | `localhost:3000/login` | 200 | ✅ PASS | Loads correctly |
| Student Dashboard | `localhost:3000/student/dashboard` | 200 | ⚠️ PASS* | Client-side auth guard only (not server-side) |
| Admin Panel | `localhost:3003` | 200 | ✅ PASS | Loads correctly |

---

## 7. PM2 Runtime Log Summary

### API Process (`trulearnix-api`)
- Multiple restarts (high restart count: 310+)
- Recurring: Duplicate Mongoose index warnings (3 models)
- Recurring: `[NOVA-WA] META_PHONE_NUMBER_ID or META_WHATSAPP_TOKEN not set`

### Web Process (`trulearnix-web`)
- Restart count: 429+
- Recurring: `⨯ Not valid image: /achievements/img-*.jpg` (5 images)
- Recurring: `Missing origin header from forwarded Server Actions request`
- Recurring: `Error: Failed to find Server Action "null"`
- Warning: `metadata.metadataBase is not set`

### Admin Process (`trulearnix-admin`)
- Restart count: 216+
- Recurring: `⚠ sharp package strongly recommended`

---

## 8. Prioritized Recommendations

### 🔴 CRITICAL — Fix Immediately

| # | Action | File |
|---|---|---|
| C1 | Remove `_devOtp` from production API responses | `authController.ts` |
| C2 | Fix `/packages/my` route order (move above `/:id`) | `routes/packages.ts` |
| C3 | Set `PHONEPE_ENV=PRODUCTION` in `.env` | `.env` |

### 🟠 HIGH — Fix Before Launch

| # | Action | File |
|---|---|---|
| H1 | Add `META_PHONE_NUMBER_ID` + `META_WHATSAPP_TOKEN` to `.env` | `.env` |
| H2 | Replace `RAZORPAY_ACCOUNT_NUMBER` placeholder with real value | `.env` |
| H3 | Remove blanket `skip` on rate limiter for auth users | `index.ts` |
| H4 | Add per-IP rate limit to `/checkout/validate-code` | `routes/checkout.ts` |
| H5 | Set `OPENAI_API_KEY` or disable AI Coach UI | `.env` |

### 🟡 MEDIUM — Fix Before Marketing Push

| # | Action | File |
|---|---|---|
| M1 | Fetch GST rate from API in checkout page | `checkout/page.tsx` |
| M2 | Fix duplicate Mongoose indexes | `models/User.ts`, `Blog.ts`, `WhatsAppChat.ts` |
| M3 | Fix EMI commission to use full purchase amount | `routes/checkout.ts` |
| M4 | Replace fake WhatsApp number `919999999999` | `checkout/page.tsx` |
| M5 | Add mentor apply endpoint validation (email, phone, captcha) | `routes/auth.ts` |

### 🟢 LOW — Polish

| # | Action | File |
|---|---|---|
| L1 | Fix "TureLearnix" typo to "TruLearnix" | `index.ts`, `routes/users.ts` |
| L2 | Install `sharp` in `apps/admin` | `apps/admin/package.json` |
| L3 | Add achievement images to `public/achievements/` | Public assets |
| L4 | Configure Nginx to pass `Origin` header | `nginx/` config |
| L5 | Set `metadataBase` in root `layout.tsx` | `apps/web/app/layout.tsx` |

---

## Test Summary Table

| Feature | Status | Severity |
|---|---|---|
| API Health | ✅ PASS | — |
| User Registration | 🔴 CRITICAL | OTP plaintext in response |
| User Login | ✅ PASS | — |
| OTP Verification | 🔴 FAIL | WhatsApp not configured |
| Public Courses API | ✅ PASS | — |
| Public Packages API | ✅ PASS | — |
| Blog API | ✅ PASS | Empty but functional |
| Auth Guard (Protected Routes) | 🟠 PARTIAL | /packages/my returns 500 |
| Admin Route Security | ✅ PASS | — |
| Partner Route Security | ✅ PASS | — |
| Checkout Promo Code | 🟡 MEDIUM | No rate limiting |
| Payment Gateway (PhonePe) | 🔴 FAIL | SANDBOX mode on production |
| Payment Gateway (Razorpay) | 🟠 HIGH | Account number placeholder |
| MLM/Commission Logic | 🟡 MEDIUM | EMI commission incorrect |
| AI Coach | 🟠 HIGH | No OpenAI key — placeholder mode |
| WhatsApp Notifications | 🟠 FAIL | META credentials missing |
| TypeScript Build (API) | ✅ PASS | Clean — 0 errors |
| TypeScript Build (Web) | ✅ PASS | Clean — 0 errors |
| Frontend Pages | ✅ PASS | Minor asset issues |
| PM2 Stability | ⚠️ PARTIAL | Multiple recurring warnings |
| MongoDB | ✅ PASS | Connected |
| Redis | ✅ PASS | Connected |
| Rate Limiting | 🟠 FAIL | Auth users bypass limiter |

---

*Report generated by Claude Code AI automated QA on 2026-04-18*
*TruLearnix — peptly.in | Ayankhan1267/truelearnix*
