import axios, { AxiosResponse } from 'axios';
import {
  User,
  UserLogin,
  UserRegistration,
  Wallet,
  WalletCreate,
  WalletDeposit,
  WalletTransfer,
  Transaction,
  PiggyBank,
  PiggyBankCreate,
  PiggyBankContribution,
  PiggyBankContribute,
  PiggyBankMember,
  AddMember,
  PiggyBankPayment,
} from '../types';

// Function to get CSRF token from cookies
const getCSRFToken = (): string | null => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, // Important for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add CSRF token
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);

    // Add CSRF token for non-GET requests
    if (config.method !== 'get') {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Function to get CSRF token from Django
export const getCSRFTokenFromServer = async (): Promise<void> => {
  try {
    await axios.get('http://localhost:8000/api/auth/csrf/', {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
};

// Authentication API
export const authAPI = {
  register: async (userData: UserRegistration): Promise<AxiosResponse<User>> => {
    await getCSRFTokenFromServer();
    return api.post('/auth/register/', userData);
  },

  login: async (credentials: UserLogin): Promise<AxiosResponse<User>> => {
    await getCSRFTokenFromServer();
    return api.post('/auth/login/', credentials);
  },

  logout: (): Promise<AxiosResponse<void>> =>
    api.post('/auth/logout/'),

  getProfile: (): Promise<AxiosResponse<User>> =>
    api.get('/auth/profile/'),

  updateProfile: (userData: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put('/auth/profile/', userData),

  searchUsers: (query: string): Promise<AxiosResponse<User[]>> =>
    api.get(`/auth/users/search/?q=${encodeURIComponent(query)}`),
};

// Wallet API
export const walletAPI = {
  getWallets: (): Promise<AxiosResponse<Wallet[]>> =>
    api.get('/wallets/'),

  createWallet: async (walletData: WalletCreate): Promise<AxiosResponse<Wallet>> => {
    await getCSRFTokenFromServer();
    return api.post('/wallets/', walletData);
  },

  getWallet: (id: string): Promise<AxiosResponse<Wallet>> =>
    api.get(`/wallets/${id}/`),

  updateWallet: async (id: string, walletData: Partial<WalletCreate>): Promise<AxiosResponse<Wallet>> => {
    await getCSRFTokenFromServer();
    return api.put(`/wallets/${id}/`, walletData);
  },

  deleteWallet: async (id: string): Promise<AxiosResponse<void>> => {
    await getCSRFTokenFromServer();
    return api.delete(`/wallets/${id}/`);
  },

  deposit: async (id: string, depositData: WalletDeposit): Promise<AxiosResponse<Transaction>> => {
    await getCSRFTokenFromServer();
    return api.post(`/wallets/${id}/deposit/`, depositData);
  },

  transfer: async (id: string, transferData: WalletTransfer): Promise<AxiosResponse<Transaction>> => {
    await getCSRFTokenFromServer();
    return api.post(`/wallets/${id}/transfer/`, transferData);
  },

  getTransactions: (id: string): Promise<AxiosResponse<Transaction[]>> =>
    api.get(`/wallets/${id}/transactions/`),
};

// PiggyBank API
export const piggyBankAPI = {
  getPiggyBanks: (): Promise<AxiosResponse<PiggyBank[]>> =>
    api.get('/piggybanks/'),

  createPiggyBank: async (piggyBankData: PiggyBankCreate): Promise<AxiosResponse<PiggyBank>> => {
    await getCSRFTokenFromServer();
    return api.post('/piggybanks/', piggyBankData);
  },

  getPiggyBank: (id: string): Promise<AxiosResponse<PiggyBank>> =>
    api.get(`/piggybanks/${id}/`),

  updatePiggyBank: async (id: string, piggyBankData: Partial<PiggyBankCreate>): Promise<AxiosResponse<PiggyBank>> => {
    await getCSRFTokenFromServer();
    return api.put(`/piggybanks/${id}/`, piggyBankData);
  },

  deletePiggyBank: async (id: string): Promise<AxiosResponse<void>> => {
    await getCSRFTokenFromServer();
    return api.delete(`/piggybanks/${id}/`);
  },

  addMember: async (id: string, memberData: AddMember): Promise<AxiosResponse<PiggyBankMember>> => {
    await getCSRFTokenFromServer();
    return api.post(`/piggybanks/${id}/add-member/`, memberData);
  },

  contribute: async (id: string, contributionData: PiggyBankContribute): Promise<AxiosResponse<PiggyBankContribution>> => {
    await getCSRFTokenFromServer();
    return api.post(`/piggybanks/${id}/contribute/`, contributionData);
  },

  getContributions: (id: string): Promise<AxiosResponse<PiggyBankContribution[]>> =>
    api.get(`/piggybanks/${id}/contributions/`),

  getMembers: (id: string): Promise<AxiosResponse<PiggyBankMember[]>> =>
    api.get(`/piggybanks/${id}/members/`),

  payFromPiggyBank: async (id: string, paymentData: PiggyBankPayment): Promise<AxiosResponse<Transaction>> => {
    await getCSRFTokenFromServer();
    return api.post(`/piggybanks/${id}/pay/`, paymentData);
  },
};

export default api;
