import { Router } from 'express';
import { createClass, getUpcomingClasses, joinClass, startClass, endClass, cancelClass, getPublicLiveClasses } from '../controllers/classController';
import { protect, authorize } from '../middleware/auth';
import LiveClass from '../models/LiveClass';
import { generateZoomSignature } from '../services/zoomSdkService';

const router = Router();

router.get('/public', getPublicLiveClasses);
router.get('/upcoming', protect, getUpcomingClasses);

router.get('/my', protect, authorize('mentor'), async (req: any, res) => {
  try {
    const classes = await LiveClass.find({ mentor: req.user._id })
      .populate('course', 'title').sort('-scheduledAt');
    res.json({ success: true, classes });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

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

router.post('/', protect, authorize('mentor', 'superadmin', 'admin', 'manager'), createClass);

// Get class detail
router.get('/:id/detail', protect, async (req: any, res) => {
  try {
    const cls = await LiveClass.findById(req.params.id)
      .populate('mentor', 'name avatar email')
      .populate('course', 'title thumbnail');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, liveClass: cls });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Zoom SDK Signature ─────────────────────────────────────────────────────────
router.get('/:id/zoom-signature', protect, async (req: any, res) => {
  try {
    const cls = await LiveClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    if (!cls.zoomMeetingId) return res.status(400).json({ success: false, message: 'No Zoom meeting linked' });

    const isMentor = cls.mentor.toString() === req.user._id.toString()
      || ['superadmin', 'admin', 'manager'].includes(req.user.role);
    const role = isMentor ? 1 : 0;

    const signature = generateZoomSignature(cls.zoomMeetingId, role);
    res.json({
      success: true,
      signature,
      sdkKey: process.env.ZOOM_SDK_KEY || process.env.ZOOM_API_KEY || '',
      meetingNumber: cls.zoomMeetingId,
      password: cls.zoomPassword || '',
      role,
      userName: req.user.name,
      userEmail: req.user.email,
      duration: cls.duration,
      title: cls.title,
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Attendance: Heartbeat (called every 30s from frontend) ────────────────────
router.post('/:id/attendance/ping', protect, async (req: any, res) => {
  try {
    const cls = await LiveClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

    const userId = req.user._id.toString();
    let record = (cls.attendanceRecords as any[]).find((r: any) => r.user.toString() === userId);

    if (!record) {
      (cls.attendanceRecords as any[]).push({
        user: req.user._id, totalWatchSeconds: 30, isPresent: false, lastPing: new Date()
      });
      record = (cls.attendanceRecords as any[]).at(-1);
    } else {
      record.totalWatchSeconds = (record.totalWatchSeconds || 0) + 30;
      record.lastPing = new Date();
    }

    const thresholdSecs = cls.duration * 60 * 0.75;
    const wasPresent = record.isPresent;
    record.isPresent = record.totalWatchSeconds >= thresholdSecs;

    await cls.save();
    res.json({
      success: true,
      isPresent: record.isPresent,
      justMarked: !wasPresent && record.isPresent,
      totalWatchSeconds: record.totalWatchSeconds,
      thresholdSeconds: thresholdSecs,
      percent: Math.min(100, Math.round((record.totalWatchSeconds / (cls.duration * 60)) * 100)),
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Attendance: My status ─────────────────────────────────────────────────────
router.get('/:id/attendance/me', protect, async (req: any, res) => {
  try {
    const cls = await LiveClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

    const userId = req.user._id.toString();
    const record = (cls.attendanceRecords as any[]).find((r: any) => r.user.toString() === userId);
    const thresholdSecs = cls.duration * 60 * 0.75;
    res.json({
      success: true,
      isPresent: record?.isPresent || false,
      totalWatchSeconds: record?.totalWatchSeconds || 0,
      thresholdSeconds: thresholdSecs,
      percent: record ? Math.min(100, Math.round((record.totalWatchSeconds / (cls.duration * 60)) * 100)) : 0,
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Attendance: All (mentor/admin view) ───────────────────────────────────────
router.get('/:id/attendance', protect, authorize('mentor', 'superadmin', 'admin', 'manager'), async (req: any, res) => {
  try {
    const cls = await LiveClass.findById(req.params.id)
      .populate('attendanceRecords.user', 'name email avatar');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, attendanceRecords: cls.attendanceRecords, duration: cls.duration });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id/join', protect, joinClass);
router.patch('/:id/start', protect, authorize('mentor', 'superadmin', 'admin', 'manager'), startClass);
router.patch('/:id/end', protect, authorize('mentor', 'superadmin', 'admin', 'manager'), endClass);
router.delete('/:id', protect, authorize('mentor', 'superadmin', 'admin', 'manager'), cancelClass);

export default router;
