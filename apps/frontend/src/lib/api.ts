// API client configuration and utilities for DilSeDaan frontend
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For JWT cookies
});

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

// Initialize auth token from localStorage
const savedToken = localStorage.getItem('authToken');
if (savedToken) {
  setAuthToken(savedToken);
}

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authToken || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken } = response.data.data;
          setAuthToken(accessToken);
          
          // Retry original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        setAuthToken(null);
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User API
export const userApi = {
  // Authentication
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    walletAddress?: string;
  }): Promise<ApiResponse> => 
    apiClient.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }): Promise<ApiResponse> =>
    apiClient.post('/auth/login', credentials),

  walletLogin: (walletData: {
    walletAddress: string;
    signature: string;
    message: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/auth/wallet-login', walletData),

  logout: (): Promise<ApiResponse> =>
    apiClient.get('/auth/logout'),

  getProfile: (): Promise<ApiResponse> =>
    apiClient.get('/auth/me'),

  updateProfile: (profileData: any): Promise<ApiResponse> =>
    apiClient.put('/auth/updatedetails', profileData),

  updatePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> =>
    apiClient.put('/auth/updatepassword', passwordData),

  refreshToken: (refreshToken: string): Promise<ApiResponse> =>
    apiClient.post('/auth/refresh', { refreshToken }),
};

// Campaign API
export const campaignApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    location?: string;
    isUrgent?: boolean;
  }): Promise<ApiResponse> =>
    apiClient.get('/campaigns', { params }),

  getById: (id: string): Promise<ApiResponse> =>
    apiClient.get(`/campaigns/${id}`),

  create: (campaignData: any): Promise<ApiResponse> =>
    apiClient.post('/campaigns', campaignData),

  update: (id: string, campaignData: any): Promise<ApiResponse> =>
    apiClient.put(`/campaigns/${id}`, campaignData),

  delete: (id: string): Promise<ApiResponse> =>
    apiClient.delete(`/campaigns/${id}`),

  addUpdate: (id: string, updateData: {
    title: string;
    content: string;
    images?: string[];
  }): Promise<ApiResponse> =>
    apiClient.post(`/campaigns/${id}/updates`, updateData),

  submitMilestone: (campaignId: string, milestoneId: string, proofData: {
    proofDocuments: string[];
  }): Promise<ApiResponse> =>
    apiClient.post(`/campaigns/${campaignId}/milestones/${milestoneId}/submit`, proofData),

  verifyMilestone: (campaignId: string, milestoneId: string, verificationData: {
    approved: boolean;
    rejectionReason?: string;
  }): Promise<ApiResponse> =>
    apiClient.post(`/campaigns/${campaignId}/milestones/${milestoneId}/verify`, verificationData),
};

// Donation API
export const donationApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    campaignId?: string;
    status?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/donations', { params }),

  getById: (id: string): Promise<ApiResponse> =>
    apiClient.get(`/donations/${id}`),

  create: (donationData: {
    campaignId: string;
    amount: number;
    currency?: string;
    message?: string;
    isAnonymous?: boolean;
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: number;
    gasFee?: number;
  }): Promise<ApiResponse> =>
    apiClient.post('/donations', donationData),

  updateStatus: (id: string, statusData: {
    status: string;
    blockNumber?: number;
    gasUsed?: number;
    gasFee?: number;
  }): Promise<ApiResponse> =>
    apiClient.put(`/donations/${id}/status`, statusData),

  getAnalytics: (params?: {
    campaignId?: string;
    timeframe?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/donations/analytics/stats', { params }),

  getTaxReceipt: (id: string): Promise<ApiResponse> =>
    apiClient.get(`/donations/${id}/receipt`),
};

// Blockchain API
export const blockchainApi = {
  getStatus: (): Promise<ApiResponse> =>
    apiClient.get('/blockchain/status'),

  getTransaction: (hash: string, network?: string): Promise<ApiResponse> =>
    apiClient.get(`/blockchain/transaction/${hash}`, { params: { network } }),

  getBalance: (address: string, network?: string): Promise<ApiResponse> =>
    apiClient.get(`/blockchain/balance/${address}`, { params: { network } }),

  verifyDonation: (verificationData: {
    transactionHash: string;
    expectedAmount: number;
    campaignId: string;
    network?: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/blockchain/verify-donation', verificationData),

  getCampaignData: (id: string, network?: string): Promise<ApiResponse> =>
    apiClient.get(`/blockchain/campaign/${id}`, { params: { network } }),

  getGasPrice: (network?: string): Promise<ApiResponse> =>
    apiClient.get('/blockchain/gas-price', { params: { network } }),
};

// IPFS API
export const ipfsApi = {
  uploadFile: (file: File, metadata?: {
    description?: string;
    category?: string;
  }): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.description) formData.append('description', metadata.description);
    if (metadata?.category) formData.append('category', metadata.category);

    return apiClient.post('/ipfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadJSON: (data: any, metadata?: any): Promise<ApiResponse> =>
    apiClient.post('/ipfs/upload-json', { data, metadata }),

  getFile: (hash: string): Promise<ApiResponse> =>
    apiClient.get(`/ipfs/${hash}`),

  getMetadata: (hash: string): Promise<ApiResponse> =>
    apiClient.get(`/ipfs/${hash}/metadata`),

  pinFile: (hash: string): Promise<ApiResponse> =>
    apiClient.post(`/ipfs/${hash}/pin`),

  uploadMultiple: (files: File[]): Promise<ApiResponse> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    return apiClient.post('/ipfs/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  search: (params: {
    query?: string;
    category?: string;
    uploadedBy?: string;
    limit?: number;
  }): Promise<ApiResponse> =>
    apiClient.get('/ipfs/search', { params }),
};

// Audit API
export const auditApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    campaignId?: string;
    auditType?: string;
    status?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/audits', { params }),

  getById: (id: string): Promise<ApiResponse> =>
    apiClient.get(`/audits/${id}`),

  create: (auditData: {
    campaignId: string;
    auditType: string;
    scheduledDate?: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/audits', auditData),

  update: (id: string, auditData: any): Promise<ApiResponse> =>
    apiClient.put(`/audits/${id}`, auditData),

  start: (id: string): Promise<ApiResponse> =>
    apiClient.post(`/audits/${id}/start`),

  complete: (id: string, completionData: {
    findings: any[];
    overallScore: number;
    report: any;
  }): Promise<ApiResponse> =>
    apiClient.post(`/audits/${id}/complete`, completionData),

  addFinding: (id: string, finding: any): Promise<ApiResponse> =>
    apiClient.post(`/audits/${id}/findings`, finding),

  resolveFinding: (auditId: string, findingId: string): Promise<ApiResponse> =>
    apiClient.put(`/audits/${auditId}/findings/${findingId}/resolve`),

  getStats: (params?: { timeframe?: string }): Promise<ApiResponse> =>
    apiClient.get('/audits/stats/overview', { params }),
};

// Admin API
export const adminApi = {
  getDashboard: (): Promise<ApiResponse> =>
    apiClient.get('/admin/dashboard'),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    kycStatus?: string;
    search?: string;
  }): Promise<ApiResponse> =>
    apiClient.get('/admin/users', { params }),

  updateUserStatus: (userId: string, statusData: {
    kycStatus?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
  }): Promise<ApiResponse> =>
    apiClient.put(`/admin/users/${userId}/status`, statusData),

  deleteUser: (userId: string): Promise<ApiResponse> =>
    apiClient.delete(`/admin/users/${userId}`),

  getStats: (params?: { timeframe?: string }): Promise<ApiResponse> =>
    apiClient.get('/admin/stats', { params }),

  updateSettings: (settings: any): Promise<ApiResponse> =>
    apiClient.put('/admin/settings', settings),

  getHealth: (): Promise<ApiResponse> =>
    apiClient.get('/admin/health'),

  sendNotification: (notificationData: {
    type: string;
    title: string;
    message: string;
    targetUsers?: string;
    priority?: string;
  }): Promise<ApiResponse> =>
    apiClient.post('/admin/notifications', notificationData),
};

// Export all APIs
export const api = {
  user: userApi,
  campaign: campaignApi,
  donation: donationApi,
  blockchain: blockchainApi,
  ipfs: ipfsApi,
  audit: auditApi,
  admin: adminApi,
};

export default api;
