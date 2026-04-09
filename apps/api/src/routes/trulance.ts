import { Router } from 'express';
import { protect } from '../middleware/auth';
import FreelanceJob from '../models/FreelanceJob';
import User from '../models/User';

const router = Router();

// Public: Browse all open projects
router.get('/projects', async (req, res) => {
  try {
    const { category, search, experienceLevel, budgetType, page = 1, limit = 12 } = req.query as any;
    const filter: any = { status: 'open' };
    if (category && category !== 'All') filter.category = category;
    if (experienceLevel && experienceLevel !== 'All') filter.experienceLevel = experienceLevel;
    if (budgetType && budgetType !== 'All') filter.budgetType = budgetType;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      FreelanceJob.find(filter)
        .populate('postedBy', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FreelanceJob.countDocuments(filter),
    ]);
    res.json({ success: true, data: jobs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public: Single project detail
router.get('/projects/:id', async (req, res) => {
  try {
    const job = await FreelanceJob.findById(req.params.id).populate('postedBy', 'name avatar bio expertise');
    if (!job) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: job });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public: Browse freelancers (students)
router.get('/freelancers', async (req, res) => {
  try {
    const { search, skill, page = 1, limit = 12 } = req.query as any;
    const filter: any = { role: 'student', isActive: true };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (skill) filter.expertise = { $in: [new RegExp(skill, 'i')] };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name avatar bio expertise socialLinks packageTier xpPoints level badges createdAt')
        .sort({ xpPoints: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public: Single freelancer profile
router.get('/freelancers/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar bio expertise socialLinks packageTier xpPoints level badges createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'Freelancer not found' });
    const jobsCount = await FreelanceJob.countDocuments({ postedBy: user._id });
    res.json({ success: true, data: { ...user.toObject(), jobsCount } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
