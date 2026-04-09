import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { protect } from '../middleware/auth';
import User, { COMMISSION_RATES } from '../models/User';
import Package from '../models/Package';
import PackagePurchase from '../models/PackagePurchase';
import Payment from '../models/Payment';
import Enrollment from '../models/Enrollment';
import Coupon from '../models/Coupon';
import Transaction from '../models/Transaction';
import Commission from '../models/Commission';
import EmiInstallment from '../models/EmiInstallment';

const router = Router();

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// ── helpers ───────────────────────────────────────────────────────────────────
function verifySignature(orderId: string, paymentId: string, signature: string) {
  const body = orderId + '|' + paymentId;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(body).digest('hex');
  return expected === signature;
}

async function creditMLM(purchasedUserId: string, saleAmount: number, purchaseId: string, tier: string) {
  const buyer = await User.findById(purchasedUserId).populate('referredBy');
  if (!buyer) return;

  const uplines = [buyer.upline1, buyer.upline2, buyer.upline3].filter(Boolean);

  // Resolve uplines from referral chain if not set
  const level1Id = buyer.upline1 || (buyer.referredBy as any)?._id || buyer.referredBy;
  if (!level1Id) return;

  const level1 = await User.findById(level1Id);
  if (!level1 || !level1.isAffiliate) return;

  const levels = [
    { user: level1, rate: level1.commissionRate || 10, level: 1 },
  ];

  if (level1.upline1) {
    const level2 = await User.findById(level1.upline1);
    if (level2?.isAffiliate) levels.push({ user: level2, rate: 5, level: 2 });

    if (level2?.upline1) {
      const level3 = await User.findById(level2.upline1);
      if (level3?.isAffiliate) levels.push({ user: level3, rate: 2, level: 3 });
    }
  }

  for (const { user: earner, rate, level } of levels) {
    const commAmt = Math.round(saleAmount * rate / 100);
    await Commission.create({
      earner: earner._id, earnerTier: earner.packageTier,
      earnerCommissionRate: earner.commissionRate, buyer: purchasedUserId,
      buyerPackageTier: tier, level, levelRate: rate,
      saleAmount, commissionAmount: commAmt, packagePurchaseId: purchaseId, status: 'approved',
    });
    await User.findByIdAndUpdate(earner._id, {
      $inc: { wallet: commAmt, totalEarnings: commAmt },
    });
    await Transaction.create({
      user: earner._id, type: 'credit', category: 'affiliate_commission',
      amount: commAmt, description: `L${level} commission — ${tier} package purchased`,
      referenceId: purchaseId, status: 'completed',
    });
    earner.notifications.push({ type: 'commission', message: `🎉 ₹${commAmt} earned! L${level} commission from a ${tier} purchase.`, read: false, createdAt: new Date() });
    await earner.save();
  }

  // Set upline chain for future
  if (!buyer.upline1) {
    buyer.upline1 = level1Id;
    if (levels[1]) buyer.upline2 = levels[1].user._id;
    if (levels[2]) buyer.upline3 = levels[2].user._id;
    await buyer.save();
  }
}

// ── GET /api/checkout/item ─────────────────────────────────────────────────
router.get('/item', protect, async (req: any, res) => {
  try {
    const { type, tier, courseId } = req.query;

    if (type === 'package') {
      const pkg = await Package.findOne({ tier, isActive: true });
      if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
      const gst = Math.round(pkg.price * 0.18);
      return res.json({
        success: true, item: {
          type: 'package', id: pkg._id, tier: pkg.tier, name: pkg.name,
          price: pkg.price, gst, total: pkg.price + gst,
          features: pkg.features, emiAvailable: pkg.emiAvailable,
          emiMonths: pkg.emiMonths || 3,
          emiMonthlyAmount: pkg.emiMonthlyAmount || Math.ceil(pkg.price / 3),
          badge: pkg.badge,
        }
      });
    }

    if (type === 'course') {
      const Course = (await import('../models/Course')).default;
      const course = await Course.findById(courseId).select('title thumbnail price discountPrice instructor description');
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
      const enrolled = await Enrollment.findOne({ student: req.user._id, course: courseId });
      return res.json({
        success: true, item: {
          type: 'course', id: course._id, name: course.title,
          thumbnail: (course as any).thumbnail, instructor: (course as any).instructor,
          price: (course as any).discountPrice || (course as any).price,
          originalPrice: (course as any).price, gst: 0,
          total: (course as any).discountPrice || (course as any).price,
          emiAvailable: false, alreadyEnrolled: !!enrolled,
        }
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid type' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/checkout/validate-code ──────────────────────────────────────
router.post('/validate-code', protect, async (req: any, res) => {
  try {
    const { code, codeType, type, tier, courseId } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

    if (codeType === 'promo') {
      // Partner/referral code
      const referrer = await User.findOne({ affiliateCode: code.toUpperCase().trim() });
      if (!referrer) return res.status(404).json({ success: false, message: 'Invalid partner code' });
      if (referrer._id.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot use your own code' });
      return res.json({ success: true, valid: true, message: `Partner code applied! ${referrer.name.split(' ')[0]} will earn commission.`, discount: 0, referrerId: referrer._id });
    }

    if (codeType === 'coupon') {
      const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
      if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
      if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon has reached max usage' });
      if (new Date() > coupon.expiresAt) return res.status(400).json({ success: false, message: 'Coupon has expired' });

      // Check tier applicability for packages
      if (type === 'package' && coupon.applicableTiers.length > 0 && !coupon.applicableTiers.includes(tier)) {
        return res.status(400).json({ success: false, message: `This coupon is not valid for ${tier} package` });
      }

      // Get base price
      let basePrice = 0;
      if (type === 'package') {
        const pkg = await Package.findOne({ tier });
        basePrice = pkg?.price || 0;
      } else {
        const Course = (await import('../models/Course')).default;
        const course = await Course.findById(courseId);
        basePrice = (course as any)?.discountPrice || (course as any)?.price || 0;
      }

      if (basePrice < coupon.minOrderValue) {
        return res.status(400).json({ success: false, message: `Minimum order value ₹${coupon.minOrderValue} required` });
      }

      const discount = coupon.type === 'percent'
        ? Math.round(basePrice * coupon.value / 100)
        : Math.min(coupon.value, basePrice);

      return res.json({ success: true, valid: true, discount, couponType: coupon.type, couponValue: coupon.value, message: `Coupon applied! ₹${discount} off` });
    }

    return res.status(400).json({ success: false, message: 'Invalid code type' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/checkout/create-order ───────────────────────────────────────
router.post('/create-order', protect, async (req: any, res) => {
  try {
    const { type, tier, courseId, promoCode, couponCode, isEmi, name, email } = req.body;

    let basePrice = 0, gst = 0, discount = 0, itemName = '', packageId: any = null;

    if (type === 'package') {
      const pkg = await Package.findOne({ tier, isActive: true });
      if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

      const TIER_ORDER: Record<string, number> = { free: 0, starter: 1, pro: 2, elite: 3, supreme: 4 };
      if (TIER_ORDER[req.user.packageTier] >= TIER_ORDER[tier]) {
        return res.status(400).json({ success: false, message: 'You already have this tier or higher' });
      }

      basePrice = pkg.price;
      packageId = pkg._id;
      itemName = `${pkg.name} Package`;
    } else if (type === 'course') {
      const Course = (await import('../models/Course')).default;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

      const enrolled = await Enrollment.findOne({ student: req.user._id, course: courseId });
      if (enrolled) return res.status(400).json({ success: false, message: 'Already enrolled' });

      basePrice = (course as any).discountPrice || (course as any).price;
      itemName = (course as any).title;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    // Apply coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), isActive: true });
      if (coupon && coupon.usedCount < coupon.maxUses && new Date() < coupon.expiresAt) {
        discount = coupon.type === 'percent'
          ? Math.round(basePrice * coupon.value / 100)
          : Math.min(coupon.value, basePrice);
      }
    }

    const afterDiscount = basePrice - discount;
    gst = type === 'package' ? Math.round(afterDiscount * 0.18) : 0;
    let totalAmount = afterDiscount + gst;

    // EMI: first installment only
    let isEmiOrder = false;
    let emiInstallmentAmount = totalAmount;
    let emiMonths = 3;
    if (type === 'package' && isEmi) {
      emiMonths = 3;
      emiInstallmentAmount = Math.ceil(totalAmount / emiMonths);
      totalAmount = emiInstallmentAmount; // pay first installment now
      isEmiOrder = true;
    }

    const order = await rzp.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { type, tier: tier || '', courseId: courseId || '', userId: req.user._id.toString() },
    });

    // Create purchase record
    if (type === 'package') {
      const purchase = await PackagePurchase.create({
        user: req.user._id, package: packageId, packageTier: tier,
        amount: afterDiscount, gstAmount: gst, totalAmount: afterDiscount + gst,
        razorpayOrderId: order.id, status: 'created',
        affiliateCode: promoCode || '', isEmi: isEmiOrder,
        emiMonth: isEmiOrder ? 1 : undefined, emiTotal: isEmiOrder ? emiMonths : undefined,
      });
      return res.json({
        success: true, orderId: order.id, amount: Math.round(totalAmount * 100),
        currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID, purchaseId: purchase._id,
        itemName, isEmi: isEmiOrder, emiInstallmentAmount, emiMonths,
      });
    } else {
      // Course
      const payment = await Payment.create({
        user: req.user._id, course: courseId, amount: totalAmount,
        razorpayOrderId: order.id, status: 'created',
        affiliateCode: promoCode || '',
      });
      if (promoCode) {
        const referrer = await User.findOne({ affiliateCode: promoCode.toUpperCase().trim() });
        if (referrer) (payment as any).affiliateUser = referrer._id;
        await payment.save();
      }
      return res.json({
        success: true, orderId: order.id, amount: Math.round(totalAmount * 100),
        currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID, purchaseId: payment._id,
        itemName, isEmi: false,
      });
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/checkout/verify ─────────────────────────────────────────────
router.post('/verify', protect, async (req: any, res) => {
  try {
    const { type, razorpayOrderId, razorpayPaymentId, razorpaySignature, purchaseId, couponCode, promoCode, isEmi } = req.body;

    if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    if (type === 'package') {
      const purchase = await PackagePurchase.findById(purchaseId).populate('package');
      if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });

      purchase.razorpayPaymentId = razorpayPaymentId;
      purchase.razorpaySignature = razorpaySignature;
      purchase.status = 'paid';
      await purchase.save();

      const pkg = purchase.package as any;
      const tier = purchase.packageTier as any;

      // Update user
      await User.findByIdAndUpdate(req.user._id, {
        packageTier: tier,
        isAffiliate: true,
        commissionRate: COMMISSION_RATES[tier as keyof typeof COMMISSION_RATES] || 10,
        packagePurchasedAt: new Date(),
        packageSuspended: false,
        $inc: { xpPoints: 500 },
      });

      // Handle EMI schedule
      if (purchase.isEmi) {
        const totalAmt = purchase.amount + purchase.gstAmount;
        const installmentAmt = Math.ceil(totalAmt / 3);
        const now = new Date();

        // Mark installment 1 as paid
        await EmiInstallment.create({
          user: req.user._id, packagePurchase: purchase._id,
          installmentNumber: 1, totalInstallments: 3, amount: installmentAmt,
          dueDate: now, paidAt: now, razorpayOrderId, razorpayPaymentId, status: 'paid',
        });
        // Create pending installments 2 & 3
        for (let i = 2; i <= 3; i++) {
          const dueDate = new Date(now);
          dueDate.setDate(dueDate.getDate() + (i - 1) * 30);
          await EmiInstallment.create({
            user: req.user._id, packagePurchase: purchase._id,
            installmentNumber: i, totalInstallments: 3, amount: installmentAmt, dueDate, status: 'pending',
          });
        }
      }

      // Increment coupon usage
      if (couponCode) await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase().trim() }, { $inc: { usedCount: 1 } });

      // Credit MLM commissions
      await creditMLM(req.user._id.toString(), purchase.amount, purchase._id.toString(), tier);

      // Notification
      const user = await User.findById(req.user._id);
      if (user) {
        user.notifications.push({ type: 'package', message: `🎉 Welcome to ${pkg?.name || tier}! Your account is now upgraded.`, read: false, createdAt: new Date() });
        await user.save();
      }

      return res.json({ success: true, message: `Welcome to ${pkg?.name || tier}!`, tier, isEmi: purchase.isEmi });
    }

    if (type === 'course') {
      const payment = await Payment.findById(purchaseId).populate('affiliateUser');
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = 'paid';
      await payment.save();

      // Enroll
      await Enrollment.create({
        student: req.user._id, course: payment.course,
        paymentId: razorpayPaymentId, orderId: razorpayOrderId, amount: payment.amount,
      });

      const Course = (await import('../models/Course')).default;
      await Course.findByIdAndUpdate(payment.course, { $inc: { enrolledCount: 1 } });

      // Affiliate commission for courses
      if ((payment as any).affiliateUser) {
        const affiliate = (payment as any).affiliateUser;
        const commRate = parseFloat(process.env.AFFILIATE_COMMISSION_RATE || '10');
        const commAmt = Math.round(payment.amount * commRate / 100);
        await User.findByIdAndUpdate(affiliate._id, { $inc: { wallet: commAmt, totalEarnings: commAmt } });
        await Transaction.create({
          user: affiliate._id, type: 'credit', category: 'affiliate_commission',
          amount: commAmt, description: `Partner commission — course sale`, referenceId: payment._id, status: 'completed',
        });
      }

      // Coupon increment
      if (couponCode) await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase().trim() }, { $inc: { usedCount: 1 } });

      return res.json({ success: true, message: 'Enrollment successful!', courseId: payment.course });
    }

    return res.status(400).json({ success: false, message: 'Invalid type' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/checkout/emi ─────────────────────────────────────────────────
router.get('/emi', protect, async (req: any, res) => {
  try {
    // Auto-mark overdue installments
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 7); // 7 day grace period
    await EmiInstallment.updateMany(
      { user: req.user._id, status: 'pending', dueDate: { $lt: overdueDate } },
      { status: 'overdue' }
    );

    // Check if any overdue → suspend user
    const hasOverdue = await EmiInstallment.findOne({ user: req.user._id, status: 'overdue' });
    await User.findByIdAndUpdate(req.user._id, { packageSuspended: !!hasOverdue });

    const installments = await EmiInstallment.find({ user: req.user._id })
      .sort({ installmentNumber: 1 }).populate('packagePurchase');

    res.json({ success: true, installments, isSuspended: !!hasOverdue });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/checkout/emi/pay ────────────────────────────────────────────
router.post('/emi/pay', protect, async (req: any, res) => {
  try {
    const { installmentId } = req.body;
    const installment = await EmiInstallment.findOne({ _id: installmentId, user: req.user._id });
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });
    if (installment.status === 'paid') return res.status(400).json({ success: false, message: 'Already paid' });

    // Check previous installments are paid
    const prevUnpaid = await EmiInstallment.findOne({
      packagePurchase: installment.packagePurchase,
      installmentNumber: { $lt: installment.installmentNumber },
      status: { $ne: 'paid' },
    });
    if (prevUnpaid) return res.status(400).json({ success: false, message: 'Pay previous installments first' });

    const order = await rzp.orders.create({
      amount: Math.round(installment.amount * 100),
      currency: 'INR',
      receipt: `emi_${installmentId}_${Date.now()}`,
      notes: { installmentId, userId: req.user._id.toString(), type: 'emi' },
    });

    installment.razorpayOrderId = order.id;
    await installment.save();

    res.json({ success: true, orderId: order.id, amount: Math.round(installment.amount * 100), currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID, installmentId });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/checkout/emi/verify ─────────────────────────────────────────
router.post('/emi/verify', protect, async (req: any, res) => {
  try {
    const { installmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const installment = await EmiInstallment.findOne({ _id: installmentId, user: req.user._id });
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });

    installment.status = 'paid';
    installment.paidAt = new Date();
    installment.razorpayPaymentId = razorpayPaymentId;
    installment.razorpaySignature = razorpaySignature;
    await installment.save();

    // Check if all paid → restore access
    const remaining = await EmiInstallment.findOne({ packagePurchase: installment.packagePurchase, status: { $in: ['pending', 'overdue'] } });
    if (!remaining) {
      await User.findByIdAndUpdate(req.user._id, { packageSuspended: false });
    }
    // If overdue was the issue, restore temporarily
    const anyOverdue = await EmiInstallment.findOne({ packagePurchase: installment.packagePurchase, status: 'overdue' });
    if (!anyOverdue) await User.findByIdAndUpdate(req.user._id, { packageSuspended: false });

    res.json({ success: true, message: 'EMI payment successful!' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
