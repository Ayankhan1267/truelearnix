import { Router } from 'express';
import User, { COMMISSION_RATES, PACKAGE_PRICES, PackageTier } from '../models/User';
import Commission from '../models/Commission';
import Transaction from '../models/Transaction';
import Lead from '../models/Lead';
import { protect } from '../middleware/auth';

const router = Router();

// Guard: must be affiliate
const affiliateGuard = async (req: any, res: any, next: any) => {
  if (!req.user.isAffiliate) {
    return res.status(403).json({ success: false, message: 'Partner panel locked. Purchase a package to unlock.', locked: true });
  }
  next();
};

// ── GET /api/partner/dashboard ────────────────────────────────────────────────
router.get('/dashboard', protect, affiliateGuard, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name avatar affiliateCode wallet totalEarnings totalWithdrawn packageTier commissionRate isAffiliate createdAt upline1 kyc managerName managerPhone')
      .populate('upline1', 'name email packageTier');

    const [l1, l2, l3] = await Promise.all([
      User.countDocuments({ upline1: req.user._id }),
      User.countDocuments({ upline2: req.user._id }),
      User.countDocuments({ upline3: req.user._id }),
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);

    const [monthlyEarnings, weeklyEarnings, totalCommissions, pendingCommissions] = await Promise.all([
      Commission.aggregate([{ $match: { earner: req.user._id, createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
      Commission.aggregate([{ $match: { earner: req.user._id, createdAt: { $gte: weekStart } } }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
      Commission.countDocuments({ earner: req.user._id }),
      Commission.countDocuments({ earner: req.user._id, status: 'pending' }),
    ]);

    // Rank
    const rank = await User.countDocuments({ isAffiliate: true, totalEarnings: { $gt: user?.totalEarnings || 0 } });

    // Last 6 months trend
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const trend = await Commission.aggregate([
      { $match: { earner: req.user._id, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      user: { name: user?.name, avatar: user?.avatar, affiliateCode: user?.affiliateCode, packageTier: user?.packageTier, commissionRate: user?.commissionRate, createdAt: user?.createdAt, kyc: user?.kyc },
      referralLink: `${process.env.WEB_URL || 'https://peptly.in'}?ref=${user?.affiliateCode}`,
      sponsor: user?.upline1,
      manager: { name: user?.managerName, phone: user?.managerPhone },
      stats: {
        wallet: user?.wallet || 0, totalEarnings: user?.totalEarnings || 0,
        totalWithdrawn: user?.totalWithdrawn || 0,
        monthly: monthlyEarnings[0]?.total || 0,
        weekly: weeklyEarnings[0]?.total || 0,
        rank: rank + 1, totalCommissions, pendingCommissions,
        referrals: { l1, l2, l3, total: l1 + l2 + l3 },
      },
      trend,
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/partner/earnings ─────────────────────────────────────────────────
router.get('/earnings', protect, affiliateGuard, async (req: any, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string) || 30;
    const since = new Date(); since.setDate(since.getDate() - days);

    const [byLevel, byTier, recent, monthly] = await Promise.all([
      Commission.aggregate([
        { $match: { earner: req.user._id } },
        { $group: { _id: '$level', total: { $sum: '$commissionAmount' }, count: { $sum: 1 }, avgSale: { $avg: '$saleAmount' } } },
        { $sort: { _id: 1 } }
      ]),
      Commission.aggregate([
        { $match: { earner: req.user._id } },
        { $group: { _id: '$buyerPackageTier', total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Commission.find({ earner: req.user._id })
        .populate('buyer', 'name packageTier')
        .sort('-createdAt').limit(20)
        .select('commissionAmount saleAmount level buyerPackageTier createdAt status'),
      Commission.aggregate([
        { $match: { earner: req.user._id } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]),
    ]);

    // Best selling tier
    const bestTier = byTier[0]?._id || 'N/A';
    // Avg per referral
    const user = await User.findById(req.user._id).select('totalEarnings');
    const l1Count = await User.countDocuments({ upline1: req.user._id });
    const avgPerReferral = l1Count > 0 ? Math.round((user?.totalEarnings || 0) / l1Count) : 0;

    res.json({ success: true, byLevel, byTier, recent, monthly: monthly.reverse(), bestTier, avgPerReferral });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/partner/leaderboard ──────────────────────────────────────────────
router.get('/leaderboard', protect, affiliateGuard, async (req: any, res) => {
  try {
    const top = await User.find({ isAffiliate: true, totalEarnings: { $gt: 0 } })
      .select('name avatar packageTier totalEarnings commissionRate createdAt')
      .sort('-totalEarnings').limit(50);

    const myRank = await User.countDocuments({ isAffiliate: true, totalEarnings: { $gt: req.user.totalEarnings || 0 } });
    const myData = await User.findById(req.user._id).select('name avatar packageTier totalEarnings commissionRate');

    res.json({ success: true, leaderboard: top, myRank: myRank + 1, me: myData });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/partner/m-type ───────────────────────────────────────────────────
router.get('/m-type', protect, affiliateGuard, async (req: any, res) => {
  try {
    const [l1, l2, l3] = await Promise.all([
      User.find({ upline1: req.user._id }).select('name avatar packageTier totalEarnings isAffiliate createdAt').sort('-totalEarnings').limit(20),
      User.find({ upline2: req.user._id }).select('name avatar packageTier totalEarnings isAffiliate createdAt upline1').sort('-createdAt').limit(20),
      User.find({ upline3: req.user._id }).select('name avatar packageTier isAffiliate createdAt').sort('-createdAt').limit(20),
    ]);

    const totalTeamEarnings = await Commission.aggregate([
      { $match: { earner: req.user._id } },
      { $group: { _id: '$level', total: { $sum: '$commissionAmount' } } }
    ]);

    const user = await User.findById(req.user._id).select('name avatar packageTier totalEarnings affiliateCode');

    res.json({ success: true, me: user, l1, l2, l3, teamEarnings: totalTeamEarnings });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/partner/referrals ────────────────────────────────────────────────
router.get('/referrals', protect, affiliateGuard, async (req: any, res) => {
  try {
    const { level = '1', page = '1' } = req.query;
    const lv = parseInt(level as string) || 1;
    const pg = parseInt(page as string) || 1;
    const limit = 20;

    const filter = lv === 1 ? { upline1: req.user._id } : lv === 2 ? { upline2: req.user._id } : { upline3: req.user._id };

    const [refs, total] = await Promise.all([
      User.find(filter).select('name email phone avatar packageTier isAffiliate totalEarnings wallet createdAt lastLogin').sort('-createdAt').skip((pg - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);

    // For each L1 referral, get their commission contribution to me (single batch query)
    let refsWithContrib: any[] = refs.map((r: any) => r.toObject());
    if (lv === 1 && refs.length > 0) {
      const buyerIds = refs.map((r: any) => r._id);
      const contribMap = await Commission.aggregate([
        { $match: { earner: req.user._id, buyer: { $in: buyerIds } } },
        { $group: { _id: '$buyer', total: { $sum: '$commissionAmount' } } }
      ]);
      const contribById: Record<string, number> = {};
      contribMap.forEach((c: any) => { contribById[c._id.toString()] = c.total; });
      refsWithContrib = refsWithContrib.map((r: any) => ({ ...r, myEarningFromThem: contribById[r._id.toString()] || 0 }));
    }

    res.json({ success: true, referrals: refsWithContrib, total, pages: Math.ceil(total / limit), page: pg });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/partner/crm ──────────────────────────────────────────────────────
router.get('/crm', protect, affiliateGuard, async (req: any, res) => {
  try {
    const { status, page = '1' } = req.query;
    const pg = parseInt(page as string) || 1;
    const filter: any = { assignedTo: req.user._id };
    if (status) filter.status = status;

    const [leads, total, stats] = await Promise.all([
      Lead.find(filter).sort('-createdAt').skip((pg - 1) * 20).limit(20),
      Lead.countDocuments(filter),
      Lead.aggregate([
        { $match: { assignedTo: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
    ]);

    res.json({ success: true, leads, total, pages: Math.ceil(total / 20), stats });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/partner/crm/lead — capture lead via affiliate link
router.post('/crm/lead', async (req: any, res) => {
  try {
    const { name, email, phone, source, affiliateCode } = req.body;
    if (!email && !phone) return res.status(400).json({ success: false, message: 'Email or phone required' });

    const affiliate = affiliateCode ? await User.findOne({ affiliateCode }).select('_id') : null;

    const lead = await Lead.create({
      name: name || 'Unknown', email, phone, source: source || 'affiliate_link',
      status: 'new', assignedTo: affiliate?._id,
    });
    res.json({ success: true, lead });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/partner/training ─────────────────────────────────────────────────
router.get('/training', protect, affiliateGuard, async (req: any, res) => {
  try {
    const Popup = (await import('../models/Popup')).default;
    const webinars = await Popup.find({ type: 'event', isActive: true }).sort('-priority -createdAt').limit(10);

    const training = [
      { day: 1, title: 'Welcome to TruLearnix Partner Program', desc: 'Overview of the platform, your dashboard, and how the MLM system works.', duration: '45 min', type: 'video', completed: false },
      { day: 2, title: 'Understanding Commission Structure', desc: 'Deep dive into L1/L2/L3 commissions, tier rates, and maximizing earnings.', duration: '60 min', type: 'video', completed: false },
      { day: 3, title: 'Building Your Referral Network', desc: 'Strategies for onboarding new partners and growing your team.', duration: '50 min', type: 'video', completed: false },
      { day: 4, title: 'Social Media Marketing for Partners', desc: 'How to promote TruLearnix on Instagram, WhatsApp, and YouTube.', duration: '55 min', type: 'video', completed: false },
      { day: 5, title: 'Lead Generation Techniques', desc: 'Using the Link Generator, CRM, and landing pages to capture quality leads.', duration: '40 min', type: 'video', completed: false },
      { day: 6, title: 'Handling Objections & Closing Sales', desc: 'Sales scripts, common objections, and how to convert leads to partners.', duration: '65 min', type: 'video', completed: false },
      { day: 7, title: 'WhatsApp & Email Follow-up Templates', desc: 'Ready-to-use templates for nurturing leads and re-engaging prospects.', duration: '35 min', type: 'resource', completed: false },
      { day: 8, title: 'Compliance & Ethical Marketing', desc: 'Dos and don\'ts, legal requirements, and maintaining your reputation.', duration: '30 min', type: 'video', completed: false },
      { day: 9, title: 'KYC & Payout Process', desc: 'How to complete your KYC, request withdrawals, and track payments.', duration: '25 min', type: 'video', completed: false },
      { day: 10, title: 'Scaling to Elite & Supreme', desc: 'Advanced strategies for reaching top-tier commissions and leaderboard rankings.', duration: '70 min', type: 'video', completed: false },
    ];

    res.json({ success: true, training, webinars });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET/POST /api/partner/kyc ─────────────────────────────────────────────────
router.get('/kyc', protect, affiliateGuard, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select('kyc name email phone');
    res.json({ success: true, kyc: user?.kyc || { status: 'pending' }, user: { name: user?.name, email: user?.email, phone: user?.phone } });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/kyc', protect, affiliateGuard, async (req: any, res) => {
  try {
    const { pan, panName, aadhar, aadharName, bankAccount, bankIfsc, bankName, bankHolderName } = req.body;
    if (!pan || !aadhar || !bankAccount || !bankIfsc) {
      return res.status(400).json({ success: false, message: 'PAN, Aadhar and bank details are required' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      kyc: {
        pan: pan.toUpperCase(), panName, aadhar, aadharName,
        bankAccount, bankIfsc: bankIfsc.toUpperCase(), bankName, bankHolderName,
        status: 'submitted', submittedAt: new Date(),
      }
    });

    res.json({ success: true, message: 'KYC submitted successfully! Verification takes 1-2 business days.' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/partner/link ─────────────────────────────────────────────────────
router.get('/link', protect, affiliateGuard, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select('affiliateCode');
    const baseUrl = process.env.WEB_URL || 'https://peptly.in';
    const code = user?.affiliateCode || '';

    const links = {
      home: `${baseUrl}?ref=${code}`,
      courses: `${baseUrl}/courses?ref=${code}`,
      packages: `${baseUrl}/packages?ref=${code}`,
      register: `${baseUrl}/register?ref=${code}`,
      checkout_pro: `${baseUrl}/packages/pro?ref=${code}`,
      checkout_elite: `${baseUrl}/packages/elite?ref=${code}`,
    };

    res.json({ success: true, affiliateCode: code, links });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/partner/qualification ───────────────────────────────────────────
router.get('/qualification', protect, affiliateGuard, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select('totalEarnings packageTier');
    const l1Count = await User.countDocuments({ upline1: req.user._id });
    const l1Paid = await User.countDocuments({ upline1: req.user._id, packageTier: { $ne: 'free' } });

    const milestones = [
      { id: 'first_sale', title: 'First Sale', desc: 'Make your first referral sale', reward: '₹500 Bonus', icon: '🎯', target: 1, current: l1Paid, unit: 'paid referrals', achieved: l1Paid >= 1 },
      { id: 'five_sales', title: 'Power Starter', desc: '5 paid referrals in your L1', reward: 'Power Starter Badge', icon: '⚡', target: 5, current: l1Paid, unit: 'paid referrals', achieved: l1Paid >= 5 },
      { id: 'ten_sales', title: 'Growth Champion', desc: '10 paid referrals', reward: 'Feature on Leaderboard', icon: '🏆', target: 10, current: l1Paid, unit: 'paid referrals', achieved: l1Paid >= 10 },
      { id: 'earn_10k', title: '₹10,000 Earner', desc: 'Total earnings cross ₹10,000', reward: 'Elite Badge + Priority Support', icon: '💰', target: 10000, current: user?.totalEarnings || 0, unit: '₹ earned', achieved: (user?.totalEarnings || 0) >= 10000 },
      { id: 'earn_50k', title: '₹50,000 Club', desc: 'Total earnings cross ₹50,000', reward: '₹2,000 Bonus + Certificate', icon: '🥇', target: 50000, current: user?.totalEarnings || 0, unit: '₹ earned', achieved: (user?.totalEarnings || 0) >= 50000 },
      { id: 'earn_1l', title: 'Lakhpati Partner', desc: 'Total earnings cross ₹1,00,000', reward: 'Supreme Upgrade + Hall of Fame', icon: '👑', target: 100000, current: user?.totalEarnings || 0, unit: '₹ earned', achieved: (user?.totalEarnings || 0) >= 100000 },
      { id: 'team_25', title: 'Team Builder', desc: 'Build a team of 25+ partners', reward: 'Team Builder Trophy', icon: '👥', target: 25, current: l1Count, unit: 'L1 partners', achieved: l1Count >= 25 },
      { id: 'pro_tier', title: 'Pro Partner', desc: 'Upgrade to Pro tier', reward: 'Pro Exclusive Benefits', icon: '🚀', target: 1, current: ['pro','elite','supreme'].includes(user?.packageTier || '') ? 1 : 0, unit: 'tier upgrade', achieved: ['pro','elite','supreme'].includes(user?.packageTier || '') },
    ];

    res.json({ success: true, milestones, summary: { l1Count, l1Paid, totalEarnings: user?.totalEarnings || 0, tier: user?.packageTier } });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/partner/achievements ────────────────────────────────────────────
router.get('/achievements', protect, affiliateGuard, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select('totalEarnings packageTier name avatar createdAt');
    const l1Count = await User.countDocuments({ upline1: req.user._id });
    const l1Paid = await User.countDocuments({ upline1: req.user._id, packageTier: { $ne: 'free' } });

    const achievements = [
      { id: 'welcome', title: 'Partner Activated', desc: 'Successfully joined the Partner Program', icon: '🎉', color: '#6366f1', earned: true, earnedAt: user?.createdAt },
      { id: 'first_referral', title: 'First Referral', desc: 'Referred your first person to the platform', icon: '🤝', color: '#22c55e', earned: l1Count >= 1, earnedAt: null },
      { id: 'first_sale', title: 'First Commission', desc: 'Earned your first commission', icon: '💸', color: '#f59e0b', earned: (user?.totalEarnings || 0) > 0, earnedAt: null },
      { id: 'power_5', title: 'Power of 5', desc: '5 paid referrals in your team', icon: '⚡', color: '#8b5cf6', earned: l1Paid >= 5, earnedAt: null },
      { id: 'earn_10k', title: '₹10K Milestone', desc: 'Crossed ₹10,000 in total earnings', icon: '💰', color: '#ec4899', earned: (user?.totalEarnings || 0) >= 10000, earnedAt: null },
      { id: 'team_10', title: 'Team Leader', desc: 'Built a team of 10+ L1 partners', icon: '👥', color: '#06b6d4', earned: l1Count >= 10, earnedAt: null },
      { id: 'pro_badge', title: 'Pro Partner', desc: 'Upgraded to Pro or higher tier', icon: '🚀', color: '#7c3aed', earned: ['pro','elite','supreme'].includes(user?.packageTier || ''), earnedAt: null },
      { id: 'earn_50k', title: '₹50K Club', desc: 'Crossed ₹50,000 in total earnings', icon: '🏆', color: '#f97316', earned: (user?.totalEarnings || 0) >= 50000, earnedAt: null },
      { id: 'lakhpati', title: 'Lakhpati Partner', desc: 'Crossed ₹1,00,000 in total earnings', icon: '👑', color: '#fbbf24', earned: (user?.totalEarnings || 0) >= 100000, earnedAt: null },
    ];

    res.json({ success: true, achievements, user: { name: user?.name, avatar: user?.avatar, packageTier: user?.packageTier, totalEarnings: user?.totalEarnings } });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
