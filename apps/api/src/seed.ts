/**
 * TruLearnix Demo Data Seeder
 * Run: npx ts-node -r tsconfig-paths/register src/seed.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// ── Helpers ────────────────────────────────────────────────────────────────────

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000);
const futureDate = (daysAhead: number) => new Date(Date.now() + daysAhead * 86400000);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const affCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TL';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

// ── Connect ────────────────────────────────────────────────────────────────────

async function connect() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trulearnix');
  console.log('✅ MongoDB connected');
}

// ── Models (lazy import) ───────────────────────────────────────────────────────

const getModels = async () => ({
  User: (await import('./models/User')).default,
  Course: (await import('./models/Course')).default,
  Enrollment: (await import('./models/Enrollment')).default,
  Package: (await import('./models/Package')).default,
  PackagePurchase: (await import('./models/PackagePurchase')).default,
  Commission: (await import('./models/Commission')).default,
  Transaction: (await import('./models/Transaction')).default,
  LiveClass: (await import('./models/LiveClass')).default,
  Blog: (await import('./models/Blog')).default,
  Popup: (await import('./models/Popup')).default,
  Lead: (await import('./models/Lead')).default,
  Quiz: (await import('./models/Quiz')).default,
  CommunityPost: (await import('./models/CommunityPost')).default,
});

// ── Seed Packages ──────────────────────────────────────────────────────────────

async function seedPackages(Package: any) {
  await Package.deleteMany({});
  await Package.insertMany([
    {
      name: 'Starter', tier: 'starter', price: 4999, commissionRate: 10,
      description: 'Perfect to start your partner journey with basic tools and access.',
      features: ['5 Courses Access', 'Community Access', '10% L1 Commission', 'Basic Support', 'Partner Dashboard'],
      coursesAccess: 'limited', liveClassAccess: false, aiCoachAccess: false,
      jobEngineAccess: false, personalBrandAccess: false, mentorSupport: false,
      prioritySupport: false, emiAvailable: false, displayOrder: 1,
      badge: 'Starter', badgeColor: '#6b7280',
    },
    {
      name: 'Pro', tier: 'pro', price: 9999, commissionRate: 15,
      description: 'Unlock live classes, AI Coach and higher commissions.',
      features: ['All Courses Access', 'Live Classes', 'AI Coach', '15% L1 Commission', 'Community Access', 'Job Engine', 'Priority Email Support'],
      coursesAccess: 'full', liveClassAccess: true, aiCoachAccess: true,
      jobEngineAccess: true, personalBrandAccess: false, mentorSupport: false,
      prioritySupport: false, emiAvailable: true, emiMonths: 3, emiMonthlyAmount: 3333,
      displayOrder: 2, badge: 'Pro', badgeColor: '#3b82f6',
    },
    {
      name: 'Elite', tier: 'elite', price: 19999, commissionRate: 22,
      description: 'Full platform access with personal brand builder and mentor support.',
      features: ['All Courses Access', 'Live Classes', 'AI Coach', '22% L1 Commission', 'Personal Brand Builder', 'Mentor Support', 'Job Engine', 'Priority Support'],
      coursesAccess: 'full', liveClassAccess: true, aiCoachAccess: true,
      jobEngineAccess: true, personalBrandAccess: true, mentorSupport: true,
      prioritySupport: false, emiAvailable: true, emiMonths: 6, emiMonthlyAmount: 3333,
      displayOrder: 3, badge: 'Elite', badgeColor: '#8b5cf6',
    },
    {
      name: 'Supreme', tier: 'supreme', price: 29999, commissionRate: 30,
      description: 'Maximum earnings, all features, VIP support — the ultimate package.',
      features: ['Everything in Elite', '30% L1 Commission', 'VIP Support', '1:1 Mentor Sessions', 'Early Feature Access', 'Revenue Share Bonus'],
      coursesAccess: 'full', liveClassAccess: true, aiCoachAccess: true,
      jobEngineAccess: true, personalBrandAccess: true, mentorSupport: true,
      prioritySupport: true, emiAvailable: true, emiMonths: 12, emiMonthlyAmount: 2500,
      displayOrder: 4, badge: 'Supreme', badgeColor: '#f59e0b',
    },
  ]);
  console.log('  ✓ Packages (4)');
}

// ── Seed Users ─────────────────────────────────────────────────────────────────

async function seedUsers(User: any) {
  await User.deleteMany({});
  const password = await bcrypt.hash('Demo@1234', 12);

  // ── Superadmin
  const superadmin = await User.create({
    name: 'Super Admin', email: 'superadmin@peptly.in', phone: '9000000001',
    password, role: 'superadmin', isVerified: true, isActive: true,
    packageTier: 'supreme', isAffiliate: true, commissionRate: 30,
    affiliateCode: 'TLADMIN', wallet: 50000, totalEarnings: 150000, totalWithdrawn: 100000,
    xpPoints: 9999, level: 10, badges: ['founder', 'top-earner', 'legend'],
    streak: 45, loginCount: 200,
    kyc: { status: 'verified', pan: 'ABCPA1234D', panName: 'Super Admin', panVerified: true, aadhar: '123456789012', aadharName: 'Super Admin', aadharVerified: true, bankAccount: '12345678901', bankIfsc: 'SBIN0001234', bankName: 'SBI', bankHolderName: 'Super Admin', verifiedAt: pastDate(30) },
  });

  // ── Admin
  const admin = await User.create({
    name: 'Rajesh Kumar', email: 'admin@peptly.in', phone: '9000000002',
    password, role: 'admin', isVerified: true, isActive: true,
    packageTier: 'elite', isAffiliate: true, commissionRate: 22,
    affiliateCode: 'TLRAJESH', wallet: 22000, totalEarnings: 85000, totalWithdrawn: 63000,
    xpPoints: 7800, level: 8, badges: ['admin', 'top-earner'], streak: 30, loginCount: 150,
    kyc: { status: 'verified', pan: 'BCDPB2345E', panName: 'Rajesh Kumar', panVerified: true, aadhar: '234567890123', aadharName: 'Rajesh Kumar', aadharVerified: true, bankAccount: '23456789012', bankIfsc: 'HDFC0001234', bankName: 'HDFC', bankHolderName: 'Rajesh Kumar', verifiedAt: pastDate(60) },
  });

  // ── Mentors (3)
  const mentorData = [
    { name: 'Priya Sharma', email: 'mentor1@peptly.in', phone: '9111111001', packageTier: 'supreme', commissionRate: 30, affiliateCode: 'TLPRIYA', wallet: 18500, totalEarnings: 62000, xpPoints: 6500, level: 7, streak: 22 },
    { name: 'Amit Verma', email: 'mentor2@peptly.in', phone: '9111111002', packageTier: 'elite', commissionRate: 22, affiliateCode: 'TLAMIT', wallet: 12000, totalEarnings: 44000, xpPoints: 5200, level: 6, streak: 15 },
    { name: 'Sneha Patel', email: 'mentor3@peptly.in', phone: '9111111003', packageTier: 'pro', commissionRate: 15, affiliateCode: 'TLSNEHA', wallet: 7800, totalEarnings: 28000, xpPoints: 4100, level: 5, streak: 11 },
  ];
  const mentors = await Promise.all(mentorData.map(m => User.create({
    ...m, password, role: 'mentor', isVerified: true, isActive: true,
    isAffiliate: true, totalWithdrawn: 0, badges: ['mentor'], loginCount: rnd(50, 120),
    kyc: { status: 'verified', verifiedAt: pastDate(rnd(20, 90)) },
    managerName: 'Rajesh Kumar', managerPhone: '9000000002',
  })));

  // ── Supreme Partners (5) — top earners, will be on leaderboard
  const supremeNames = ['Vikram Singh', 'Deepak Joshi', 'Rohit Yadav', 'Kavya Nair', 'Sanjay Mehta'];
  const supremeEmails = ['vikram@test.in', 'deepak@test.in', 'rohit@test.in', 'kavya@test.in', 'sanjay@test.in'];
  const supremePartners = await Promise.all(supremeNames.map((name, i) => User.create({
    name, email: supremeEmails[i], phone: `901111${String(i+1).padStart(4,'0')}`,
    password, role: 'student', isVerified: true, isActive: true,
    packageTier: 'supreme', isAffiliate: true, commissionRate: 30,
    affiliateCode: affCode(),
    wallet: rnd(15000, 45000), totalEarnings: rnd(50000, 120000), totalWithdrawn: rnd(10000, 40000),
    xpPoints: rnd(3000, 8000), level: rnd(5, 9), badges: ['supreme-partner'],
    streak: rnd(10, 40), loginCount: rnd(60, 200),
    referredBy: superadmin._id, upline1: superadmin._id,
    sponsorCode: 'TLADMIN', managerName: 'Rajesh Kumar', managerPhone: '9000000002',
    packagePurchasedAt: pastDate(rnd(30, 180)), packageExpiresAt: futureDate(rnd(60, 300)),
    kyc: { status: 'verified', verifiedAt: pastDate(rnd(10, 60)) },
  })));

  // ── Elite Partners (8)
  const eliteNames = ['Mohan Das', 'Ritu Gupta', 'Arjun Sharma', 'Pooja Singh', 'Nikhil Jain', 'Swati Rao', 'Karan Malhotra', 'Divya Tiwari'];
  const elitePartners = await Promise.all(eliteNames.map((name, i) => User.create({
    name, email: `elite${i+1}@test.in`, phone: `902222${String(i+1).padStart(4,'0')}`,
    password, role: 'student', isVerified: true, isActive: true,
    packageTier: 'elite', isAffiliate: true, commissionRate: 22,
    affiliateCode: affCode(),
    wallet: rnd(5000, 18000), totalEarnings: rnd(18000, 55000), totalWithdrawn: rnd(3000, 15000),
    xpPoints: rnd(1500, 4500), level: rnd(3, 7), badges: ['elite-partner'],
    streak: rnd(5, 25), loginCount: rnd(30, 100),
    referredBy: supremePartners[i % 5]._id, upline1: supremePartners[i % 5]._id, upline2: superadmin._id,
    sponsorCode: supremePartners[i % 5].affiliateCode, managerName: 'Rajesh Kumar', managerPhone: '9000000002',
    packagePurchasedAt: pastDate(rnd(20, 150)), packageExpiresAt: futureDate(rnd(60, 280)),
    kyc: { status: i < 5 ? 'verified' : 'submitted', verifiedAt: i < 5 ? pastDate(rnd(5, 50)) : undefined },
  })));

  // ── Pro Partners (10)
  const proNames = ['Ankit Sharma', 'Meera Joshi', 'Rahul Singh', 'Priti Yadav', 'Gaurav Patel', 'Sunita Verma', 'Lalit Kumar', 'Shweta Das', 'Manoj Gupta', 'Neha Mishra'];
  const proPartners = await Promise.all(proNames.map((name, i) => User.create({
    name, email: `pro${i+1}@test.in`, phone: `903333${String(i+1).padStart(4,'0')}`,
    password, role: 'student', isVerified: true, isActive: true,
    packageTier: 'pro', isAffiliate: true, commissionRate: 15,
    affiliateCode: affCode(),
    wallet: rnd(1500, 8000), totalEarnings: rnd(5000, 20000), totalWithdrawn: rnd(0, 5000),
    xpPoints: rnd(500, 2500), level: rnd(2, 5), badges: ['pro-partner'],
    streak: rnd(2, 15), loginCount: rnd(15, 60),
    referredBy: elitePartners[i % 8]._id, upline1: elitePartners[i % 8]._id, upline2: supremePartners[i % 5]._id, upline3: superadmin._id,
    sponsorCode: elitePartners[i % 8].affiliateCode,
    packagePurchasedAt: pastDate(rnd(10, 90)), packageExpiresAt: futureDate(rnd(30, 250)),
    kyc: { status: i < 3 ? 'verified' : i < 6 ? 'submitted' : 'pending' },
  })));

  // ── Starter Partners (8)
  const starterNames = ['Bhavna Roy', 'Vivek Soni', 'Archana Nair', 'Mukesh Tiwari', 'Sarita Pandey', 'Ajay Shukla', 'Rekha Kumari', 'Suresh Rao'];
  const starterPartners = await Promise.all(starterNames.map((name, i) => User.create({
    name, email: `starter${i+1}@test.in`, phone: `904444${String(i+1).padStart(4,'0')}`,
    password, role: 'student', isVerified: true, isActive: true,
    packageTier: 'starter', isAffiliate: true, commissionRate: 10,
    affiliateCode: affCode(),
    wallet: rnd(200, 2500), totalEarnings: rnd(500, 5000), totalWithdrawn: rnd(0, 1000),
    xpPoints: rnd(100, 800), level: rnd(1, 3), badges: [],
    streak: rnd(0, 8), loginCount: rnd(5, 30),
    referredBy: proPartners[i % 10]._id, upline1: proPartners[i % 10]._id, upline2: elitePartners[i % 8]._id, upline3: supremePartners[i % 5]._id,
    sponsorCode: proPartners[i % 10].affiliateCode,
    packagePurchasedAt: pastDate(rnd(5, 60)), packageExpiresAt: futureDate(rnd(30, 200)),
    kyc: { status: 'pending' },
  })));

  // ── Free Students (10)
  const freeNames = ['Pankaj Kumar', 'Anjali Devi', 'Sunil Sharma', 'Geeta Rani', 'Ramesh Singh', 'Pushpa Yadav', 'Dilip Jha', 'Seema Kumari', 'Vijay Pandey', 'Usha Mishra'];
  const freeStudents = await Promise.all(freeNames.map((name, i) => User.create({
    name, email: `student${i+1}@test.in`, phone: `905555${String(i+1).padStart(4,'0')}`,
    password, role: 'student', isVerified: true, isActive: true,
    packageTier: 'free', isAffiliate: false, commissionRate: 0,
    affiliateCode: affCode(),
    wallet: 0, totalEarnings: 0, totalWithdrawn: 0,
    xpPoints: rnd(0, 300), level: 1, badges: [],
    streak: rnd(0, 5), loginCount: rnd(1, 15),
    referredBy: starterPartners[i % 8]._id, upline1: starterPartners[i % 8]._id,
    kyc: { status: 'pending' },
  })));

  // ── Demo student (easy login)
  const demoStudent = await User.create({
    name: 'Demo Student', email: 'demo@peptly.in', phone: '9999999999',
    password, role: 'student', isVerified: true, isActive: true,
    packageTier: 'elite', isAffiliate: true, commissionRate: 22,
    affiliateCode: 'TLDEMO',
    wallet: 8500, totalEarnings: 32000, totalWithdrawn: 23500,
    xpPoints: 2800, level: 4, badges: ['early-adopter', 'elite-partner'],
    streak: 7, loginCount: 45,
    referredBy: supremePartners[0]._id, upline1: supremePartners[0]._id, upline2: superadmin._id,
    sponsorCode: supremePartners[0].affiliateCode,
    managerName: 'Rajesh Kumar', managerPhone: '9000000002',
    packagePurchasedAt: pastDate(45), packageExpiresAt: futureDate(320),
    kyc: { status: 'verified', pan: 'ABCPD1234F', panName: 'Demo Student', panVerified: true, aadhar: '111122223333', aadharName: 'Demo Student', aadharVerified: true, bankAccount: '55556666777', bankIfsc: 'ICIC0001234', bankName: 'ICICI', bankHolderName: 'Demo Student', verifiedAt: pastDate(15) },
  });

  console.log(`  ✓ Users: 1 superadmin, 1 admin, 3 mentors, 5 supreme, 8 elite, 10 pro, 8 starter, 10 free, 1 demo`);
  return { superadmin, admin, mentors, supremePartners, elitePartners, proPartners, starterPartners, freeStudents, demoStudent };
}

// ── Seed Courses ───────────────────────────────────────────────────────────────

async function seedCourses(Course: any, mentors: any[]) {
  await Course.deleteMany({});

  const coursesData = [
    {
      title: 'Digital Marketing Masterclass 2024',
      shortDescription: 'Complete guide to digital marketing from basics to advanced strategies.',
      description: 'Master SEO, Social Media, Google Ads, Content Marketing, Email Marketing, and Analytics in this comprehensive course. Learn how to generate leads, grow businesses and build your online presence from scratch.',
      category: 'Digital Marketing', level: 'beginner', price: 2999, discountPrice: 1499,
      tags: ['SEO', 'Social Media', 'Google Ads', 'Content Marketing'],
      outcomes: ['Run profitable Google Ads campaigns', 'Grow social media organically', 'Build complete marketing funnels', 'Understand analytics & metrics'],
      requirements: ['Basic computer skills', 'Smartphone or laptop', 'Willingness to learn'],
      modules: [
        { title: 'Introduction to Digital Marketing', order: 1, lessons: [
          { title: 'What is Digital Marketing?', type: 'video', duration: 15, order: 1, isPreview: true },
          { title: 'Marketing Channels Overview', type: 'video', duration: 20, order: 2, isPreview: true },
          { title: 'Module Quiz', type: 'quiz', duration: 10, order: 3, isPreview: false },
        ]},
        { title: 'SEO Fundamentals', order: 2, lessons: [
          { title: 'On-Page SEO Techniques', type: 'video', duration: 35, order: 1, isPreview: false },
          { title: 'Keyword Research with Free Tools', type: 'video', duration: 28, order: 2, isPreview: false },
          { title: 'Technical SEO Checklist', type: 'document', duration: 15, order: 3, isPreview: false },
        ]},
        { title: 'Social Media Marketing', order: 3, lessons: [
          { title: 'Instagram Growth Strategy', type: 'video', duration: 40, order: 1, isPreview: false },
          { title: 'Facebook Ads Step by Step', type: 'video', duration: 45, order: 2, isPreview: false },
        ]},
        { title: 'Google Ads & PPC', order: 4, lessons: [
          { title: 'Google Ads Account Setup', type: 'video', duration: 30, order: 1, isPreview: false },
          { title: 'Campaign Optimization', type: 'video', duration: 35, order: 2, isPreview: false },
          { title: 'Final Assessment', type: 'quiz', duration: 15, order: 3, isPreview: false },
        ]},
      ],
    },
    {
      title: 'Affiliate Marketing & Passive Income',
      shortDescription: 'Build a sustainable passive income stream through affiliate marketing.',
      description: 'Learn how to choose the right niches, build affiliate websites, drive traffic, and earn consistent passive income. Covers Amazon Associates, Commission Junction, and Indian affiliate platforms.',
      category: 'Affiliate Marketing', level: 'beginner', price: 1999, discountPrice: 999,
      tags: ['Affiliate Marketing', 'Passive Income', 'Blogging', 'YouTube'],
      outcomes: ['Build a profitable affiliate website', 'Earn ₹50,000+ per month passively', 'Master content strategy for affiliates'],
      requirements: ['Internet connection', 'Basic English reading skills'],
      modules: [
        { title: 'Affiliate Marketing Basics', order: 1, lessons: [
          { title: 'How Affiliate Marketing Works', type: 'video', duration: 18, order: 1, isPreview: true },
          { title: 'Choosing Your Niche', type: 'video', duration: 22, order: 2, isPreview: false },
        ]},
        { title: 'Building Your Platform', order: 2, lessons: [
          { title: 'Creating a Blog with WordPress', type: 'video', duration: 45, order: 1, isPreview: false },
          { title: 'YouTube Channel for Affiliates', type: 'video', duration: 38, order: 2, isPreview: false },
        ]},
        { title: 'Traffic & Conversion', order: 3, lessons: [
          { title: 'Free Traffic Strategies', type: 'video', duration: 32, order: 1, isPreview: false },
          { title: 'Email List Building', type: 'video', duration: 28, order: 2, isPreview: false },
          { title: 'Conversion Optimization', type: 'video', duration: 25, order: 3, isPreview: false },
        ]},
      ],
    },
    {
      title: 'Facebook & Instagram Ads Pro',
      shortDescription: 'Run high-converting Meta Ads and scale to 6 figures.',
      description: 'From account setup to advanced retargeting campaigns, this course teaches you everything about running profitable Facebook and Instagram advertising campaigns for any business.',
      category: 'Social Media', level: 'intermediate', price: 3999, discountPrice: 1999,
      tags: ['Facebook Ads', 'Instagram Ads', 'Meta', 'Retargeting'],
      outcomes: ['Create converting Meta ad campaigns', 'Set up pixel tracking correctly', 'Scale winning ads profitably'],
      requirements: ['Basic Facebook account', 'Ad budget of ₹3000+ to practice'],
      modules: [
        { title: 'Meta Ads Foundation', order: 1, lessons: [
          { title: 'Business Manager Setup', type: 'video', duration: 20, order: 1, isPreview: true },
          { title: 'Pixel Installation & Events', type: 'video', duration: 30, order: 2, isPreview: false },
        ]},
        { title: 'Campaign Creation', order: 2, lessons: [
          { title: 'Audience Research & Targeting', type: 'video', duration: 35, order: 1, isPreview: false },
          { title: 'Ad Creative Best Practices', type: 'video', duration: 28, order: 2, isPreview: false },
          { title: 'Campaign Structure', type: 'video', duration: 25, order: 3, isPreview: false },
        ]},
        { title: 'Scaling & Optimization', order: 3, lessons: [
          { title: 'Reading Ads Manager Data', type: 'video', duration: 30, order: 1, isPreview: false },
          { title: 'Horizontal & Vertical Scaling', type: 'video', duration: 38, order: 2, isPreview: false },
          { title: 'Advanced Retargeting', type: 'video', duration: 32, order: 3, isPreview: false },
        ]},
      ],
    },
    {
      title: 'YouTube Mastery: 0 to 1 Lakh Subscribers',
      shortDescription: 'Build a thriving YouTube channel and monetize your content.',
      description: 'Step-by-step blueprint to start, grow, and monetize a YouTube channel. Learn video production, SEO, thumbnail design, and multiple revenue streams from YouTube.',
      category: 'Content Creation', level: 'beginner', price: 2499,
      tags: ['YouTube', 'Content Creation', 'Video Editing', 'Monetization'],
      outcomes: ['Start a YouTube channel from scratch', 'Reach 1K subscribers & get monetized', 'Earn through ads, sponsorships, affiliates'],
      requirements: ['Smartphone with camera', 'Any free editing app'],
      modules: [
        { title: 'Getting Started on YouTube', order: 1, lessons: [
          { title: 'Channel Setup & Branding', type: 'video', duration: 25, order: 1, isPreview: true },
          { title: 'Finding Your Niche', type: 'video', duration: 20, order: 2, isPreview: true },
        ]},
        { title: 'Video Production', order: 2, lessons: [
          { title: 'Shooting with Your Smartphone', type: 'video', duration: 35, order: 1, isPreview: false },
          { title: 'Free Editing Tools Tutorial', type: 'video', duration: 40, order: 2, isPreview: false },
          { title: 'Thumbnail Design', type: 'video', duration: 25, order: 3, isPreview: false },
        ]},
        { title: 'Growth & Monetization', order: 3, lessons: [
          { title: 'YouTube SEO & Tags', type: 'video', duration: 30, order: 1, isPreview: false },
          { title: 'Community Building', type: 'video', duration: 22, order: 2, isPreview: false },
          { title: 'Multiple Revenue Streams', type: 'video', duration: 35, order: 3, isPreview: false },
        ]},
      ],
    },
    {
      title: 'E-Commerce with Meesho & Amazon',
      shortDescription: 'Start selling on Meesho and Amazon without investment.',
      description: 'Learn to start and scale an online selling business on Meesho, Amazon, and Flipkart with zero or minimal investment. Covers product sourcing, listing optimization, and scaling strategies.',
      category: 'E-Commerce', level: 'beginner', price: 1499,
      tags: ['Meesho', 'Amazon', 'Flipkart', 'Online Business', 'Reselling'],
      outcomes: ['Start selling on Meesho with no investment', 'Optimize Amazon listings', 'Scale to ₹1L+ monthly revenue'],
      requirements: ['Smartphone', 'Bank account', 'Aadhaar & PAN'],
      modules: [
        { title: 'Reselling Basics', order: 1, lessons: [
          { title: 'How Reselling Works in India', type: 'video', duration: 20, order: 1, isPreview: true },
          { title: 'Meesho App Setup', type: 'video', duration: 18, order: 2, isPreview: false },
        ]},
        { title: 'Amazon & Flipkart Selling', order: 2, lessons: [
          { title: 'Amazon Seller Account Setup', type: 'video', duration: 30, order: 1, isPreview: false },
          { title: 'Product Listing Optimization', type: 'video', duration: 28, order: 2, isPreview: false },
          { title: 'Pricing & Profit Calculation', type: 'video', duration: 20, order: 3, isPreview: false },
        ]},
        { title: 'Scaling Your Business', order: 3, lessons: [
          { title: 'Running Coupons & Deals', type: 'video', duration: 22, order: 1, isPreview: false },
          { title: 'Customer Reviews Strategy', type: 'video', duration: 18, order: 2, isPreview: false },
        ]},
      ],
    },
    {
      title: 'Network Marketing Success Blueprint',
      shortDescription: 'Build a strong network and earn with ethical MLM strategies.',
      description: 'Master the art of network marketing with ethical, sustainable strategies. Learn how to build a downline, present the business plan, handle objections, and create duplication in your team.',
      category: 'Network Marketing', level: 'beginner', price: 3499, discountPrice: 1799,
      tags: ['Network Marketing', 'MLM', 'Team Building', 'Leadership'],
      outcomes: ['Build a team of 50+ active members', 'Handle objections like a pro', 'Create duplication in your network'],
      requirements: ['Willingness to talk to people', 'Basic communication skills'],
      modules: [
        { title: 'Network Marketing Fundamentals', order: 1, lessons: [
          { title: 'The MLM Business Model Explained', type: 'video', duration: 25, order: 1, isPreview: true },
          { title: 'Why 95% Fail & How to Be in 5%', type: 'video', duration: 30, order: 2, isPreview: true },
        ]},
        { title: 'Prospecting & Invitation', order: 2, lessons: [
          { title: 'Building Your Contact List', type: 'video', duration: 28, order: 1, isPreview: false },
          { title: 'The Perfect Invitation Script', type: 'video', duration: 32, order: 2, isPreview: false },
          { title: 'Online Prospecting via Social Media', type: 'video', duration: 35, order: 3, isPreview: false },
        ]},
        { title: 'Presentation & Closing', order: 3, lessons: [
          { title: 'Business Plan Presentation', type: 'video', duration: 40, order: 1, isPreview: false },
          { title: 'Handling Objections', type: 'video', duration: 38, order: 2, isPreview: false },
          { title: 'Closing & Follow-up', type: 'video', duration: 30, order: 3, isPreview: false },
        ]},
        { title: 'Team Building & Leadership', order: 4, lessons: [
          { title: 'Creating Duplication', type: 'video', duration: 35, order: 1, isPreview: false },
          { title: 'Training Your Downline', type: 'video', duration: 30, order: 2, isPreview: false },
        ]},
      ],
    },
    {
      title: 'Personal Finance & Investment Basics',
      shortDescription: 'Take control of your money and start building wealth today.',
      description: 'From budgeting to mutual funds, SIPs, and stock market basics — this course teaches you how to manage your personal finances, eliminate debt, and build long-term wealth.',
      category: 'Finance', level: 'beginner', price: 1999, discountPrice: 799,
      tags: ['Personal Finance', 'Investment', 'Mutual Funds', 'Stock Market', 'SIP'],
      outcomes: ['Create a monthly budget', 'Start investing in SIP', 'Understand mutual funds & stocks'],
      requirements: ['PAN Card', 'Basic math skills'],
      modules: [
        { title: 'Financial Foundation', order: 1, lessons: [
          { title: 'Why Personal Finance Matters', type: 'video', duration: 15, order: 1, isPreview: true },
          { title: 'Budgeting 50/30/20 Rule', type: 'video', duration: 22, order: 2, isPreview: false },
        ]},
        { title: 'Saving & Investing', order: 2, lessons: [
          { title: 'Types of Investments in India', type: 'video', duration: 28, order: 1, isPreview: false },
          { title: 'How to Start SIP in 10 Minutes', type: 'video', duration: 25, order: 2, isPreview: false },
          { title: 'Stock Market for Beginners', type: 'video', duration: 35, order: 3, isPreview: false },
        ]},
      ],
    },
    {
      title: 'Public Speaking & Personality Development',
      shortDescription: 'Build unshakeable confidence and become a powerful communicator.',
      description: 'Overcome stage fear, develop powerful communication skills, improve body language, and build a magnetic personality. Perfect for students, professionals, and network marketers.',
      category: 'Soft Skills', level: 'beginner', price: 2999, discountPrice: 1299,
      tags: ['Public Speaking', 'Communication', 'Personality', 'Leadership', 'Confidence'],
      outcomes: ['Speak confidently in front of 1000+ people', 'Master body language', 'Build commanding presence'],
      requirements: ['Desire to improve communication'],
      modules: [
        { title: 'Building Confidence', order: 1, lessons: [
          { title: 'Overcoming Stage Fear', type: 'video', duration: 25, order: 1, isPreview: true },
          { title: 'Power Posing & Body Language', type: 'video', duration: 30, order: 2, isPreview: false },
        ]},
        { title: 'Communication Mastery', order: 2, lessons: [
          { title: 'Storytelling Techniques', type: 'video', duration: 35, order: 1, isPreview: false },
          { title: 'Voice Modulation & Delivery', type: 'video', duration: 28, order: 2, isPreview: false },
          { title: 'Handling Q&A Confidently', type: 'video', duration: 22, order: 3, isPreview: false },
        ]},
      ],
    },
    {
      title: 'WhatsApp Business & Lead Generation',
      shortDescription: 'Turn WhatsApp into a lead generation and sales machine.',
      description: 'Complete guide to using WhatsApp Business API, broadcast lists, status marketing, and building automated lead funnels. Perfect for small businesses and network marketers.',
      category: 'Digital Marketing', level: 'beginner', price: 999,
      tags: ['WhatsApp', 'Lead Generation', 'WhatsApp Business', 'Sales'],
      outcomes: ['Set up WhatsApp Business professionally', 'Generate 50+ leads/day from WhatsApp', 'Build broadcast lists of 10,000+'],
      requirements: ['WhatsApp account', 'Smartphone'],
      modules: [
        { title: 'WhatsApp Business Setup', order: 1, lessons: [
          { title: 'WhatsApp Business vs Regular', type: 'video', duration: 15, order: 1, isPreview: true },
          { title: 'Profile & Catalog Setup', type: 'video', duration: 20, order: 2, isPreview: false },
        ]},
        { title: 'Lead Generation', order: 2, lessons: [
          { title: 'WhatsApp Status Marketing', type: 'video', duration: 25, order: 1, isPreview: false },
          { title: 'Broadcast Strategy', type: 'video', duration: 28, order: 2, isPreview: false },
          { title: 'WhatsApp Group Management', type: 'video', duration: 22, order: 3, isPreview: false },
        ]},
      ],
    },
    {
      title: 'Advanced Sales Psychology',
      shortDescription: 'Master the psychology behind buying decisions and close more sales.',
      description: 'Deep dive into sales psychology — understanding buyer behavior, emotional triggers, FOMO, anchoring, social proof, and closing techniques that top earners use to convert prospects at 40%+ rates.',
      category: 'Sales', level: 'advanced', price: 4999, discountPrice: 2499,
      tags: ['Sales', 'Psychology', 'Closing', 'NLP', 'Persuasion'],
      outcomes: ['Close 40%+ of your prospects', 'Understand buying psychology deeply', 'Handle any objection confidently'],
      requirements: ['Basic sales experience recommended', 'Open mindset'],
      modules: [
        { title: 'Sales Psychology Fundamentals', order: 1, lessons: [
          { title: 'Why People Buy', type: 'video', duration: 30, order: 1, isPreview: true },
          { title: 'The 7 Psychological Triggers', type: 'video', duration: 35, order: 2, isPreview: false },
        ]},
        { title: 'Advanced Closing', order: 2, lessons: [
          { title: 'Assumptive Close Technique', type: 'video', duration: 28, order: 1, isPreview: false },
          { title: 'Creating Urgency Without Lying', type: 'video', duration: 30, order: 2, isPreview: false },
          { title: 'The Follow-Up Formula', type: 'video', duration: 25, order: 3, isPreview: false },
        ]},
        { title: 'NLP in Sales', order: 3, lessons: [
          { title: 'Rapport Building & Mirroring', type: 'video', duration: 32, order: 1, isPreview: false },
          { title: 'Anchoring for Sales', type: 'video', duration: 28, order: 2, isPreview: false },
        ]},
      ],
    },
  ];

  const courses = [];
  for (let i = 0; i < coursesData.length; i++) {
    const c = coursesData[i];
    const mentor = mentors[i % mentors.length];
    const lessonsCount = c.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0);
    const course = await Course.create({
      ...c,
      slug: slug(c.title),
      mentor: mentor._id,
      language: 'Hindi/English',
      status: 'published',
      enrolledCount: rnd(80, 1200),
      rating: (rnd(40, 50) / 10),
      ratingCount: rnd(15, 200),
      certificate: true,
      passingScore: 70,
      lessonsCount,
      thumbnail: `https://picsum.photos/seed/${slug(c.title)}/800/450`,
    });
    courses.push(course);
  }
  console.log(`  ✓ Courses (${courses.length})`);
  return courses;
}

// ── Seed Enrollments ───────────────────────────────────────────────────────────

async function seedEnrollments(Enrollment: any, users: any, courses: any[]) {
  await Enrollment.deleteMany({});
  const allPaidUsers = [...users.supremePartners, ...users.elitePartners, ...users.proPartners, ...users.starterPartners];
  const enrollments = [];
  const seen = new Set<string>();

  for (const user of allPaidUsers) {
    const numCourses = rnd(2, 5);
    const shuffled = [...courses].sort(() => Math.random() - 0.5).slice(0, numCourses);
    for (const course of shuffled) {
      const key = `${user._id}_${course._id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const progress = rnd(0, 100);
      enrollments.push({
        student: user._id,
        course: course._id,
        amount: 0,
        paymentId: `pkg_${user.packageTier}`,
        progress: [],
        progressPercent: progress,
        completedAt: progress === 100 ? pastDate(rnd(1, 30)) : undefined,
        createdAt: pastDate(rnd(1, 60)),
      });
    }
  }
  // Demo student gets 4 specific courses
  for (let i = 0; i < 4; i++) {
    const key = `${users.demoStudent._id}_${courses[i]._id}`;
    if (!seen.has(key)) {
      seen.add(key);
      enrollments.push({
        student: users.demoStudent._id,
        course: courses[i]._id,
        amount: 0,
        paymentId: 'pkg_elite',
        progress: [],
        progressPercent: [75, 45, 20, 0][i],
        createdAt: pastDate(rnd(5, 40)),
      });
    }
  }

  await Enrollment.insertMany(enrollments);
  console.log(`  ✓ Enrollments (~${enrollments.length})`);
}

// ── Seed Package Purchases & Commissions ───────────────────────────────────────

async function seedPurchasesAndCommissions(PackagePurchase: any, Commission: any, Package: any, users: any) {
  await PackagePurchase.deleteMany({});
  await Commission.deleteMany({});

  // get package IDs
  const packages = await Package.find({});
  const packageIdByTier: Record<string, any> = {};
  packages.forEach((p: any) => { packageIdByTier[p.tier] = p._id; });

  const tierPrices: Record<string, number> = { starter: 4999, pro: 9999, elite: 19999, supreme: 29999 };
  const paidUsers = [...users.supremePartners, ...users.elitePartners, ...users.proPartners, ...users.starterPartners, users.demoStudent, ...users.freeStudents.slice(0, 5)];

  const purchases = [];
  const commissions = [];

  for (const buyer of paidUsers) {
    if (buyer.packageTier === 'free') continue;
    const saleAmount = tierPrices[buyer.packageTier] || 4999;
    const purchasedAt = pastDate(rnd(5, 180));
    const pp = {
      _id: new mongoose.Types.ObjectId(),
      user: buyer._id,
      package: packageIdByTier[buyer.packageTier],
      packageTier: buyer.packageTier,
      amount: saleAmount,
      gstAmount: Math.floor(saleAmount * 0.18),
      totalAmount: Math.floor(saleAmount * 1.18),
      currency: 'INR',
      paymentMethod: 'razorpay',
      razorpayPaymentId: `pay_demo_${buyer._id.toString().slice(-8)}`,
      razorpayOrderId: `order_demo_${buyer._id.toString().slice(-8)}`,
      status: 'paid',
      isEmi: false,
      createdAt: purchasedAt,
    };
    purchases.push(pp);

    // L1 commission
    if (buyer.upline1) {
      const upline1 = [...users.supremePartners, ...users.elitePartners, ...users.proPartners, ...users.starterPartners, users.superadmin, users.demoStudent].find((u: any) => u._id.toString() === buyer.upline1?.toString());
      if (upline1 && upline1.isAffiliate) {
        const l1Rate = upline1.commissionRate || 10;
        const l1Amt = Math.floor(saleAmount * l1Rate / 100);
        commissions.push({
          earner: upline1._id, earnerTier: upline1.packageTier, earnerCommissionRate: l1Rate,
          buyer: buyer._id, buyerPackageTier: buyer.packageTier,
          level: 1, levelRate: l1Rate, saleAmount, commissionAmount: l1Amt,
          packagePurchaseId: pp._id, status: 'approved', createdAt: purchasedAt,
        });

        // L2
        if (buyer.upline2) {
          const upline2 = [...users.supremePartners, ...users.elitePartners, users.superadmin].find((u: any) => u._id.toString() === buyer.upline2?.toString());
          if (upline2 && upline2.isAffiliate) {
            const l2Amt = Math.floor(saleAmount * 5 / 100);
            commissions.push({
              earner: upline2._id, earnerTier: upline2.packageTier, earnerCommissionRate: upline2.commissionRate,
              buyer: buyer._id, buyerPackageTier: buyer.packageTier,
              level: 2, levelRate: 5, saleAmount, commissionAmount: l2Amt,
              packagePurchaseId: pp._id, status: 'approved', createdAt: purchasedAt,
            });
          }
        }

        // L3
        if (buyer.upline3) {
          const upline3 = [...users.supremePartners, users.superadmin].find((u: any) => u._id.toString() === buyer.upline3?.toString());
          if (upline3 && upline3.isAffiliate) {
            const l3Amt = Math.floor(saleAmount * 2 / 100);
            commissions.push({
              earner: upline3._id, earnerTier: upline3.packageTier, earnerCommissionRate: upline3.commissionRate,
              buyer: buyer._id, buyerPackageTier: buyer.packageTier,
              level: 3, levelRate: 2, saleAmount, commissionAmount: l3Amt,
              packagePurchaseId: pp._id, status: 'approved', createdAt: purchasedAt,
            });
          }
        }
      }
    }
  }

  if (purchases.length) await PackagePurchase.insertMany(purchases);
  if (commissions.length) await Commission.insertMany(commissions);
  console.log(`  ✓ Package Purchases (${purchases.length}), Commissions (${commissions.length})`);
}

// ── Seed Live Classes ──────────────────────────────────────────────────────────

async function seedLiveClasses(LiveClass: any, courses: any[], mentors: any[]) {
  await LiveClass.deleteMany({});

  const classes = [
    { title: 'Live: Advanced Facebook Ads Strategies', daysFromNow: 1, duration: 90 },
    { title: 'Live: How to Close ₹30K Deals Easily', daysFromNow: 2, duration: 60 },
    { title: 'Live: Network Marketing Success Stories & Q&A', daysFromNow: 4, duration: 120 },
    { title: 'Live: YouTube Algorithm Decoded 2024', daysFromNow: 7, duration: 90 },
    { title: 'Live: Building Your First Affiliate Website', daysFromNow: 10, duration: 60 },
    { title: 'Live: SEO Workshop — Rank #1 in Google', daysFromNow: 14, duration: 90 },
    { title: 'Live: Partner Monthly Kickoff — April 2024', daysFromNow: 3, duration: 180 },
    { title: 'Recording: Meta Ads Complete Guide', daysFromNow: -5, duration: 90 },
    { title: 'Recording: How I Made ₹5 Lakh in 90 Days', daysFromNow: -10, duration: 60 },
    { title: 'Recording: Digital Marketing Basics for Beginners', daysFromNow: -15, duration: 75 },
  ];

  await LiveClass.insertMany(classes.map((c, i) => ({
    title: c.title,
    description: `Join us for this live session and learn from experts. Interactive Q&A at the end.`,
    course: courses[i % courses.length]._id,
    mentor: mentors[i % mentors.length]._id,
    scheduledAt: c.daysFromNow > 0 ? futureDate(c.daysFromNow) : pastDate(-c.daysFromNow),
    duration: c.duration,
    platform: 'zoom',
    zoomJoinUrl: 'https://zoom.us/j/demo123456',
    zoomPassword: 'peptly',
    status: c.daysFromNow > 0 ? 'scheduled' : 'ended',
    chatEnabled: true,
    attendees: c.daysFromNow < 0 ? Array.from({ length: rnd(50, 300) }).map(() => ({ user: new mongoose.Types.ObjectId(), joinedAt: new Date() })) : [],
  })));
  console.log(`  ✓ Live Classes (${classes.length})`);
}

// ── Seed Blog Posts ────────────────────────────────────────────────────────────

async function seedBlog(Blog: any, admin: any) {
  await Blog.deleteMany({});

  const posts = [
    {
      title: '10 Digital Marketing Trends That Will Dominate 2024',
      excerpt: 'From AI-powered content to short-form video, discover the top trends shaping digital marketing in 2024 and how to leverage them for massive growth.',
      category: 'Digital Marketing', tags: ['trends', 'marketing', '2024'],
      readTime: 8, featured: true,
    },
    {
      title: 'How Vikram Made ₹3.2 Lakhs in 3 Months as a TruLearnix Partner',
      excerpt: 'Vikram Singh went from a ₹15,000/month job to earning ₹3.2 lakhs in just 90 days. Here\'s his exact blueprint and mindset shift.',
      category: 'Success Stories', tags: ['success', 'partner', 'motivation'],
      readTime: 6, featured: true,
    },
    {
      title: 'Complete Guide to Affiliate Marketing for Beginners in India',
      excerpt: 'Everything you need to know to start affiliate marketing in India — from choosing platforms to making your first ₹10,000.',
      category: 'Affiliate Marketing', tags: ['affiliate', 'beginners', 'india'],
      readTime: 12, featured: false,
    },
    {
      title: 'WhatsApp Marketing: How to Generate 100 Leads Daily for Free',
      excerpt: 'WhatsApp is India\'s #1 messaging app. Learn how to turn it into a powerful lead generation machine without spending a rupee.',
      category: 'Social Media', tags: ['whatsapp', 'lead generation', 'free'],
      readTime: 7, featured: false,
    },
    {
      title: 'The MLM Truth: Why 95% Fail and the 5% Strategy That Works',
      excerpt: 'The brutal truth about network marketing, and the mindset, systems, and skills that separate the top 5% from everyone else.',
      category: 'Network Marketing', tags: ['mlm', 'network marketing', 'success'],
      readTime: 10, featured: true,
    },
    {
      title: 'How to Build a Personal Brand Online in 30 Days',
      excerpt: 'Step-by-step 30-day action plan to build your personal brand, attract opportunities, and become a recognized expert in your niche.',
      category: 'Personal Branding', tags: ['personal brand', 'social media', 'influence'],
      readTime: 9, featured: false,
    },
    {
      title: 'TruLearnix vs Other Platforms: An Honest Comparison',
      excerpt: 'We compare TruLearnix with leading e-learning platforms on price, content quality, earning potential, and support. The results may surprise you.',
      category: 'Platform', tags: ['comparison', 'edtech', 'review'],
      readTime: 5, featured: false,
    },
  ];

  await Blog.insertMany(posts.map(p => ({
    ...p,
    slug: slug(p.title),
    content: `<h2>Introduction</h2><p>${p.excerpt}</p><h2>The Details</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><h2>Key Takeaways</h2><ul><li>Point one is very important</li><li>Always take action on what you learn</li><li>Consistency beats intensity every time</li><li>Your network is your net worth</li></ul><p>Remember: knowledge without action is useless. Start today, not tomorrow.</p>`,
    author: admin._id,
    status: 'published',
    publishedAt: pastDate(rnd(1, 60)),
    views: rnd(200, 8000),
    thumbnail: `https://picsum.photos/seed/${slug(p.title)}/800/400`,
    aiGenerated: false,
  })));
  console.log(`  ✓ Blog Posts (${posts.length})`);
}

// ── Seed Popups / Announcements ────────────────────────────────────────────────

async function seedPopups(Popup: any, admin: any) {
  await Popup.deleteMany({});

  await Popup.insertMany([
    {
      type: 'announcement', title: '🎉 April Mega Sale — Extra 20% Off All Packages!',
      description: 'Limited time offer! Use code APRIL20 to get an extra 20% discount on Pro, Elite, and Supreme packages. Offer valid till April 30, 2024.',
      ctaText: 'Grab the Offer', ctaLink: '/packages',
      trigger: 'on_load', triggerDelay: 2, triggerScroll: 0,
      showOnce: false, isActive: true, priority: 10,
      startDate: pastDate(5), endDate: futureDate(22), createdBy: admin._id,
    },
    {
      type: 'announcement', title: '📚 5 New Courses Added This Month!',
      description: 'We\'ve added 5 brand new courses covering Advanced Facebook Ads, YouTube Mastery, Sales Psychology, Personal Finance, and WhatsApp Marketing. All included in your package!',
      ctaText: 'Explore Courses', ctaLink: '/student/courses',
      trigger: 'on_load', triggerDelay: 0, triggerScroll: 0,
      showOnce: false, isActive: true, priority: 8,
      startDate: pastDate(3), endDate: futureDate(30), createdBy: admin._id,
    },
    {
      type: 'announcement', title: '🏆 April Leaderboard Challenge — Win ₹50,000!',
      description: 'The top 3 earners this April will win cash prizes: 1st place ₹25,000, 2nd place ₹15,000, 3rd place ₹10,000. Contest ends April 30. Check the leaderboard!',
      ctaText: 'View Leaderboard', ctaLink: '/partner/leaderboard',
      trigger: 'on_load', triggerDelay: 5, triggerScroll: 0,
      showOnce: false, isActive: true, priority: 9,
      startDate: pastDate(1), endDate: futureDate(22), createdBy: admin._id,
    },
    {
      type: 'announcement', title: '⚡ New Feature: M-Type Network Tree is LIVE!',
      description: 'You can now visualize your entire 3-level referral network in a beautiful interactive tree. Go to Partner Panel → M-Type to explore your team!',
      ctaText: 'View My Network', ctaLink: '/partner/m-type',
      trigger: 'on_load', triggerDelay: 0, triggerScroll: 0,
      showOnce: true, isActive: true, priority: 7,
      startDate: pastDate(2), endDate: futureDate(15), createdBy: admin._id,
    },
    {
      type: 'announcement', title: '🎓 Live Webinar: Partner Kickoff — April 2024',
      description: 'Join our monthly partner kickoff on April 11 at 8 PM IST. Special guest: Top earner Vikram Singh will share his exact system. Don\'t miss it!',
      ctaText: 'Register Now', ctaLink: '/partner/training',
      trigger: 'on_load', triggerDelay: 3, triggerScroll: 0,
      showOnce: false, isActive: true, priority: 9,
      startDate: pastDate(2), endDate: futureDate(3), createdBy: admin._id,
    },
    {
      type: 'event', title: '🚀 TruLearnix Annual Convention 2024 — Mumbai',
      description: 'Our biggest event of the year! Network with top earners, attend power sessions, and celebrate your achievements at Hotel Taj, Mumbai on May 15-16, 2024.',
      ctaText: 'Book Your Seat', ctaLink: '/packages',
      trigger: 'on_scroll', triggerDelay: 0, triggerScroll: 50,
      showOnce: true, isActive: true, priority: 6,
      startDate: pastDate(5), endDate: futureDate(40), createdBy: admin._id,
    },
    {
      type: 'announcement', title: '💳 KYC Required for Withdrawal',
      description: 'All partners must complete KYC verification before withdrawing earnings. This is a one-time process that takes less than 5 minutes.',
      ctaText: 'Complete KYC', ctaLink: '/partner/kyc',
      trigger: 'on_load', triggerDelay: 0, triggerScroll: 0,
      showOnce: false, isActive: true, priority: 5,
      createdBy: admin._id,
    },
  ]);
  console.log('  ✓ Popups/Announcements (7)');
}

// ── Seed CRM Leads ─────────────────────────────────────────────────────────────

async function seedLeads(Lead: any, users: any) {
  await Lead.deleteMany({});

  const leadNames = ['Ramesh Yadav', 'Sunita Devi', 'Mukesh Sharma', 'Geeta Singh', 'Vinod Kumar', 'Asha Mishra', 'Rajan Patel', 'Meena Tiwari', 'Suresh Nair', 'Pratima Roy', 'Ajay Shukla', 'Kavita Verma', 'Dinesh Das', 'Sarita Jha', 'Pawan Gupta', 'Neelam Rani'];
  const statuses = ['new', 'contacted', 'interested', 'demo_done', 'paid', 'lost'];
  const sources = ['whatsapp', 'meta_ads', 'referral', 'organic', 'manual'];

  const leads = [];
  const assignedTo = [users.demoStudent, ...users.supremePartners.slice(0, 3), ...users.elitePartners.slice(0, 3)];

  for (let i = 0; i < 16; i++) {
    const user = assignedTo[i % assignedTo.length];
    leads.push({
      name: leadNames[i],
      phone: `98765${String(i + 10001).slice(-5)}`,
      email: `lead${i + 1}@test.in`,
      source: pick(sources),
      stage: pick(statuses),
      assignedTo: user._id,
      aiScore: rnd(20, 95),
      aiScoreLabel: ['cold', 'warm', 'hot'][rnd(0, 2)],
      interestedPackage: pick(['starter', 'pro', 'elite', 'supreme']),
      whatsappSent: rnd(0, 5),
      emailSent: rnd(0, 3),
      webinarInvited: Math.random() > 0.6,
      webinarAttended: Math.random() > 0.7,
      lastContactedAt: pastDate(rnd(0, 14)),
      createdAt: pastDate(rnd(1, 30)),
      notes: Math.random() > 0.5 ? [{ text: 'Interested in Pro package, needs follow-up', by: user._id, createdAt: pastDate(rnd(1, 10)) }] : [],
    });
  }

  await Lead.insertMany(leads);
  console.log(`  ✓ CRM Leads (${leads.length})`);
}

// ── Seed Community Posts ───────────────────────────────────────────────────────

async function seedCommunity(CommunityPost: any, users: any) {
  await CommunityPost.deleteMany({});

  const allUsers = [...users.supremePartners, ...users.elitePartners, ...users.proPartners, users.demoStudent];
  const postData = [
    { content: '🎉 Just hit my first ₹50,000 in commissions this month! Started 3 months ago with zero network marketing experience. If I can do it, YOU can too! Happy to share my exact strategy. Drop your questions below! 👇', likes: 47 },
    { content: 'Tip for beginners: Don\'t chase everyone. Focus on people who are already LOOKING for an opportunity. Your local Facebook groups, LinkedIn, and YouTube comments section are goldmines. 💎', likes: 34 },
    { content: 'Just completed the Advanced Facebook Ads course. Mind-blowing content! Already implemented 2 strategies and my cost-per-lead dropped from ₹180 to ₹45. 🚀 Thank you TruLearnix!', likes: 28 },
    { content: 'Daily discipline beats occasional bursts of motivation. I prospect 10 people every single day, no excuses. At the end of the month, that\'s 300 conversations. Numbers game, friends! 📊', likes: 52 },
    { content: 'New personal record! Closed 4 Supreme packages in a single day = ₹35,880 commissions in 24 hours! 🏆 Attending the live closing webinar tomorrow night — who else is joining?', likes: 89 },
    { content: 'Reminder: Complete your KYC guys! I saw someone miss a ₹15,000 withdrawal because their KYC wasn\'t done. Takes 5 minutes. Just do it now. Go to Partner Panel → KYC ✅', likes: 21 },
    { content: 'Monthly check-in: How is everyone\'s April going? Drop your wins below! Let\'s celebrate each other\'s success! My April: 8 new referrals, 3 package upgrades = ₹28,500 earned! 💪', likes: 43 },
    { content: 'Pro tip: Use the M-Type tree feature to track which of your L2 members need activation. I found 3 people who hadn\'t logged in for 2 weeks, sent them a WhatsApp message, and got 2 of them to upgrade their package! 🔥', likes: 36 },
  ];

  await CommunityPost.insertMany(postData.map((p, i) => ({
    author: allUsers[i % allUsers.length]._id,
    content: p.content,
    type: 'post',
    likes: [],
    comments: [],
    tags: [],
    views: p.likes,
    isPinned: false,
    isApproved: true,
    createdAt: pastDate(rnd(0, 14)),
  })));
  console.log(`  ✓ Community Posts (${postData.length})`);
}

// ── Seed Quizzes ───────────────────────────────────────────────────────────────

async function seedQuizzes(Quiz: any, courses: any[], mentors: any[]) {
  await Quiz.deleteMany({});

  const quizData = [
    {
      title: 'Digital Marketing Fundamentals Quiz',
      questions: [
        { question: 'What does SEO stand for?', options: ['Search Engine Optimization', 'Social Engine Outreach', 'Search Email Outbound', 'Social Email Optimization'], correctOption: 0, explanation: 'SEO stands for Search Engine Optimization.', marks: 1 },
        { question: 'Which platform has the highest daily active users in India?', options: ['Facebook', 'WhatsApp', 'Instagram', 'YouTube'], correctOption: 1, explanation: 'WhatsApp has 500M+ daily active users in India.', marks: 1 },
        { question: 'What is a good CTR for Google Ads?', options: ['0.1-0.5%', '1-2%', '5-10%', '15-20%'], correctOption: 1, explanation: 'A CTR of 1-2% is average; above 3% is excellent.', marks: 1 },
        { question: 'What does CPC stand for?', options: ['Cost Per Campaign', 'Click Per Conversion', 'Cost Per Click', 'Campaign Performance Criteria'], correctOption: 2, explanation: 'CPC = Cost Per Click.', marks: 1 },
        { question: 'Which of these is NOT a social media platform?', options: ['TikTok', 'Clubhouse', 'Shopify', 'Snapchat'], correctOption: 2, explanation: 'Shopify is an e-commerce platform.', marks: 1 },
      ],
    },
    {
      title: 'Network Marketing IQ Test',
      questions: [
        { question: 'What is the most important trait of a successful network marketer?', options: ['Large social media following', 'Consistency and follow-up', 'Speaking English fluently', 'Sales experience'], correctOption: 1, explanation: '80% of sales happen after the 5th follow-up.', marks: 1 },
        { question: 'What to do after someone says no?', options: ['Remove them from contacts', 'Argue with them', 'Schedule follow-up in 3 months', 'Ignore them'], correctOption: 2, explanation: '"No" means "not now" in network marketing.', marks: 1 },
        { question: 'How many new contacts to add daily?', options: ['0-1', '2-5', '10-20', 'As many as possible'], correctOption: 2, explanation: 'Top performers add 10-20 new contacts daily.', marks: 1 },
        { question: 'What % of income to reinvest in business?', options: ['0%', '5%', '10-20%', '50%+'], correctOption: 2, explanation: 'Reinvesting 10-20% ensures sustainable growth.', marks: 1 },
        { question: 'What is duplication in network marketing?', options: ['Copying competitors', 'Teaching your team your system', 'Running multiple accounts', 'Using same script'], correctOption: 1, explanation: 'Duplication = teaching your team a repeatable system.', marks: 1 },
      ],
    },
  ];

  await Quiz.insertMany(quizData.map((q, i) => ({
    ...q,
    course: courses[i % courses.length]._id,
    mentor: mentors[i % mentors.length]._id,
    duration: 20,
    passingScore: 70,
    totalMarks: q.questions.length,
    attempts: 0,
    isPublished: true,
  })));
  console.log(`  ✓ Quizzes (${quizData.length})`);
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Starting TruLearnix Demo Data Seed...\n');
  await connect();

  const M = await getModels();

  console.log('📦 Seeding Packages...');
  await seedPackages(M.Package);

  console.log('👥 Seeding Users...');
  const users = await seedUsers(M.User);

  console.log('📚 Seeding Courses...');
  const courses = await seedCourses(M.Course, users.mentors);

  console.log('📋 Seeding Enrollments...');
  await seedEnrollments(M.Enrollment, users, courses);

  console.log('💰 Seeding Package Purchases & Commissions...');
  await seedPurchasesAndCommissions(M.PackagePurchase, M.Commission, M.Package, users);

  console.log('🎥 Seeding Live Classes...');
  await seedLiveClasses(M.LiveClass, courses, users.mentors);

  console.log('📝 Seeding Blog Posts...');
  await seedBlog(M.Blog, users.admin);

  console.log('📢 Seeding Popups & Announcements...');
  await seedPopups(M.Popup, users.admin);

  console.log('🎯 Seeding CRM Leads...');
  await seedLeads(M.Lead, users);

  console.log('💬 Seeding Community Posts...');
  await seedCommunity(M.CommunityPost, users);

  console.log('🧪 Seeding Quizzes...');
  await seedQuizzes(M.Quiz, courses, users.mentors);

  console.log('\n✅ All done! Demo data seeded successfully.\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('  LOGIN CREDENTIALS (password: Demo@1234)');
  console.log('───────────────────────────────────────────────────');
  console.log('  Superadmin : superadmin@peptly.in');
  console.log('  Admin      : admin@peptly.in');
  console.log('  Mentor 1   : mentor1@peptly.in');
  console.log('  Demo User  : demo@peptly.in  (Elite Partner)');
  console.log('  Student 1  : student1@test.in (Free)');
  console.log('  Starter 1  : starter1@test.in');
  console.log('  Pro 1      : pro1@test.in');
  console.log('  Elite 1    : elite1@test.in');
  console.log('  Supreme 1  : vikram@test.in');
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

main().catch(e => { console.error('❌ Seed error:', e); process.exit(1); });
