import { Router } from 'express';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import { protect } from '../middleware/auth';
import { uploadToS3 } from '../services/s3Service';

const router = Router();

router.get('/me', protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    res.json({ success: true, user });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/me', protect, async (req: any, res) => {
  try {
    const allowed = ['name', 'phone', 'bio', 'expertise', 'socialLinks'];
    const update: any = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/avatar', protect, uploadToS3.single('avatar'), async (req: any, res) => {
  try {
    const fileUrl = (req.file as any)?.location;
    if (!fileUrl) return res.status(400).json({ success: false, message: 'No file uploaded' });
    await User.findByIdAndUpdate(req.user._id, { avatar: fileUrl });
    res.json({ success: true, avatar: fileUrl });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/enrolled-courses', protect, async (req: any, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course', 'title thumbnail slug category level').sort('-createdAt');
    res.json({ success: true, enrollments });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/notifications', protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ success: true, notifications: user?.notifications || [] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/notifications/read', protect, async (req: any, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { 'notifications.$[].read': true } });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/users/ai-coach — AI coach chat (GPT-4o or placeholder)
router.post('/ai-coach', protect, async (req: any, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message required' });

    // If OpenAI key is set, use GPT-4o; otherwise return a placeholder response
    if (process.env.OPENAI_API_KEY) {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const systemPrompt = `You are TureLearnix AI Coach — an expert mentor for digital marketing, affiliate marketing, and online business.
The user is a ${req.user.packageTier || 'free'} tier member on the TureLearnix platform.
Be concise, practical, and motivating. Answer in the language the user writes in (Hindi or English).
Context: ${context || 'General guidance'}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 500,
      });
      const reply = completion.choices[0]?.message?.content || 'I could not generate a response.';
      return res.json({ success: true, reply, model: 'gpt-4o-mini' });
    }

    // Placeholder responses when OpenAI not configured
    const placeholders: Record<string, string> = {
      default: 'Great question! Focus on building genuine value for your audience. Consistency and authenticity are the keys to long-term success in affiliate marketing.',
      commission: 'Your commission rate increases with your package tier. Upgrade to Elite or Supreme to unlock 22-30% on Level 1 referrals!',
      course: 'Start with the fundamentals course, then move to the advanced digital marketing modules. Each completed lesson unlocks more content.',
      withdraw: 'Withdrawals are processed within 24-48 hours. Minimum withdrawal amount is ₹500.',
    };

    const lower = message.toLowerCase();
    const reply = lower.includes('commission') ? placeholders.commission
      : lower.includes('course') ? placeholders.course
      : lower.includes('withdraw') ? placeholders.withdraw
      : placeholders.default;

    res.json({ success: true, reply, model: 'placeholder' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/users/leaderboard — XP leaderboard
router.get('/leaderboard', protect, async (_req, res) => {
  try {
    const users = await User.find({ isActive: true, xpPoints: { $gt: 0 } })
      .select('name avatar xpPoints level badges packageTier')
      .sort('-xpPoints').limit(20);
    res.json({ success: true, leaderboard: users });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
