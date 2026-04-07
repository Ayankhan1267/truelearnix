import { Router } from 'express';
import { createClass, getUpcomingClasses, joinClass, startClass, endClass, cancelClass, getPublicLiveClasses } from '../controllers/classController';
import { protect, authorize } from '../middleware/auth';
import LiveClass from '../models/LiveClass';

const router = Router();

router.get('/public', getPublicLiveClasses);

router.get('/upcoming', protect, getUpcomingClasses);

// Mentor: get all their classes
router.get('/my', protect, authorize('mentor'), async (req: any, res) => {
  try {
    const classes = await LiveClass.find({ mentor: req.user._id })
      .populate('course', 'title').sort('-scheduledAt');
    res.json({ success: true, classes });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Admin: get all classes (also handles GET /classes with query params)
router.get('/all', protect, authorize('superadmin', 'admin', 'manager'), async (req: any, res) => {
  try {
    const { status, limit = 100 } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    const classes = await LiveClass.find(filter)
      .populate('mentor', 'name email avatar')
      .populate('course', 'title category').sort('-scheduledAt').limit(Number(limit));
    res.json({ success: true, classes });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Also handle GET /classes (called by admin frontend)
router.get('/', protect, authorize('superadmin', 'admin', 'manager'), async (req: any, res) => {
  try {
    const { status, limit = 100 } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    const classes = await LiveClass.find(filter)
      .populate('mentor', 'name email avatar')
      .populate('course', 'title category').sort('-scheduledAt').limit(Number(limit));
    res.json({ success: true, classes });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Admin OR mentor can create classes
router.post('/', protect, authorize('mentor', 'superadmin', 'admin', 'manager'), createClass);
router.get('/:id/join', protect, joinClass);
router.patch('/:id/start', protect, authorize('mentor'), startClass);
router.patch('/:id/end', protect, authorize('mentor'), endClass);
router.delete('/:id', protect, authorize('mentor'), cancelClass);

export default router;
