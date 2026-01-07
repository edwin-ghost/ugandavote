import axios from 'axios';

const API_BASE_URL = 'https://ugandavote-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===============================
// TOKEN HANDLING
// ===============================

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Load token on refresh
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// ===============================
// AUTH
// ===============================

export const registerUser = (phone, pin) => api.post('/auth/register', { phone, pin });
export const loginUser = (phone, pin) => api.post('/auth/login', { phone, pin });

// ===============================
// USER
// ===============================

// Token will be automatically sent because of setAuthToken
export const getBalance = () => api.get('/balance');

// Admin add balance
export const deposit = (user_id, amount) => api.post('/admin/balance', { user_id, amount });

// Withdraw
export const withdraw = (amount, method) => api.post('/withdraw', { amount, method });

// ===============================
// PAYMENTS - M-PESA
// ===============================

// Initiate M-Pesa STK Push
export const mpesaPayment = (phone, amount) => 
  api.post('/payments/mpesa', { phone, amount });

// Check M-Pesa transaction status
export const checkMpesaStatus = (checkoutRequestId) => 
  api.get(`/payments/mpesa/status/${checkoutRequestId}`);

// ===============================
// BETS
// ===============================

export const placeBet = (bet) => api.post('/bets', bet);
export const getBetHistory = () => api.get('/bets/history');


export const placeJackpotBet = (jackpotData) => api.post('/bets', jackpotData);


export default api;