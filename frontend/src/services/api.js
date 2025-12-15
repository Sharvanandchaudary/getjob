import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle specific status codes
      if (status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status === 404) {
        toast.error('Resource not found.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (data?.message) {
        toast.error(data.message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

// Applications API
export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.patch(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats/summary'),
};

// AI API
export const aiAPI = {
  analyzeResume: (formData) =>
    api.post('/ai/analyze-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getJobMatches: (limit = 20) =>
    api.get('/ai/job-matches', { params: { limit } }),
  getRecommendations: (preferences) =>
    api.post('/ai/recommend', { preferences }),
};

// Jobs API
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
};

// Recruiter API
export const recruiterAPI = {
  getCandidates: () => api.get('/recruiter/candidates'),
  getApplications: (params) => api.get('/recruiter/applications', { params }),
  updateApplication: (id, data) =>
    api.patch(`/recruiter/application/${id}`, data),
  addNote: (data) => api.post('/recruiter/notes', data),
  getStats: () => api.get('/recruiter/stats'),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getRecruiters: () => api.get('/admin/recruiters'),
  getApplications: (params) => api.get('/admin/applications', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  assignCandidate: (data) => api.post('/admin/assign', data),
  updateUser: (id, data) => api.patch(`/admin/user/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
  syncSheets: () => api.post('/admin/sync-sheets'),
};

export default api;
