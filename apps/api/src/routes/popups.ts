import { Router } from 'express';
import Popup from '../models/Popup';
import User from '../models/User';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// ─── Public: active popups for website ───────────────────────────────────────
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const popups = await Popup.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } },
      ],
    })
      .where('$or').equals([
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } },
      ])
      .sort({ priority: -1, createdAt: -1 });

    res.json({ success: true, popups });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── Public: latest 50k earnings milestone user ───────────────────────────────
router.get('/milestone', async (req, res) => {
  try {
    const user = await User.findOne({ totalEarnings: { $gte: 50000 } })
      .sort({ totalEarnings: -1, updatedAt: -1 })
      .select('name totalEarnings avatar city packageTier');

    res.json({ success: true, user: user || null });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── Admin: CRUD ──────────────────────────────────────────────────────────────
router.use(protect, authorize('superadmin', 'admin'));

router.get('/', async (req, res) => {
  try {
    const popups = await Popup.find().sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, popups });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/', async (req: any, res) => {
  try {
    const popup = await Popup.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, popup });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const popup = await Popup.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!popup) return res.status(404).json({ success: false, message: 'Popup not found' });
    res.json({ success: true, popup });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const popup = await Popup.findById(req.params.id);
    if (!popup) return res.status(404).json({ success: false, message: 'Popup not found' });
    popup.isActive = !popup.isActive;
    await popup.save();
    res.json({ success: true, popup });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Popup.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Popup deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
