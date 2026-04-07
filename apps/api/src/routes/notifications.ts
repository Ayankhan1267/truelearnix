import { Router } from 'express';
import Notification from '../models/Notification';
import SupportTicket from '../models/SupportTicket';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, async (req: any, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total, unread] = await Promise.all([
      Notification.find({ user: req.user._id }).sort('-createdAt').skip(skip).limit(Number(limit)),
      Notification.countDocuments({ user: req.user._id }),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);
    res.json({ success: true, notifications, total, unread });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/read-all', protect, async (req: any, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/:id/read', protect, async (req: any, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Support tickets
router.post('/ticket', protect, async (req: any, res) => {
  try {
    const ticket = await SupportTicket.create({
      user: req.user._id, ...req.body,
      messages: [{ sender: req.user._id, senderRole: req.user.role, message: req.body.description, createdAt: new Date() }]
    });
    res.status(201).json({ success: true, ticket });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/tickets', protect, async (req: any, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, tickets });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
