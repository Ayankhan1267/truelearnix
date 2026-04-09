import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Commission from '../models/Commission';

const router = Router();
router.use(protect, authorize('mentor'));

// Dashboard stats
router.get('/dashboard', async (req: any, res) => {
  try {
    const mentor = await User.findById(req.user._id)
      .select('name avatar assignedCourses wallet totalEarnings packageTier isAffiliate commissionRate affiliateCode')
      .populate('assignedCourses.courseId', 'title thumbnail enrolledCount');

    const courseIds = (mentor?.assignedCourses || []).map((c: any) => c.courseId?._id).filter(Boolean);
    const [totalStudents, recentEnrollments, monthlyEarnings] = await Promise.all([
      Enrollment.countDocuments({ course: { $in: courseIds } }),
      Enrollment.find({ course: { $in: courseIds } }).sort('-createdAt').limit(5).populate('user', 'name avatar').populate('course', 'title'),
      Commission.aggregate([
        { $match: { earner: req.user._id, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]),
    ]);

    res.json({
      success: true,
      mentor: { name: mentor?.name, avatar: mentor?.avatar, packageTier: mentor?.packageTier, isAffiliate: mentor?.isAffiliate, wallet: mentor?.wallet, totalEarnings: mentor?.totalEarnings, affiliateCode: mentor?.affiliateCode },
      assignedCourses: mentor?.assignedCourses || [],
      stats: {
        totalCourses: courseIds.length,
        totalStudents,
        monthlyEarnings: monthlyEarnings[0]?.total || 0,
        wallet: mentor?.wallet || 0,
      },
      recentEnrollments,
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Get assigned courses
router.get('/courses', async (req: any, res) => {
  try {
    const mentor = await User.findById(req.user._id)
      .select('assignedCourses')
      .populate('assignedCourses.courseId', 'title thumbnail description enrolledCount status category level price');
    res.json({ success: true, courses: mentor?.assignedCourses || [] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Get students in a specific assigned course
router.get('/courses/:courseId/students', async (req: any, res) => {
  try {
    const mentor = await User.findById(req.user._id).select('assignedCourses');
    const isAssigned = mentor?.assignedCourses?.some((c: any) => c.courseId.toString() === req.params.courseId);
    if (!isAssigned) return res.status(403).json({ success: false, message: 'Course not assigned to you' });

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('user', 'name email avatar phone packageTier createdAt lastLogin')
      .sort('-createdAt');

    res.json({ success: true, students: enrollments, total: enrollments.length });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Get mentor profile
router.get('/profile', async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken -otp');
    res.json({ success: true, user });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/profile', async (req: any, res) => {
  try {
    const { name, phone, bio, expertise, socialLinks, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, bio, expertise, socialLinks, avatar }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
