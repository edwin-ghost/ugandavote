import axios from 'axios';

const API_BASE_URL = 'https://ugandavote-backend.onrender.com/api';
const API_BASE_URL_2 = 'https://ugandavote-backend.onrender.com';

// Cache configuration
const CACHE_DURATION = {
  elections: 5 * 60 * 1000,      // 5 minutes
  balance: 30 * 1000,             // 30 seconds
  withdrawalHistory: 2 * 60 * 1000, // 2 minutes
  betHistory: 1 * 60 * 1000,      // 1 minute
  referralStats: 2 * 60 * 1000,   // 2 minutes
  adminUsers: 1 * 60 * 1000,      // 1 minute
  adminWithdrawals: 30 * 1000,    // 30 seconds
  mpesaTransactions: 1 * 60 * 1000 // 1 minute
};

// In-memory cache
class Cache {
  constructor() {
    this.store = new Map();
  }

  set(key, data, duration) {
    this.store.set(key, {
      data,
      expiry: Date.now() + duration
    });
  }

  get(key) {
    const cached = this.store.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return cached.data;
  }

  invalidate(key) {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  invalidatePattern(pattern) {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key);
      }
    }
  }
}

const cache = new Cache();

// API instances with optimizations
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

const api2 = axios.create({
  baseURL: API_BASE_URL_2,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request deduplication
const pendingRequests = new Map();

function deduplicateRequest(key, requestFn) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = requestFn()
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
}

// Cached request wrapper
async function cachedRequest(cacheKey, requestFn, duration) {
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return Promise.resolve({ data: cached });
  }

  // Deduplicate concurrent requests
  return deduplicateRequest(cacheKey, async () => {
    const response = await requestFn();
    cache.set(cacheKey, response.data, duration);
    return response;
  });
}

// Token management
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api2.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    delete api2.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    cache.invalidate(); // Clear all cache on logout
  }
};

// Load token on app start
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

api2.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ===============================
// AUTH (No caching for auth)
// ===============================
export const registerUser = (phone, pin, referralCode = '') => {
  cache.invalidate(); // Clear cache on register
  return api.post('/auth/register', { phone, pin, referralCode });
};

export const loginUser = (phone, pin) => {
  cache.invalidate(); // Clear cache on login
  return api.post('/auth/login', { phone, pin });
};

// ===============================
// USER & BALANCE (Cached)
// ===============================
export const getBalance = () => 
  cachedRequest('balance', () => api.get('/balance'), CACHE_DURATION.balance);

export const deposit = (user_id, amount) => {
  cache.invalidatePattern('balance');
  cache.invalidatePattern('admin');
  return api.post('/admin/balance', { user_id, amount });
};

export const withdraw = (amount, method = 'MTN') => {
  cache.invalidatePattern('balance');
  cache.invalidatePattern('withdrawal');
  return api.post('/withdraw', { amount, method });
};

export const getWithdrawalHistory = () =>
  cachedRequest(
    'withdrawalHistory',
    () => api.get('/withdrawals/history'),
    CACHE_DURATION.withdrawalHistory
  );

// ===============================
// REFERRALS (Cached)
// ===============================
export const getReferralStats = () =>
  cachedRequest(
    'referralStats',
    () => api.get('/referrals/stats'),
    CACHE_DURATION.referralStats
  );

// ===============================
// PAYMENTS - M-PESA
// ===============================
export const mpesaPayment = (phone, amount) => {
  cache.invalidatePattern('mpesa');
  return api.post('/payments/mpesa', { phone, amount });
};

export const checkMpesaStatus = (checkoutRequestId) =>
  api.get(`/payments/mpesa/status/${checkoutRequestId}`);

export const updatePendingMpesa = () => {
  cache.invalidatePattern('mpesa');
  cache.invalidatePattern('balance');
  return api.post('/payments/mpesa/update_pending');
};

export const getMpesaTransactions = () =>
  cachedRequest(
    'mpesaTransactions',
    () => api.get('/admin/mpesa-transactions'),
    CACHE_DURATION.mpesaTransactions
  );

// ===============================
// BETS
// ===============================
export const placeBet = (bet) => {
  cache.invalidatePattern('balance');
  cache.invalidatePattern('bet');
  return api.post('/bets', bet);
};

export const getBetHistory = () =>
  cachedRequest(
    'betHistory',
    () => api.get('/bets/history'),
    CACHE_DURATION.betHistory
  );

export const placeJackpotBet = (jackpotData) => {
  cache.invalidatePattern('balance');
  cache.invalidatePattern('bet');
  return api.post('/bets', jackpotData);
};

// ===============================
// ADMIN (Cached)
// ===============================
export const getAdminUsers = () =>
  cachedRequest(
    'adminUsers',
    () => api.get('/admin/users'),
    CACHE_DURATION.adminUsers
  );

export const adminAddBalance = (user_id, amount) => {
  cache.invalidatePattern('balance');
  cache.invalidatePattern('admin');
  return api.post('/admin/balance', { user_id, amount });
};

export const reconcileMpesa = () => {
  cache.invalidatePattern('mpesa');
  return api.post('/payments/mpesa/update_pending');
};

export const getAdminWithdrawals = () =>
  cachedRequest(
    'adminWithdrawals',
    () => api2.get('/admin/withdrawals'),
    CACHE_DURATION.adminWithdrawals
  );

export const updateWithdrawalStatus = (withdrawalId, status) => {
  cache.invalidatePattern('withdrawal');
  cache.invalidatePattern('admin');
  return api2.put(`/admin/withdrawals/${withdrawalId}`, { status });
};

// ===============================
// ELECTIONS & CANDIDATES (Heavily cached)
// ===============================
export const getElections = () =>
  cachedRequest(
    'elections',
    () => api2.get('/elections'),
    CACHE_DURATION.elections
  );

export const addElection = (election) => {
  cache.invalidate('elections');
  return api2.post('/election', election);
};

export const updateElection = (id, election) => {
  cache.invalidate('elections');
  return api2.put(`/election/${id}`, election);
};

export const deleteElection = (id) => {
  cache.invalidate('elections');
  return api2.delete(`/election/${id}`);
};

export const addCandidate = (candidate) => {
  cache.invalidate('elections');
  return api2.post('/candidate', candidate);
};

export const updateCandidate = (id, candidate) => {
  cache.invalidate('elections');
  return api2.put(`/candidate/${id}`, candidate);
};

export const deleteCandidate = (id) => {
  cache.invalidate('elections');
  return api2.delete(`/candidate/${id}`);
};

// Manual cache control (export for component use)
export const cacheControl = {
  invalidate: (key) => cache.invalidate(key),
  invalidatePattern: (pattern) => cache.invalidatePattern(pattern),
  clear: () => cache.invalidate()
};

export default api;