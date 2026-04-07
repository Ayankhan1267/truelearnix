import { Router } from 'express';
import { protect as authenticate, authorize } from '../middleware/auth';
import Coupon from '../models/Coupon';

const router = Router();

// Admin: list all coupons
router.get('/', authenticate, authorize('admin', 'superadmin', 'manager'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.json({ success: true, data: coupons });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public: validate coupon
router.post('/validate', authenticate, async (req, res) => {
  try {
    const { code, orderValue, tier } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (new Date() > coupon.expiresAt) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (orderValue < coupon.minOrderValue) return res.status(400).json({ success: false, message: `Minimum order value ₹${coupon.minOrderValue} required` });
    if (coupon.applicableTiers.length > 0 && tier && !coupon.applicableTiers.includes(tier)) {
      return res.status(400).json({ success: false, message: 'Coupon not applicable for this package' });
    }
    const discount = coupon.type === 'percent' ? Math.round(orderValue * coupon.value / 100) : coupon.value;
    res.json({ success: true, data: { coupon, discount, finalAmount: Math.max(0, orderValue - discount) } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin: create coupon
router.post('/', authenticate, authorize('admin', 'superadmin', 'manager'), async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: (req as any).user._id });
    res.status(201).json({ success: true, data: coupon });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Admin: update coupon
router.patch('/:id', authenticate, authorize('admin', 'superadmin', 'manager'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin: delete coupon
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
