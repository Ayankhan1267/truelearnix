# TruLearnix — Next Phase Plan
**Date:** 2026-04-13
**Status:** Structure complete → Moving to Polish + AI Integration

---

## What's Done So Far ✅

### Backend / API
- Auth (JWT, roles: student, partner, sales, manager, admin, superadmin)
- Packages with EMI, tier, commission config (partner + sales + manager)
- Affiliate link purchase flow (checkout with PhonePe + wallet)
- EMI installment tracking — per-installment commission for partner, sales, manager
- Sales leads pipeline (CRM) — stages, follow-up, conversion
- Manager panel — assigned partners, EMI commissions, leaderboard
- Admin full control — users, packages, EMI, sales-team, partners, managers
- Promo code discount per package
- AI Coach (Nova) — chat with context
- Live classes, materials, recordings
- Notifications, wallet, transactions

### Frontend Panels Built
| Panel | Status |
|-------|--------|
| Learner (student) | Done |
| Partner | Done |
| Sales | Done |
| Manager | Done |
| Mentor | Done |
| Admin | Done |

---

## Next Phase — Full UI Redesign + AI Integration

### 1. Global Design System
- Consistent color tokens, spacing, typography across all panels
- Shared component library: Cards, Badges, Stat blocks, Tables, Modals
- Smooth transitions, micro-animations (framer-motion)
- Mobile-first responsive overhaul

### 2. Learner Panel Redesign
- [ ] Dashboard — course progress hero, streak calendar, quick actions
- [ ] Courses — grid with progress bars, filters, continue-watching row
- [ ] AI Coach (Nova) — chat bubbles, streaming response, topic chips
- [ ] EMI status page — visual installment timeline, pay button
- [ ] Focus timer — Pomodoro with session stats
- [ ] Leaderboard — animated rank cards

### 3. Partner Panel Redesign
- [ ] Dashboard — earnings graph (recharts), referral funnel, tier progress bar
- [ ] Referrals — paginated table with conversion status
- [ ] Link Generator — QR code, copy link, UTM builder
- [ ] EMI commissions — installment grid (same as manager)
- [ ] Earnings history — timeline with filter

### 4. Sales Panel Redesign
- [ ] Dashboard — daily target vs achieved progress ring
- [ ] Leads — Kanban board (drag-drop stages) or pipeline funnel (current)
- [ ] Orders — searchable table, EMI breakdown
- [ ] EMI commissions — installment grid
- [ ] Performance chart — monthly trend line

### 5. Manager Panel Redesign
- [ ] Dashboard — partner overview grid, top performers
- [ ] Partners — card grid (done), WhatsApp/Call (done), detail page
- [ ] EMI commissions — (done, may polish)
- [ ] Leaderboard — animated rank list

### 6. Admin Panel Redesign
- [ ] Dashboard — platform-wide KPI cards + charts
- [ ] Users — advanced filter, bulk actions
- [ ] Packages — visual card editor
- [ ] EMI — timeline view per partner
- [ ] Sales team — performance modal (done)
- [ ] Partners — card grid + manager performance (done)
- [ ] Reports — downloadable CSV/PDF

### 7. AI Integration (Priority Features)
- [ ] **AI Lead Scorer** — score each sales lead 0-100 based on: tier interest, engagement, follow-up history. Show in lead cards.
- [ ] **AI Course Recommender** — suggest next course/module to learner based on progress + goal
- [ ] **AI Sales Assistant** — suggest follow-up message template for lead (one-click WhatsApp template)
- [ ] **Nova AI Coach** — streaming chat, memory per student, context-aware (current course, progress)
- [ ] **AI Commission Predictor** — show partner projected monthly earnings based on current referral rate
- [ ] **AI Churn Risk** — flag learners inactive >7 days in admin dashboard

### 8. Missing Features to Build
- [ ] **Referral tree visualizer** — multi-level network graph (L1→L2→L3)
- [ ] **Goal system** — admin sets partner goals, manager tracks, partner sees progress
- [ ] **Automated notifications** — EMI due reminder (WhatsApp/SMS), follow-up reminder for sales
- [ ] **Certificate generation** — on course completion (PDF with student name)
- [ ] **Mentor dashboard** — class schedule, student list, rating
- [ ] **Public landing page** — course catalog, partner signup, testimonials
- [ ] **Analytics dashboard** — revenue trend, conversion funnel, partner performance ranking

---

## Technical Debt / Improvements
- [ ] Replace `any` types with proper TypeScript interfaces
- [ ] Add rate limiting to API routes
- [ ] Centralize error handling middleware
- [ ] Add Redis for session/cache (hot data)
- [ ] Set up automated DB backups
- [ ] CI/CD pipeline (GitHub Actions → auto deploy)

---

## Immediate Next Session Priorities (Tomorrow)

1. **Full learner panel redesign** — most user-facing, highest impact
2. **Partner dashboard redesign** — earnings graph, tier progress
3. **AI integration kick-off** — Nova streaming + lead scorer
4. **Public landing page** — peptly.in home page

---

*Built with Next.js 14, Node.js/Express, MongoDB, PhonePe, Socket.IO*
