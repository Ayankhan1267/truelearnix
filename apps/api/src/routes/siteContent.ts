import { Router } from 'express';
import SiteContent from '../models/SiteContent';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Public: get section content
router.get('/:section', async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ section: req.params.section });
    res.json({ success: true, data: doc?.data ?? null });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin: list all sections
router.get('/', protect, authorize('admin', 'superadmin'), async (_req, res) => {
  try {
    const docs = await SiteContent.find().sort({ section: 1 });
    res.json({ success: true, sections: docs });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin: upsert section content
router.put('/:section', protect, authorize('admin', 'superadmin'), async (req: any, res) => {
  try {
    const doc = await SiteContent.findOneAndUpdate(
      { section: req.params.section },
      { $set: { data: req.body, updatedBy: req.user._id } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: doc.data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

export default router;
