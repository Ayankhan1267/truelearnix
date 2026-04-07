import { Router } from 'express';
import { getDashboardStats, getAllUsers, toggleUserStatus, getPendingCourses, approveCourse, rejectCourse, getTickets, updateTicket } from '../controllers/adminController';
import User from '../models/User';
import Package from '../models/Package';
import PackagePurchase from '../models/PackagePurchase';
import Commission from '../models/Commission';
import Withdrawal from '../models/Withdrawal';
import { protect, authorize } from '../middleware/auth';

const router = Router();
router.use(protect, authorize('superadmin', 'admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken -otp');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.patch('/users/:id/toggle', toggleUserStatus);
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.patch('/users/:id/package', async (req: any, res) => {
  try {
    const { packageTier } = req.body;
    const rates: Record<string, number> = { free: 0, starter: 10, pro: 15, elite: 22, supreme: 30 };
    const updates: any = { packageTier, commissionRate: rates[packageTier] || 0, isAffiliate: packageTier !== 'free', packagePurchasedAt: new Date() };
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Courses
router.get('/courses/pending', getPendingCourses);
router.patch('/courses/:id/approve', approveCourse);
router.patch('/courses/:id/reject', rejectCourse);

// Packages management
router.get('/packages', async (_req, res) => {
  try { res.json({ success: true, packages: await Package.find().sort('displayOrder') }); } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.post('/packages', async (req, res) => {
  try { res.status(201).json({ success: true, package: await Package.create(req.body) }); } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.put('/packages/:id', async (req, res) => {
  try { res.json({ success: true, package: await Package.findByIdAndUpdate(req.params.id, req.body, { new: true }) }); } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Package purchases
router.get('/purchases', async (req, res) => {
  try {
    const { status, tier, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (tier) filter.packageTier = tier;
    const skip = (Number(page) - 1) * Number(limit);
    const [purchases, total] = await Promise.all([
      PackagePurchase.find(filter).populate('user', 'name email phone').sort('-createdAt').skip(skip).limit(Number(limit)),
      PackagePurchase.countDocuments(filter),
    ]);
    res.json({ success: true, purchases, total });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Commissions
router.get('/commissions', async (req, res) => {
  try {
    const { level, status, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    if (level) filter.level = Number(level);
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [commissions, total] = await Promise.all([
      Commission.find(filter).populate('earner', 'name email').populate('buyer', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
      Commission.countDocuments(filter),
    ]);
    res.json({ success: true, commissions, total });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Withdrawals
router.get('/withdrawals', async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find(req.query.status ? { status: req.query.status } : {}).populate('user', 'name email phone').sort('-createdAt');
    res.json({ success: true, withdrawals });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});
router.patch('/withdrawals/:id', async (req: any, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const withdrawal = await Withdrawal.findByIdAndUpdate(req.params.id, { status, rejectionReason, processedBy: req.user._id, processedAt: new Date() }, { new: true });
    if (status === 'rejected' && withdrawal) await User.findByIdAndUpdate(withdrawal.user, { $inc: { wallet: withdrawal.amount, totalWithdrawn: -withdrawal.amount } });
    res.json({ success: true, withdrawal });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Support tickets
router.get('/tickets', getTickets);
router.patch('/tickets/:id', updateTicket);

// Broadcast notification
router.post('/notify', async (req, res) => {
  try {
    const { title, message, type, roles } = req.body;
    const Notification = (await import('../models/Notification')).default;
    const users = await User.find(roles?.length ? { role: { $in: roles } } : {}).select('_id');
    const notifications = users.map((u: any) => ({ user: u._id, title, message, type: type || 'info', channel: 'inapp' }));
    await Notification.insertMany(notifications);
    res.json({ success: true, sent: notifications.length });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
