import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.peptly.in/api',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('adminToken') || (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on login page — prevents infinite loop
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        Cookies.remove('adminToken');
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminName');
          localStorage.removeItem('adminRole');
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Auth
  login: (data: any) => api.post('/auth/login', data),
  // Dashboard
  dashboard: () => api.get('/admin/dashboard'),
  // Analytics
  analyticsDashboard: () => api.get('/analytics/dashboard'),
  analyticsRevenue: (period?: string) => api.get('/analytics/revenue', { params: { period } }),
  analyticsUsers: (period?: string) => api.get('/analytics/users', { params: { period } }),
  unitEconomics: () => api.get('/analytics/unit-economics'),
  // Users
  users: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  toggleUser: (id: string) => api.patch(`/admin/users/${id}/toggle`),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  updateUserPackage: (id: string, packageTier: string) => api.patch(`/admin/users/${id}/package`, { packageTier }),
  // Courses — admin sees all statuses
  allCourses: (params?: any) => api.get('/admin/courses/all', { params }),
  pendingCourses: () => api.get('/admin/courses/pending'),
  approveCourse: (id: string) => api.patch(`/admin/courses/${id}/approve`),
  rejectCourse: (id: string, reason: string) => api.patch(`/admin/courses/${id}/reject`, { reason }),
  // Packages
  packages: () => api.get('/admin/packages'),
  createPackage: (data: any) => api.post('/admin/packages', data),
  updatePackage: (id: string, data: any) => api.put(`/admin/packages/${id}`, data),
  // Purchases
  purchases: (params?: any) => api.get('/admin/purchases', { params }),
  // Commissions
  commissions: (params?: any) => api.get('/admin/commissions', { params }),
  // Withdrawals
  withdrawals: (params?: any) => api.get('/admin/withdrawals', { params }),
  processWithdrawal: (id: string, data: any) => api.patch(`/admin/withdrawals/${id}`, data),
  // CRM
  leads: (params?: any) => api.get('/crm/leads', { params }),
  getLead: (id: string) => api.get(`/crm/leads/${id}`),
  updateLead: (id: string, data: any) => api.patch(`/crm/leads/${id}`, data),
  deleteLead: (id: string) => api.delete(`/crm/leads/${id}`),
  crmStats: () => api.get('/crm/stats'),
  // Blog
  allBlogs: (params?: any) => api.get('/blog/admin/all', { params }),
  createBlog: (data: any) => api.post('/blog', data),
  updateBlog: (id: string, data: any) => api.put(`/blog/${id}`, data),
  deleteBlog: (id: string) => api.delete(`/blog/${id}`),
  // Tickets
  tickets: (params?: any) => api.get('/admin/tickets', { params }),
  updateTicket: (id: string, data: any) => api.patch(`/admin/tickets/${id}`, data),
  // Notifications broadcast
  broadcastNotify: (data: any) => api.post('/admin/notify', data),
  // Live classes
  allClasses: (params?: any) => api.get('/classes', { params }),
  createClass: (data: any) => api.post('/classes', data),
  // Coupons
  coupons: () => api.get('/coupons'),
  createCoupon: (data: any) => api.post('/coupons', data),
  updateCoupon: (id: string, data: any) => api.patch(`/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`),
  // Tasks (Kanban)
  tasks: () => api.get('/tasks'),
  createTask: (data: any) => api.post('/tasks', data),
  updateTask: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  // Study Materials
  materials: (params?: any) => api.get('/materials', { params }),
  createMaterial: (data: any) => api.post('/materials', data),
  deleteMaterial: (id: string) => api.delete(`/materials/${id}`),
  // Goals
  goals: (params?: any) => api.get('/goals', { params }),
  createGoal: (data: any) => api.post('/goals', data),
  updateGoal: (id: string, data: any) => api.patch(`/goals/${id}`, data),
  updateGoalKR: (goalId: string, krIndex: number, data: any) => api.patch(`/goals/${goalId}/kr/${krIndex}`, data),
  deleteGoal: (id: string) => api.delete(`/goals/${id}`),
  // Reminders
  reminders: () => api.get('/reminders'),
  createReminder: (data: any) => api.post('/reminders', data),
  deleteReminder: (id: string) => api.delete(`/reminders/${id}`),
};

export default api;
