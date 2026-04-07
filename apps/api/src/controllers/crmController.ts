import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Lead from '../models/Lead';
import User from '../models/User';
import Notification from '../models/Notification';

// Round-robin manager assignment
async function getNextManager(): Promise<any> {
  const managers = await User.find({ role: { $in: ['manager', 'admin'] }, isActive: true }).select('_id');
  if (!managers.length) return null;
  // Simple: use count of leads to balance
  const counts = await Promise.all(managers.map(m => Lead.countDocuments({ assignedTo: m._id, stage: { $nin: ['paid', 'lost'] } })));
  const minIdx = counts.indexOf(Math.min(...counts));
  return managers[minIdx]?._id;
}

// POST /api/crm/leads — create lead (public, from landing page)
export const createLead = async (req: any, res: Response) => {
  try {
    const { name, phone, email, source, utmSource, utmMedium, utmCampaign, utmContent, campaign } = req.body;

    // Dedup check
    const existing = await Lead.findOne({ phone });
    if (existing) {
      return res.json({ success: true, message: 'Lead already exists', leadId: existing._id });
    }

    const assignedTo = await getNextManager();
    const lead = await Lead.create({ name, phone, email, source: source || 'website', utmSource, utmMedium, utmCampaign, utmContent, campaign, assignedTo });

    // Notify manager
    if (assignedTo) {
      await Notification.create({
        user: assignedTo,
        title: '🔥 New Lead Assigned',
        message: `${name} (${phone}) assigned to you. Source: ${source || 'website'}`,
        type: 'info',
        channel: 'inapp',
      });
    }

    // TODO: Trigger AI scoring job via BullMQ
    // TODO: Send WhatsApp welcome via WATI

    res.status(201).json({ success: true, leadId: lead._id });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/crm/leads — get leads (admin/manager)
export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { stage, source, score, page = 1, limit = 20, search } = req.query;
    const filter: any = {};

    // Managers see only their leads
    if (req.user.role === 'manager') filter.assignedTo = req.user._id;

    if (stage) filter.stage = stage;
    if (source) filter.source = source;
    if (score === 'hot') filter.aiScoreLabel = 'hot';
    if (score === 'warm') filter.aiScoreLabel = 'warm';
    if (score === 'cold') filter.aiScoreLabel = 'cold';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [leads, total] = await Promise.all([
      Lead.find(filter).populate('assignedTo', 'name avatar').sort('-createdAt').skip(skip).limit(Number(limit)),
      Lead.countDocuments(filter),
    ]);

    res.json({ success: true, leads, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/crm/leads/:id
export const getLead = async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email avatar').populate('notes.by', 'name');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// PATCH /api/crm/leads/:id — update stage, notes, follow-up
export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { stage, note, followUp, assignedTo, interestedPackage, objectionType, tags, aiScore, aiScoreLabel } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (stage) lead.stage = stage;
    if (interestedPackage) lead.interestedPackage = interestedPackage;
    if (objectionType) lead.objectionType = objectionType;
    if (tags) lead.tags = tags;
    if (aiScore !== undefined) { lead.aiScore = aiScore; lead.aiScoreLabel = aiScore >= 70 ? 'hot' : aiScore >= 40 ? 'warm' : 'cold'; }
    if (aiScoreLabel) lead.aiScoreLabel = aiScoreLabel;
    if (assignedTo && ['admin', 'superadmin'].includes(req.user.role)) lead.assignedTo = assignedTo;

    if (note) {
      lead.notes.push({ text: note, by: req.user._id, createdAt: new Date() });
      lead.lastContactedAt = new Date();
    }

    if (followUp) {
      lead.followUps.push({ scheduledAt: new Date(followUp.scheduledAt), type: followUp.type, done: false });
    }

    await lead.save();
    res.json({ success: true, lead });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/crm/stats
export const getCRMStats = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.user.role === 'manager') filter.assignedTo = req.user._id;

    const [total, byStage, bySource, hot, avgScore] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.aggregate([{ $match: filter }, { $group: { _id: '$stage', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: filter }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.countDocuments({ ...filter, aiScoreLabel: 'hot' }),
      Lead.aggregate([{ $match: filter }, { $group: { _id: null, avg: { $avg: '$aiScore' } } }]),
    ]);

    const conversionRate = byStage.find(s => s._id === 'paid')?.count
      ? ((byStage.find(s => s._id === 'paid')!.count / total) * 100).toFixed(1)
      : '0';

    res.json({ success: true, total, byStage, bySource, hot, avgScore: avgScore[0]?.avg?.toFixed(1) || 0, conversionRate });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// DELETE /api/crm/leads/:id (admin only)
export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lead deleted' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};
