import api from './axios';

/**
 * Fetch all 24 hourly slots for the given date (auto-generated if needed).
 * Public endpoint — no auth required.
 */
export const fetchSlots = (date) =>
  api.get('/slots', { params: { date } }).then((r) => r.data);
