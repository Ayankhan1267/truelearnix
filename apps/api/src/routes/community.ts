import { Router } from 'express';
import CommunityPost from '../models/CommunityPost';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/posts', protect, async (req: any, res) => {
  try {
    const { group, type, page = 1, limit = 20 } = req.query;
    const filter: any = { isApproved: true };
    if (group) filter.group = group;
    if (type) filter.type = type;
    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      CommunityPost.find(filter).populate('author', 'name avatar packageTier xpPoints level').populate('comments.author', 'name avatar').sort('-isPinned -createdAt').skip(skip).limit(Number(limit)),
      CommunityPost.countDocuments(filter),
    ]);
    res.json({ success: true, posts, total });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/posts', protect, async (req: any, res) => {
  try {
    const { content, type, group, tags, images } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' });
    const post = await CommunityPost.create({ author: req.user._id, content, type: type || 'post', group, tags, images });
    // XP for posting
    await User.findByIdAndUpdate(req.user._id, { $inc: { xpPoints: 20 } });
    await post.populate('author', 'name avatar packageTier xpPoints level');
    res.status(201).json({ success: true, post });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/posts/:id/like', protect, async (req: any, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const liked = post.likes.some(l => l.toString() === req.user._id.toString());
    if (liked) post.likes = post.likes.filter(l => l.toString() !== req.user._id.toString());
    else { post.likes.push(req.user._id); await User.findByIdAndUpdate(req.user._id, { $inc: { xpPoints: 5 } }); }
    await post.save();
    res.json({ success: true, liked: !liked, count: post.likes.length });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/posts/:id/comment', protect, async (req: any, res) => {
  try {
    const { content } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.comments.push({ author: req.user._id, content, likes: [], createdAt: new Date() });
    await post.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { xpPoints: 10 } });
    res.json({ success: true, post });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/posts/:id', protect, async (req: any, res) => {
  try {
    const post = await CommunityPost.findOne({ _id: req.params.id, author: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    await post.deleteOne();
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
