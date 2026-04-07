import { Router } from 'express';
import User from '../models/User';
import PackagePurchase from '../models/PackagePurchase';
import Commission from '../models/Commission';
import Lead from '../models/Lead';
import Enrollment from '../models/Enrollment';
import LiveClass from '../models/LiveClass';
import { protect, authorize } from '../middleware/auth';

const router = Router();
router.use(protect, authorize('superadmin', 'admin'));

// GET /api/analytics/dashboard — main admin dashboard
router.get('/dashboard', async (_req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
    const lastMonth = new Date(thisMonth); lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      totalUsers, newUsersToday, newUsersMonth,
      totalRevenue, revenueThisMonth, revenueLastMonth,
      totalLeads, hotLeads, leadsThisMonth,
      totalAffiliates, paidAffiliates,
      activePackages, commissionsPaid,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', createdAt: { $gte: today } }),
      User.countDocuments({ role: 'student', createdAt: { $gte: thisMonth } }),
      PackagePurchase.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      PackagePurchase.aggregate([{ $match: { status: 'paid', createdAt: { $gte: thisMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      PackagePurchase.aggregate([{ $match: { status: 'paid', createdAt: { $gte: lastMonth, $lt: thisMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Lead.countDocuments({}),
      Lead.countDocuments({ aiScoreLabel: 'hot' }),
      Lead.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({ isAffiliate: true }),
      User.countDocuments({ isAffiliate: true, packageTier: { $ne: 'free' } }),
      User.aggregate([{ $match: { packageTier: { $ne: 'free' } } }, { $group: { _id: '$packageTier', count: { $sum: 1 } } }]),
      Commission.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
    ]);

    const thisMonthRev = revenueThisMonth[0]?.total || 0;
    const lastMonthRev = revenueLastMonth[0]?.total || 1;
    const revenueGrowth = (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1);

    res.json({
      success: true,
      users: { total: totalUsers, today: newUsersToday, thisMonth: newUsersMonth },
      revenue: { total: totalRevenue[0]?.total || 0, thisMonth: thisMonthRev, lastMonth: lastMonthRev, growth: revenueGrowth },
      leads: { total: totalLeads, hot: hotLeads, thisMonth: leadsThisMonth },
      affiliates: { total: totalAffiliates, paid: paidAffiliates },
      packages: activePackages,
      commissionsPaid: commissionsPaid[0]?.total || 0,
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/analytics/revenue — revenue over time
router.get('/revenue', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const from = new Date(); from.setDate(from.getDate() - days);

    const revenue = await PackagePurchase.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: from } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const byTier = await PackagePurchase.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: from } } },
      { $group: { _id: '$packageTier', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({ success: true, revenue, byTier });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/analytics/unit-economics — LTV, CAC, payback
router.get('/unit-economics', async (_req, res) => {
  try {
    const [totalPurchases, totalUsers, commissions] = await Promise.all([
      PackagePurchase.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      User.countDocuments({ packageTier: { $ne: 'free' } }),
      Commission.aggregate([{ $match: {} }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
    ]);

    const totalRevenue = totalPurchases[0]?.total || 0;
    const purchaseCount = totalPurchases[0]?.count || 1;
    const avgOrderValue = Math.round(totalRevenue / purchaseCount);
    const commissionPaid = commissions[0]?.total || 0;

    // Estimated CAC (platform runs ads — assume 20% of revenue)
    const estimatedAdSpend = totalRevenue * 0.20;
    const cac = totalUsers > 0 ? Math.round(estimatedAdSpend / totalUsers) : 0;
    const ltv = avgOrderValue * 1.5; // base + avg upsell
    const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(1) : 'N/A';
    const paybackMonths = cac > 0 && avgOrderValue > 0 ? (cac / (avgOrderValue / 12)).toFixed(1) : 'N/A';

    res.json({
      success: true,
      avgOrderValue,
      estimatedCAC: cac,
      estimatedLTV: Math.round(ltv),
      ltvCacRatio,
      paybackMonths,
      commissionPaid: Math.round(commissionPaid),
      totalRevenue,
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/analytics/users — user growth
router.get('/users', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : 30;
    const from = new Date(); from.setDate(from.getDate() - days);

    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const byTier = await User.aggregate([
      { $group: { _id: '$packageTier', count: { $sum: 1 } } }
    ]);

    const byRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, growth, byTier, byRole });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
