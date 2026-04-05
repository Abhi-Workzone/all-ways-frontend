import api from '@/lib/api';

// Auth API
export const authAPI = {
  signup: (data: { email: string; password: string }) =>
    api.post('/auth/signup', data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  getMe: () => api.get('/auth/me'),
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),

  getActive: () => api.get('/services/active'),

  create: (data: {
    name: string;
    description: string;
    icon?: string;
    isActive?: boolean;
    isComingSoon?: boolean;
  }) => api.post('/services', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/services/${id}`, data),

  delete: (id: string) => api.delete(`/services/${id}`),
};

// Requests API
export const requestsAPI = {
  create: (data: {
    serviceId: string;
    address: string;
    description: string;
    preferredTime: string;
  }) => api.post('/requests', data),

  getAll: (status?: string) =>
    api.get('/requests', { params: status ? { status } : {} }),

  updateStatus: (id: string, status: string) =>
    api.patch(`/requests/${id}/status`, { status }),

  assignVendor: (id: string, vendorId: string) =>
    api.post(`/requests/${id}/assign`, { vendorId }),

  getVendorsByService: (serviceId: string) =>
    api.get(`/requests/service/${serviceId}/vendors`),

  confirmArrival: (id: string) =>
    api.patch(`/requests/${id}/confirm-arrival`),

  uploadBeforeImages: (id: string, formData: FormData) =>
    api.patch(`/requests/${id}/start-work`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  complete: (id: string, formData: FormData) =>
    api.patch(`/requests/${id}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  adminCreate: (data: any) =>
    api.post('/requests/admin/create', data),
};

// Users API
export const usersAPI = {
  getUsers: (role?: string) => api.get(`/users${role ? `?role=${role}` : ''}`),
  updateUser: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getMe: () => api.get('/users/me'),
  updateMe: (data: Record<string, unknown>) => api.patch('/users/me', data),
};
