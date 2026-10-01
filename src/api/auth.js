import api from './axios';

export const sendOtp = (phone) =>
  api.post('/auth/send-otp', { phone }).then((r) => r.data);

export const verifyOtp = (payload) =>
  api.post('/auth/verify-otp', payload).then((r) => r.data);

export const register = (data) =>
  api.post('/auth/register', data).then((r) => r.data);

export const login = (data) =>
  api.post('/auth/login', data).then((r) => r.data);

