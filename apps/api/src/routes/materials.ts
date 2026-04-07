import { Router } from 'express';
import { protect as authenticate, authorize } from '../middleware/auth';
import StudyMaterial from '../models/StudyMaterial';

const router = Router();

// Get materials
router.get('/', authenticate, async (req, res) => {
  try {
    const { courseId, type, search } = req.query as any;
    const filter: any = {};
    if (courseId) filter.courseId = courseId;
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const user = (req as any).user;
    if (!['admin', 'superadmin', 'manager'].includes(user.role)) {
      filter.$or = [{ isPublic: true }, { uploadedBy: user._id }];
    }
    const materials = await StudyMaterial.find(filter)
      .populate('uploadedBy', 'name')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Upload material
router.post('/', authenticate, async (req, res) => {
  try {
    const material = await StudyMaterial.create({ ...req.body, uploadedBy: (req as any).user._id });
    res.status(201).json({ success: true, data: material });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Increment download count
router.post('/:id/download', authenticate, async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true });
    res.json({ success: true, data: material });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update material
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: material });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Delete material
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Material deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
