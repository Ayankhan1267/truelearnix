import { Router } from 'express';
import { register, login, verifyOTP, resendOTP, refreshToken, forgotPassword, resetPassword, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';
import User from '../models/User';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', protect, logout);

// Mentor application (no OTP needed, admin reviews)
router.post('/mentor-apply', async (req, res) => {
  try {
    const { name, email, phone, password, experience, expertise, bio, linkedin, portfolio } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name, email, phone, password,
      role: 'mentor',
      isVerified: false,
      isActive: false,
      mentorStatus: 'pending',
      mentorApplication: { experience, expertise: expertise || [], bio, linkedin, portfolio, appliedAt: new Date() },
    });

    res.status(201).json({ success: true, message: 'Application submitted! Admin will review and activate your account.' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
