import { Router } from 'express';
import { protect as authenticate } from '../middleware/auth';
import Project from '../models/Project';

const router = Router();

// Get all published projects
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, search, userId } = req.query as any;
    const filter: any = { status: 'published' };
    if (category) filter.category = category;
    if (userId) filter.owner = userId;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const projects = await Project.find(filter)
      .populate('owner', 'name avatar packageTier')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get user's own projects
router.get('/my', authenticate, async (req, res) => {
  try {
    const projects = await Project.find({ owner: (req as any).user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Create project
router.post('/', authenticate, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, owner: (req as any).user._id });
    res.status(201).json({ success: true, data: project });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Like / unlike project
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const liked = project.likes.some(id => id.toString() === userId.toString());
    if (liked) {
      project.likes = project.likes.filter(id => id.toString() !== userId.toString()) as any;
    } else {
      project.likes.push(userId);
    }
    await project.save();
    res.json({ success: true, liked: !liked, likesCount: project.likes.length });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update project
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: (req as any).user._id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, owner: (req as any).user._id });
    res.json({ success: true, message: 'Project deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
