import { Router } from 'express';
import { protect as authenticate } from '../middleware/auth';
import FreelanceJob from '../models/FreelanceJob';

const router = Router();

// Get all open jobs
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, search, experienceLevel } = req.query as any;
    const filter: any = { status: 'open' };
    if (category) filter.category = category;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const jobs = await FreelanceJob.find(filter)
      .populate('postedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get user's posted jobs
router.get('/my', authenticate, async (req, res) => {
  try {
    const jobs = await FreelanceJob.find({ postedBy: (req as any).user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Post a job
router.post('/', authenticate, async (req, res) => {
  try {
    const job = await FreelanceJob.create({ ...req.body, postedBy: (req as any).user._id });
    res.status(201).json({ success: true, data: job });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Apply to job
router.post('/:id/apply', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    const job = await FreelanceJob.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.applicants.some(id => id.toString() === userId.toString())) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }
    job.applicants.push(userId);
    await job.save();
    res.json({ success: true, message: 'Application submitted' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update job
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const job = await FreelanceJob.findOneAndUpdate(
      { _id: req.params.id, postedBy: (req as any).user._id },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
