import axios from 'axios';

const API_BASE_URL = 'https://ugandavote-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


const API_BASE_URL_2 = 'https://ugandavote-backend.onrender.com';

const api2 = axios.create({
  baseURL: API_BASE_URL_2,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Load token on app start
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Response interceptor for token expiration
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

// ===============================
// AUTH
// ===============================
export const registerUser = (phone, pin, referralCode = '') => 
  api.post('/auth/register', { phone, pin, referralCode });

export const loginUser = (phone, pin) => 
  api.post('/auth/login', { phone, pin });

// ===============================
// USER & BALANCE
// ===============================
export const getBalance = () => api.get('/balance');

export const deposit = (user_id, amount) => 
  api.post('/admin/balance', { user_id, amount });

export const withdraw = (amount, method = 'MTN') => 
  api.post('/withdraw', { amount, method });

export const getWithdrawalHistory = () => 
  api.get('/withdrawals/history');

// ===============================
// REFERRALS
// ===============================
export const getReferralStats = () => api.get('/referrals/stats');

// ===============================
// PAYMENTS - M-PESA
// ===============================
export const mpesaPayment = (phone, amount) => 
  api.post('/payments/mpesa', { phone, amount });

export const checkMpesaStatus = (checkoutRequestId) => 
  api.get(`/payments/mpesa/status/${checkoutRequestId}`);

export const updatePendingMpesa = () =>
  api.post('/payments/mpesa/update_pending');

export const getMpesaTransactions = () =>
  api.get('/admin/mpesa-transactions');

// ===============================
// BETS
// ===============================
export const placeBet = (bet) => api.post('/bets', bet);

export const getBetHistory = () => api.get('/bets/history');

export const placeJackpotBet = (jackpotData) => api.post('/bets', jackpotData);

// ===============================
// ADMIN
// ===============================
export const getAdminUsers = () => api.get('/admin/users');

export const adminAddBalance = (user_id, amount) =>
  api.post('/admin/balance', { user_id, amount });

export const reconcileMpesa = () =>
  api.post('/payments/mpesa/update_pending');


// Admin Withdrawals
export const getAdminWithdrawals = () =>
  api2.get('/admin/withdrawals');

export const updateWithdrawalStatus = (withdrawalId, status) =>
  api2.put(`/admin/withdrawals/${withdrawalId}`, { status });


// ===============================
// ELECTIONS & CANDIDATES
// ===============================
// ===============================
// ELECTIONS & CANDIDATES
// ===============================
export const getElections = () => api2.get('/elections');

// Election CRUD
export const addElection = (election) => api2.post('/election', election);

export const updateElection = (id, election) =>
  api2.put(`/election/${id}`, election);

export const deleteElection = (id) => api2.delete(`/election/${id}`);

// Candidate CRUD
export const addCandidate = (candidate) => api2.post('/candidate', candidate);

export const updateCandidate = (id, candidate) =>
  api2.put(`/candidate/${id}`, candidate);

export const deleteCandidate = (id) => api2.delete(`/candidate/${id}`);

export default api;