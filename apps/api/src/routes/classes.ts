import { Router } from 'express';
import { createClass, getUpcomingClasses, joinClass, startClass, endClass, cancelClass } from '../controllers/classController';
import { protect, authorize } from '../middleware/auth';
import LiveClass from '../models/LiveClass';

const router = Router();

router.get('/upcoming', protect, getUpcomingClasses);

// Mentor: get all their classes
router.get('/my', protect, authorize('mentor'), async (req: any, res) => {
  try {
    const classes = await LiveClass.find({ mentor: req.user._id })
      .populate('course', 'title').sort('-scheduledAt');
    res.json({ success: true, classes });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Admin: get all classes
router.get('/all', protect, authorize('superadmin', 'admin'), async (_req, res) => {
  try {
    const classes = await LiveClass.find()
      .populate('mentor', 'name email')
      .populate('course', 'title').sort('-scheduledAt').limit(100);
    res.json({ success: true, classes });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', protect, authorize('mentor'), createClass);
router.get('/:id/join', protect, joinClass);
router.patch('/:id/start', protect, authorize('mentor'), startClass);
router.patch('/:id/end', protect, authorize('mentor'), endClass);
router.delete('/:id', protect, authorize('mentor'), cancelClass);

export default router;
