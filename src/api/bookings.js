import api from './axios';

/**
 * Create a booking: holds all slots from startHour to endHour on the given date.
 * payload: { date, startHour, endHour, teamName?, numPlayers? }
 */
export const createBooking = (payload) =>
  api.post('/bookings', payload).then((r) => r.data);

/**
 * Confirm payment for a pending booking — slots become permanently BOOKED.
 */
export const confirmPayment = (bookingId) =>
  api.post(`/bookings/${bookingId}/confirm`).then((r) => r.data);

/**
 * Cancel a pending booking and release its slot holds.
 */
export const cancelBooking = (bookingId) =>
  api.delete(`/bookings/${bookingId}`).then((r) => r.data);

export const fetchMyBookings = () =>
  api.get('/bookings/my').then((r) => r.data);

export const fetchMyBookingCount = () =>
  api.get('/bookings/my/count').then((r) => r.data);
