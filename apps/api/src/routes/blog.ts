import { Router } from 'express';
import Blog from '../models/Blog';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Public
router.get('/', async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 10 } = req.query;
    const filter: any = { status: 'published' };
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    const skip = (Number(page) - 1) * Number(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(filter).populate('author', 'name avatar').sort('-publishedAt').skip(skip).limit(Number(limit)),
      Blog.countDocuments(filter),
    ]);
    res.json({ success: true, blogs, total });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate({ slug: req.params.slug, status: 'published' }, { $inc: { views: 1 } }, { new: true }).populate('author', 'name avatar');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, blog });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// Protected — admin
router.use(protect, authorize('superadmin', 'admin'));

router.get('/admin/all', async (req, res) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    const blogs = await Blog.find(filter).populate('author', 'name').sort('-createdAt');
    res.json({ success: true, blogs });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req: any, res) => {
  try {
    const { title, content, excerpt, category, tags, thumbnail, status, seoTitle, seoDescription, seoKeywords, featured } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const readTime = Math.ceil(content.split(' ').length / 200);
    const blog = await Blog.create({ title, slug, content, excerpt, category, tags, thumbnail, status, seoTitle, seoDescription, seoKeywords, featured, author: req.user._id, readTime, publishedAt: status === 'published' ? new Date() : undefined });
    res.status(201).json({ success: true, blog });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id', async (req: any, res) => {
  try {
    const update = { ...req.body };
    if (update.status === 'published' && !update.publishedAt) update.publishedAt = new Date();
    const blog = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, blog });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted' });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
