/**
 * NOVA — Neural Operations & Virtual Administrator
 * AI agent with platform-aware tool calling (OpenAI gpt-4o-mini)
 */
import OpenAI from 'openai';
import User from '../models/User';
import PackagePurchase from '../models/PackagePurchase';
import Commission from '../models/Commission';
import LiveClass from '../models/LiveClass';
import Task from '../models/Task';
import Lead from '../models/Lead';
import Course from '../models/Course';
import Withdrawal from '../models/Withdrawal';
import SupportTicket from '../models/SupportTicket';
import { sendWhatsAppText, broadcastWhatsApp } from './whatsappMetaService';
import { format } from 'date-fns';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'none' });

const SYSTEM_PROMPT = `You are NOVA — Neural Operations & Virtual Administrator for TruLearnix (peptly.in), an ed-tech platform.

You are a powerful AI co-pilot for the platform founder and admin team. You have access to real-time platform data through tools.

Your personality:
- Confident, concise, data-driven
- Proactive — surface insights, not just raw numbers
- Use emojis sparingly but effectively for readability
- Address the user respectfully; know they are busy

You can:
1. Query live platform data (sales, users, classes, tasks, leads)
2. Generate reports and summaries
3. Send WhatsApp messages to specific people or segments
4. Alert the founder about critical events
5. Give strategic recommendations based on data

Always call tools to get live data before answering data-related questions.
Current date: ${new Date().toDateString()}`;

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_platform_overview',
      description: 'Get today\'s and this month\'s key platform metrics: revenue, new users, classes, pending tasks',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_sales_report',
      description: 'Get sales data for a given period',
      parameters: {
        type: 'object',
        properties: { period: { type: 'string', enum: ['today', 'week', 'month', 'all'] } },
        required: ['period'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_top_performers',
      description: 'Get top affiliates/earners by commission this month',
      parameters: { type: 'object', properties: { limit: { type: 'number' } }, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_tasks_status',
      description: 'Get pending, in-progress, and completed tasks from the kanban board',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_classes',
      description: 'Get live classes scheduled in the next 24 hours',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_crm_pipeline',
      description: 'Get CRM leads summary by status',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pending_support',
      description: 'Get count and details of open support tickets',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_whatsapp_message',
      description: 'Send a WhatsApp message to a specific phone number',
      parameters: {
        type: 'object',
        properties: {
          phone: { type: 'string', description: 'Phone number with country code' },
          message: { type: 'string', description: 'Message text to send' },
        },
        required: ['phone', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'broadcast_whatsapp',
      description: 'Broadcast a WhatsApp message to a group of users',
      parameters: {
        type: 'object',
        properties: {
          segment: { type: 'string', enum: ['all_students', 'purchased', 'free', 'mentors', 'employees', 'leads'] },
          message: { type: 'string' },
        },
        required: ['segment', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_founder_report',
      description: 'Generate a comprehensive daily/weekly summary report for the founder',
      parameters: {
        type: 'object',
        properties: { period: { type: 'string', enum: ['daily', 'weekly'] } },
        required: ['period'],
      },
    },
  },
];

// ── Tool executors ────────────────────────────────────────────────────────────

async function executeTool(name: string, args: any): Promise<string> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (name) {
    case 'get_platform_overview': {
      const [todaySales, monthSales, totalUsers, todayUsers, openTickets, liveclasses] = await Promise.all([
        PackagePurchase.aggregate([{ $match: { status: 'paid', createdAt: { $gte: todayStart } } }, { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
        PackagePurchase.aggregate([{ $match: { status: 'paid', createdAt: { $gte: monthStart } } }, { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'student', createdAt: { $gte: todayStart } }),
        SupportTicket.countDocuments({ status: 'open' }),
        LiveClass.countDocuments({ status: 'live' }),
      ]);
      return JSON.stringify({
        today: { revenue: todaySales[0]?.revenue || 0, sales: todaySales[0]?.count || 0, newUsers: todayUsers },
        thisMonth: { revenue: monthSales[0]?.revenue || 0, sales: monthSales[0]?.count || 0 },
        totalLearners: totalUsers,
        openTickets,
        liveClassesNow: liveclasses,
      });
    }

    case 'get_sales_report': {
      const start = args.period === 'today' ? todayStart : args.period === 'week' ? new Date(now.getTime() - 7 * 86400000) : args.period === 'month' ? monthStart : new Date(0);
      const [sales, byTier] = await Promise.all([
        PackagePurchase.aggregate([{ $match: { status: 'paid', createdAt: { $gte: start } } }, { $group: { _id: null, gross: { $sum: '$totalAmount' }, net: { $sum: '$amount' }, gst: { $sum: '$gstAmount' }, count: { $sum: 1 } } }]),
        PackagePurchase.aggregate([{ $match: { status: 'paid', createdAt: { $gte: start } } }, { $group: { _id: '$packageTier', count: { $sum: 1 }, gross: { $sum: '$totalAmount' } } }, { $sort: { gross: -1 } }]),
      ]);
      return JSON.stringify({ period: args.period, summary: sales[0] || { gross: 0, net: 0, gst: 0, count: 0 }, byTier });
    }

    case 'get_top_performers': {
      const limit = args.limit || 5;
      const data = await Commission.aggregate([
        { $match: { status: { $in: ['paid', 'approved'] }, createdAt: { $gte: monthStart } } },
        { $group: { _id: '$earner', total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }, { $limit: limit },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', email: '$user.email', total: 1, count: 1 } },
      ]);
      return JSON.stringify(data);
    }

    case 'get_tasks_status': {
      const tasks = await Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
      const overdue = await Task.countDocuments({ status: { $nin: ['done'] }, dueDate: { $lt: now } });
      return JSON.stringify({ byStatus: tasks, overdue });
    }

    case 'get_upcoming_classes': {
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const classes = await LiveClass.find({ status: { $in: ['scheduled', 'live'] }, scheduledAt: { $gte: now, $lte: next24h } })
        .populate('mentor', 'name').populate('course', 'title').lean();
      return JSON.stringify(classes.map((c: any) => ({
        title: c.title, mentor: c.mentor?.name, course: c.course?.title,
        scheduledAt: c.scheduledAt, status: c.status, duration: c.duration,
      })));
    }

    case 'get_crm_pipeline': {
      const pipeline = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
      const today = await Lead.countDocuments({ createdAt: { $gte: todayStart } });
      return JSON.stringify({ pipeline, newToday: today });
    }

    case 'get_pending_support': {
      const [open, byPriority] = await Promise.all([
        SupportTicket.find({ status: 'open' }).select('subject priority createdAt').sort('-createdAt').limit(5).lean(),
        SupportTicket.aggregate([{ $match: { status: 'open' } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      ]);
      return JSON.stringify({ openCount: open.length, byPriority, recent: open });
    }

    case 'send_whatsapp_message': {
      const ok = await sendWhatsAppText(args.phone, args.message);
      return JSON.stringify({ success: ok, phone: args.phone });
    }

    case 'broadcast_whatsapp': {
      let phones: string[] = [];
      const segmentMap: Record<string, any> = {
        all_students: { role: 'student', isActive: true },
        purchased: { role: 'student', packageTier: { $nin: ['free'] }, isActive: true },
        free: { role: 'student', $or: [{ packageTier: 'free' }, { packageTier: null }] },
        mentors: { role: 'mentor', isActive: true },
        employees: { role: { $in: ['admin', 'employee', 'manager'] }, isActive: true },
      };
      if (args.segment === 'leads') {
        const leads = await Lead.find({ phone: { $exists: true, $ne: '' } }).select('phone').lean();
        phones = leads.map((l: any) => l.phone).filter(Boolean);
      } else {
        const filter = segmentMap[args.segment] || segmentMap.all_students;
        const users = await User.find({ ...filter, phone: { $exists: true, $ne: '' } }).select('phone').lean();
        phones = users.map((u: any) => u.phone).filter(Boolean);
      }
      const result = await broadcastWhatsApp(phones, args.message);
      return JSON.stringify({ ...result, total: phones.length, segment: args.segment });
    }

    case 'generate_founder_report': {
      const start = args.period === 'weekly' ? new Date(now.getTime() - 7 * 86400000) : todayStart;
      const [sales, newUsers, commissions, classes, tasks] = await Promise.all([
        PackagePurchase.aggregate([{ $match: { status: 'paid', createdAt: { $gte: start } } }, { $group: { _id: null, gross: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
        User.countDocuments({ role: 'student', createdAt: { $gte: start } }),
        Commission.aggregate([{ $match: { createdAt: { $gte: start } } }, { $group: { _id: null, total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } }]),
        LiveClass.countDocuments({ status: 'ended', endedAt: { $gte: start } }),
        Task.aggregate([{ $match: { updatedAt: { $gte: start } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      ]);
      const report = {
        period: args.period,
        generatedAt: format(now, 'dd MMM yyyy, hh:mm a'),
        revenue: { gross: sales[0]?.gross || 0, sales: sales[0]?.count || 0 },
        newLearners: newUsers,
        commissions: { total: commissions[0]?.total || 0, transactions: commissions[0]?.count || 0 },
        classesHeld: classes,
        tasks,
      };
      return JSON.stringify(report);
    }

    default:
      return JSON.stringify({ error: 'Unknown tool' });
  }
}

// ── Main agent function ───────────────────────────────────────────────────────

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function novaChat(userMessage: string, history: ChatMessage[] = []): Promise<string> {
  // Trim history to last 10 messages
  const recentHistory = history.slice(-10);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory,
    { role: 'user', content: userMessage },
  ];

  if (!process.env.OPENAI_API_KEY) {
    // Fallback: rule-based responses
    return await fallbackResponse(userMessage);
  }

  try {
    let response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.7,
    });

    // Agentic loop — handle tool calls
    while (response.choices[0].finish_reason === 'tool_calls') {
      const assistantMsg = response.choices[0].message;
      messages.push(assistantMsg);

      const toolResults: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      for (const toolCall of (assistantMsg.tool_calls || []) as any[]) {
        const args = JSON.parse(toolCall.function?.arguments || '{}');
        const result = await executeTool(toolCall.function?.name, args);
        toolResults.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }
      messages.push(...toolResults);

      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
      });
    }

    return response.choices[0].message.content || 'I processed your request.';
  } catch (e: any) {
    console.error('[NOVA] OpenAI error:', e.message);
    return await fallbackResponse(userMessage);
  }
}

// Fallback when no OpenAI key — still pulls real data
async function fallbackResponse(msg: string): Promise<string> {
  const lower = msg.toLowerCase();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (lower.includes('sale') || lower.includes('revenue') || lower.includes('aaj')) {
    const data = await executeTool('get_sales_report', { period: 'today' });
    const d = JSON.parse(data);
    return `📊 *Today's Sales*\n\nRevenue: ₹${d.summary.gross?.toLocaleString('en-IN') || 0}\nSales: ${d.summary.count || 0} packages sold\n\n${d.byTier.map((t: any) => `• ${t._id}: ${t.count} (₹${t.gross?.toLocaleString('en-IN')})`).join('\n')}`;
  }
  if (lower.includes('overview') || lower.includes('dashboard') || lower.includes('stats')) {
    const data = JSON.parse(await executeTool('get_platform_overview', {}));
    return `🚀 *Platform Overview*\n\n*Today*\n• Revenue: ₹${data.today.revenue?.toLocaleString('en-IN') || 0}\n• Sales: ${data.today.sales}\n• New Learners: ${data.today.newUsers}\n\n*This Month*\n• Revenue: ₹${data.thisMonth.revenue?.toLocaleString('en-IN') || 0}\n• Sales: ${data.thisMonth.sales}\n\n*Platform*\n• Total Learners: ${data.totalLearners}\n• Open Tickets: ${data.openTickets}\n• Live Classes: ${data.liveClassesNow}`;
  }
  if (lower.includes('task') || lower.includes('kanban')) {
    const data = JSON.parse(await executeTool('get_tasks_status', {}));
    const s = data.byStatus;
    return `📋 *Task Board*\n\n${s.map((t: any) => `• ${t._id}: ${t.count}`).join('\n')}\n\n${data.overdue > 0 ? `⚠️ ${data.overdue} overdue tasks!` : '✅ No overdue tasks'}`;
  }
  if (lower.includes('class') || lower.includes('live')) {
    const data = JSON.parse(await executeTool('get_upcoming_classes', {}));
    if (data.length === 0) return '📅 No classes scheduled in the next 24 hours.';
    return `🎥 *Upcoming Classes (24h)*\n\n${data.map((c: any) => `• *${c.title}* by ${c.mentor || 'TBD'}\n  ${format(new Date(c.scheduledAt), 'hh:mm a')} • ${c.duration}min • ${c.status}`).join('\n\n')}`;
  }
  if (lower.includes('performer') || lower.includes('affiliate') || lower.includes('commission')) {
    const data = JSON.parse(await executeTool('get_top_performers', { limit: 5 }));
    if (data.length === 0) return '📈 No commission data for this month yet.';
    return `🏆 *Top Performers This Month*\n\n${data.map((p: any, i: number) => `${i + 1}. *${p.name}* — ₹${p.total?.toLocaleString('en-IN')} (${p.count} referrals)`).join('\n')}`;
  }
  if (lower.includes('ticket') || lower.includes('support')) {
    const data = JSON.parse(await executeTool('get_pending_support', {}));
    return `🎫 *Support Tickets*\n\nOpen: ${data.openCount}\n${data.byPriority.map((p: any) => `• ${p._id}: ${p.count}`).join('\n')}`;
  }
  if (lower.includes('report') || lower.includes('founder')) {
    const data = JSON.parse(await executeTool('generate_founder_report', { period: 'daily' }));
    return `📋 *Daily Founder Report*\n_${data.generatedAt}_\n\n💰 Revenue: ₹${data.revenue.gross?.toLocaleString('en-IN')} (${data.revenue.sales} sales)\n👤 New Learners: ${data.newLearners}\n🎓 Classes Held: ${data.classesHeld}\n💸 Commissions: ₹${data.commissions.total?.toLocaleString('en-IN')}\n\n✅ *Set OPENAI_API_KEY for full AI capabilities*`;
  }

  return `👋 Hi! I'm NOVA, your platform co-pilot.\n\nI can help you with:\n• 📊 Sales & revenue reports\n• 👥 User & learner stats\n• 📋 Task board status\n• 🎥 Live class schedule\n• 🏆 Top performers\n• 🎫 Support tickets\n• 📤 WhatsApp broadcasts\n• 📋 Founder reports\n\nTry: _"What are today's sales?"_ or _"Show me the platform overview"_\n\n💡 *Add OPENAI_API_KEY to .env for full AI intelligence*`;
}

// ── Cron report generators ────────────────────────────────────────────────────

export async function generateAndSendFounderReport(phone: string, name: string, period: 'daily' | 'weekly') {
  try {
    const data = JSON.parse(await executeTool('generate_founder_report', { period }));
    const now = new Date();
    const msg = `🤖 *NOVA ${period === 'daily' ? 'Daily' : 'Weekly'} Report*
📅 ${data.generatedAt}

💰 *Revenue*
• Gross: ₹${data.revenue.gross?.toLocaleString('en-IN') || 0}
• Sales: ${data.revenue.sales} packages

👤 *Learners*
• New ${period === 'daily' ? 'today' : 'this week'}: ${data.newLearners}

💸 *Commissions*
• Paid: ₹${data.commissions.total?.toLocaleString('en-IN') || 0}
• Transactions: ${data.commissions.transactions}

🎥 Classes Held: ${data.classesHeld}

— NOVA, TruLearnix AI`;

    return await sendWhatsAppText(phone, msg);
  } catch (e) {
    console.error('[NOVA] founder report error:', e);
    return false;
  }
}

export async function generateMorningBriefing(founderPhone: string) {
  const data = JSON.parse(await executeTool('get_platform_overview', {}));
  const classes = JSON.parse(await executeTool('get_upcoming_classes', {}));
  const msg = `☀️ *Good Morning! NOVA Briefing*
📅 ${format(new Date(), 'EEEE, dd MMM yyyy')}

*Yesterday Summary*
💰 Revenue: ₹${data.today.revenue?.toLocaleString('en-IN') || 0}
🛒 Sales: ${data.today.sales}
👤 New Learners: ${data.today.newUsers}

*Today's Classes* (${classes.length} scheduled)
${classes.slice(0, 3).map((c: any) => `• ${c.title} @ ${format(new Date(c.scheduledAt), 'hh:mm a')}`).join('\n') || 'None scheduled'}

🎫 Open Tickets: ${data.openTickets}

Have a productive day! 🚀
— NOVA`;
  return sendWhatsAppText(founderPhone, msg);
}
