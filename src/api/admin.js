import api from './axios';

export const fetchAllBookings = () =>
  api.get('/admin/bookings').then((r) => r.data);

export const fetchBookingsByDate = (date) =>
  api.get('/admin/bookings/date', { params: { date } }).then((r) => r.data);

export const toggleBlockSlot = (slotId) =>
  api.patch(`/admin/slots/${slotId}/toggle-block`).then((r) => r.data);

export const generateSlots = (days = 7) =>
  api.post('/admin/slots/generate', null, { params: { days } }).then((r) => r.data);
