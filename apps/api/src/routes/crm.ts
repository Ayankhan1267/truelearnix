import { Router } from 'express';
import { createLead, getLeads, getLead, updateLead, getCRMStats, deleteLead } from '../controllers/crmController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Public — landing page lead capture
router.post('/leads', createLead);

// Protected
router.use(protect);
router.get('/leads', authorize('superadmin', 'admin', 'manager'), getLeads);
router.get('/stats', authorize('superadmin', 'admin', 'manager'), getCRMStats);
router.get('/leads/:id', authorize('superadmin', 'admin', 'manager'), getLead);
router.patch('/leads/:id', authorize('superadmin', 'admin', 'manager'), updateLead);
router.delete('/leads/:id', authorize('superadmin', 'admin'), deleteLead);

export default router;
