import { Router } from 'express';
import { protect as authenticate, authorize } from '../middleware/auth';
import Task from '../models/Task';

const router = Router();

// Get all tasks (admin) or own tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const filter = ['admin', 'superadmin', 'manager'].includes(user.role)
      ? {}
      : { $or: [{ createdBy: user._id }, { assignedTo: user._id }] };
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name')
      .sort({ column: 1, createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Create task
router.post('/', authenticate, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: (req as any).user._id });
    await task.populate('assignedTo', 'name avatar');
    res.status(201).json({ success: true, data: task });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Update task (status, priority, etc.)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
