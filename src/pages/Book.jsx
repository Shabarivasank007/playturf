import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Timer, CheckCircle,
  CreditCard, Smartphone, Shield, X, AlertCircle, ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchSlots } from '../api/slots';
import { createBooking, confirmPayment } from '../api/bookings';
import { useSlotSocket } from '../hooks/useSlotSocket';

// ── Helpers ───────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

const getDates = (n = 7) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

// "15:00:00" → "3:00 PM"
const fmtTime = (t) => {
  if (!t) return '';
  const h = parseInt(t.split(':')[0], 10);
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:00 ${h < 12 ? 'AM' : 'PM'}`;
};

// integer hour → label "3:00 PM"
const hourLabel = (h) => {
  if (h === 0)  return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h === 24) return '12:00 AM (next)';
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
};

const STATUS_CONFIG = {
  AVAILABLE: { bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-400', text: 'text-emerald-700', label: 'Available' },
  HELD:      { bg: 'bg-amber-50',    border: 'border-amber-200',   dot: 'bg-amber-400',   text: 'text-amber-600',  label: 'Held'      },
  BOOKED:    { bg: 'bg-red-50',      border: 'border-red-200',     dot: 'bg-red-400',     text: 'text-red-600',    label: 'Booked'    },
  BLOCKED:   { bg: 'bg-slate-100',   border: 'border-slate-200',   dot: 'bg-slate-400',   text: 'text-slate-500',  label: 'Blocked'   },
};

const HOLD_SECS = 300;

export default function Book() {
  const { user, showToast } = useApp();
  const navigate = useNavigate();

  // ── Grid state ────────────────────────────────────────────────────────────
  const [gridDate, setGridDate]           = useState(todayStr());
  const [slots, setSlots]                 = useState([]);
  const [loadingSlots, setLoadingSlots]   = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [showModal, setShowModal]   = useState(false);
  const [step, setStep]             = useState('form'); // form | payment | success

  // ── Form ──────────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    date:       todayStr(),
    startHour:  '',   // 0-23
    endHour:    '',   // 1-24 (exclusive)
    teamName:   '',
    numPlayers: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── Booking + hold ────────────────────────────────────────────────────────
  const [pendingBooking, setPending]  = useState(null);
  const [holdTimer, setHoldTimer]     = useState(HOLD_SECS);
  const timerRef = useRef(null);

  // ── Payment ───────────────────────────────────────────────────────────────
  const [payMethod, setPayMethod]   = useState('upi');
  const [payLoading, setPayLoading] = useState(false);

  // ── Load slots ────────────────────────────────────────────────────────────
  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    try { setSlots(await fetchSlots(gridDate)); }
    catch { showToast('Could not load slot grid', 'warning'); }
    finally { setLoadingSlots(false); }
  }, [gridDate]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  // ── WebSocket live updates ────────────────────────────────────────────────
  useSlotSocket(gridDate, (updated) => {
    setSlots((prev) => prev.map((s) => s.id === updated.id ? updated : s));
  });

  // ── Hold countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pendingBooking || step !== 'payment') return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setHoldTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          showToast('Hold expired — please book again', 'warning');
          closeModal();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [pendingBooking, step]);

  const fmtTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Slot status helpers ───────────────────────────────────────────────────
  const getSlotForHour = (hour) =>
    slots.find((s) => parseInt(s.startTime, 10) === hour ||
                      s.startTime?.startsWith(String(hour).padStart(2,'0') + ':'));

  // Which hours in the selected range are problematic
  const rangeIssues = () => {
    if (form.startHour === '' || form.endHour === '') return [];
    const issues = [];
    for (let h = Number(form.startHour); h < Number(form.endHour); h++) {
      const slot = getSlotForHour(h);
      if (slot && slot.status !== 'AVAILABLE') {
        issues.push({ hour: h, status: slot.status });
      }
    }
    return issues;
  };

  // Estimated price for the selected range
  const estimatedPrice = () => {
    if (form.startHour === '' || form.endHour === '') return 0;
    let total = 0;
    for (let h = Number(form.startHour); h < Number(form.endHour); h++) {
      const slot = getSlotForHour(h);
      total += slot?.price || 700;
    }
    return total;
  };

  // ── Date select helper ───────────────────────────────────────────────────
  const handleDateSelect = (d) => {
    setGridDate(d);
    setForm((f) => ({ ...f, date: d, startHour: '', endHour: '' }));
  };

  // ── Open / close modal ────────────────────────────────────────────────────
  const openModal = (dateToUse) => {
    if (!user) { showToast('Please sign in to book', 'warning'); navigate('/login'); return; }
    const targetDate = dateToUse || gridDate || todayStr();
    setStep('form');
    setForm((f) => ({
      ...f,
      date: targetDate,
      startHour: f.date === targetDate ? f.startHour : '',
      endHour: f.date === targetDate ? f.endHour : '',
      teamName: f.teamName || '',
      numPlayers: f.numPlayers || '',
    }));
    setFormErrors({});
    setPending(null);
    setHoldTimer(HOLD_SECS);
    setShowModal(true);
  };

  const closeModal = async () => {
    clearInterval(timerRef.current);
    if (pendingBooking?.paymentStatus === 'PENDING') {
      // Cancel & release the hold silently
      try {
        const api = (await import('../api/bookings'));
        // call cancel endpoint if it exists — best-effort
        await fetch(`http://localhost:8080/api/bookings/${pendingBooking.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } catch (_) {}
    }
    setShowModal(false);
    setStep('form');
    setPending(null);
    loadSlots();
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.date)                            errs.date      = 'Date is required';
    if (form.startHour === '')                 errs.startHour = 'Select a start time';
    if (form.endHour === '')                   errs.endHour   = 'Select an end time';
    if (form.endHour !== '' && form.startHour !== '' &&
        Number(form.endHour) <= Number(form.startHour)) {
      errs.endHour = 'End time must be after start time';
    }
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const issues = rangeIssues();
    if (issues.length > 0) {
      const h = issues[0];
      errs.startHour = `⚠️ ${hourLabel(h.hour)} is already ${h.status.toLowerCase()}. Please choose a different time range.`;
      setFormErrors(errs);
      return;
    }

    setFormErrors({});
    setSubmitting(true);
    try {
      const booking = await createBooking({
        date:       form.date,
        startHour:  Number(form.startHour),
        endHour:    Number(form.endHour),
        teamName:   form.teamName   || undefined,
        numPlayers: form.numPlayers ? Number(form.numPlayers) : undefined,
      });
      setPending(booking);
      setHoldTimer(HOLD_SECS);
      setStep('payment');
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not hold slots. Please try again.';
      setFormErrors({ startHour: '⚠️ ' + msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── WhatsApp Admin Notification Link ─────────────────────────────────────
  const getAdminWhatsappLink = (b) => {
    if (b?.adminWhatsappUrl) return b.adminWhatsappUrl;
    const adminPhone = '916382022478';
    const text = encodeURIComponent(
      `*NEW BOOKING ALERT - DD TURF COIMBATORE*\n\n` +
      `👤 *Customer:* ${b?.userName || user?.name || 'Customer'}\n` +
      `📱 *Customer Phone:* ${b?.userPhone || user?.phone || 'N/A'}\n` +
      `🆔 *Booking Ref:* ${b?.bookingReference || ''}\n` +
      `📅 *Date:* ${b?.date || ''}\n` +
      `⏰ *Time:* ${fmtTime(b?.startTime)} - ${fmtTime(b?.endTime)} (${b?.duration || 1} hr)\n` +
      (b?.teamName ? `⚽ *Team:* ${b.teamName}\n` : '') +
      (b?.numPlayers ? `👥 *Players:* ${b.numPlayers}\n` : '') +
      `💰 *Total Amount:* ₹${b?.totalAmount || ''}\n` +
      `✅ *Payment Status:* PAID (Confirmed)\n` +
      `🏟️ *Pitch:* DD Turf Coimbatore`
    );
    return `https://wa.me/${adminPhone}?text=${text}`;
  };

  // ── Payment ───────────────────────────────────────────────────────────────
  const handlePay = async () => {
    setPayLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    try {
      const confirmed = await confirmPayment(pendingBooking.id);
      clearInterval(timerRef.current);
      setPending(confirmed);
      setStep('success');
      showToast('Booking confirmed! Details sent to Admin 🎉', 'success');
      loadSlots();
    } catch (err) {
      showToast(err.response?.data?.error || 'Payment failed', 'warning');
    } finally {
      setPayLoading(false);
    }
  };

  // ── Build from/to hour options ────────────────────────────────────────────
  // Start: 0–23
  const startHourOptions = Array.from({ length: 24 }, (_, h) => {
    const slot = getSlotForHour(h);
    const unavail = slot && slot.status !== 'AVAILABLE';
    return { h, label: hourLabel(h), unavail };
  });

  // End: startHour+1 … 24  (end is exclusive upper bound)
  const endHourOptions = form.startHour !== ''
    ? Array.from({ length: 24 - Number(form.startHour) }, (_, i) => {
        const h = Number(form.startHour) + i + 1;
        return { h, label: hourLabel(h) };
      })
    : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Book a Slot</h1>
          <p className="text-slate-500 mt-1 text-sm">
            The grid shows today's live availability. Click{' '}
            <span className="font-semibold text-brand">Book Now</span> to select your time range.
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex-shrink-0 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-black
                     rounded-2xl shadow-lg shadow-brand/20 hover:shadow-brand/40
                     transition-all hover:scale-[1.03] active:scale-95 text-sm"
        >
          ⚽ Book Now
        </button>
      </div>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {getDates(7).map((d) => {
          const dt    = new Date(d + 'T00:00:00');
          const day   = dt.toLocaleDateString('en-IN', { weekday: 'short' });
          const num   = dt.getDate();
          const month = dt.toLocaleDateString('en-IN', { month: 'short' });
          return (
            <button key={d} onClick={() => handleDateSelect(d)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all
                ${gridDate === d ? 'bg-brand border-brand text-white shadow-md shadow-brand/20' : 'bg-white border-slate-200 text-slate-600 hover:border-brand/50'}`}>
              <span className="text-xs font-semibold">{day}</span>
              <span className="text-xl font-black">{num}</span>
              <span className="text-xs">{month}</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-5 mb-4 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>
        ))}
        <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live
        </span>
      </div>

      {/* Slot grid — VIEW ONLY */}
      {loadingSlots ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {Array(24).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {slots.map((slot, i) => {
            const cfg = STATUS_CONFIG[slot.status] || STATUS_CONFIG.AVAILABLE;
            const isAvail = slot.status === 'AVAILABLE';
            return (
              <motion.div key={slot.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.012 }}
                onClick={() => {
                  if (isAvail) {
                    const startH = parseInt(slot.startTime.split(':')[0], 10);
                    setForm((f) => ({
                      ...f,
                      date: gridDate,
                      startHour: startH,
                      endHour: startH + 1,
                    }));
                    openModal(gridDate);
                  }
                }}
                title={isAvail ? `Click to book ${fmtTime(slot.startTime)}` : `${fmtTime(slot.startTime)} — ${cfg.label}`}
                className={`${cfg.bg} ${cfg.border} border-2 rounded-xl p-2 text-center select-none transition-all
                  ${isAvail ? 'cursor-pointer hover:border-emerald-400 hover:scale-105 active:scale-95 hover:shadow-md' : ''}`}
              >
                <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot} mb-1`} />
                <div className="text-xs font-bold text-slate-700">{fmtTime(slot.startTime)}</div>
                <div className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</div>
                <div className="text-[10px] text-slate-400">₹{slot.price}</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative w-full max-w-[520px] bg-white rounded-3xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto my-auto"
            >

              {/* ── FORM ── */}
              {step === 'form' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-black text-slate-800">Book Your Slot</h2>
                      <p className="text-sm text-slate-400 mt-0.5">Choose date, from time & to time</p>
                    </div>
                    <button onClick={closeModal}
                      className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all">
                      <X size={17} className="text-slate-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Date */}
                    <FField label="Date" error={formErrors.date}>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="date" value={form.date} min={todayStr()}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            setForm((f) => ({ ...f, date: newDate, startHour: '', endHour: '' }));
                            setGridDate(newDate);
                          }}
                          className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm
                                     bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all" />
                      </div>
                    </FField>

                    {/* From – To time row */}
                    <div className="grid grid-cols-2 gap-3">
                      <FField label="From" error={formErrors.startHour}>
                        <div className="relative">
                          <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                          <select value={form.startHour}
                            onChange={(e) => setForm((f) => ({ ...f, startHour: e.target.value, endHour: '' }))}
                            className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-sm
                                       bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand appearance-none transition-all">
                            <option value="">Start time</option>
                            {startHourOptions.map(({ h, label, unavail }) => (
                              <option key={h} value={h} disabled={unavail}>
                                {label}{unavail ? ' ✗' : ''}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </FField>

                      <FField label="To" error={formErrors.endHour}>
                        <div className="relative">
                          <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                          <select value={form.endHour}
                            onChange={(e) => setForm((f) => ({ ...f, endHour: e.target.value }))}
                            disabled={form.startHour === ''}
                            className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-sm
                                       bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand appearance-none transition-all
                                       disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value="">End time</option>
                            {endHourOptions.map(({ h, label }) => (
                              <option key={h} value={h}>{label}</option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </FField>
                    </div>

                    {/* Live range preview */}
                    {form.startHour !== '' && form.endHour !== '' && Number(form.endHour) > Number(form.startHour) && (
                      <RangePreview
                        startHour={Number(form.startHour)}
                        endHour={Number(form.endHour)}
                        slots={slots}
                        estimatedPrice={estimatedPrice()}
                        issues={rangeIssues()}
                      />
                    )}

                    {/* Team & players */}
                    <div className="grid grid-cols-2 gap-3">
                      <FField label={<>Team <span className="text-slate-400 font-normal text-xs">(opt)</span></>}>
                        <input type="text" value={form.teamName} placeholder="FC Chennai"
                          onChange={(e) => setForm((f) => ({ ...f, teamName: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all" />
                      </FField>
                      <FField label={<>Players <span className="text-slate-400 font-normal text-xs">(opt)</span></>}>
                        <input type="number" min="1" max="22" value={form.numPlayers} placeholder="10"
                          onChange={(e) => setForm((f) => ({ ...f, numPlayers: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all" />
                      </FField>
                    </div>

                    <button type="submit" disabled={submitting || rangeIssues().length > 0}
                      className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black text-sm
                                 shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                      {submitting
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Securing slots...</>
                        : 'Confirm & Proceed to Payment →'}
                    </button>
                  </form>
                </div>
              )}

              {/* ── PAYMENT ── */}
              {step === 'payment' && pendingBooking && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-black text-slate-800">Complete Payment</h2>
                    <button onClick={closeModal}
                      className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center">
                      <X size={17} className="text-slate-500" />
                    </button>
                  </div>

                  {/* Hold timer */}
                  <div className={`flex items-center gap-2 p-3 rounded-2xl mb-5 text-sm font-semibold
                    ${holdTimer < 60 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    <Timer size={15} />
                    Slots held for{' '}
                    <span className="font-black text-base">{fmtTimer(holdTimer)}</span>
                    {' '}— pay before they're released
                  </div>

                  {/* Order summary */}
                  <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2 text-sm border border-slate-200">
                    <Row label="Date"     val={pendingBooking.date} />
                    <Row label="From"     val={fmtTime(pendingBooking.startTime)} />
                    <Row label="To"       val={fmtTime(pendingBooking.endTime)} />
                    <Row label="Duration" val={`${pendingBooking.duration} hour(s)`} />
                    {pendingBooking.teamName && <Row label="Team" val={pendingBooking.teamName} />}
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-base">
                      <span>Total</span><span className="text-brand">₹{pendingBooking.totalAmount}</span>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Payment Method</p>
                    <div className="flex gap-3 mb-4">
                      {[['upi',<Smartphone size={15}/>,'UPI'],['card',<CreditCard size={15}/>,'Card']].map(([m,icon,label])=>(
                        <button key={m} onClick={() => setPayMethod(m)}
                          className={`flex-1 flex items-center gap-2 justify-center py-3 rounded-xl border-2 text-sm font-semibold transition-all
                            ${payMethod === m ? 'bg-brand border-brand text-white' : 'border-slate-200 text-slate-600 hover:border-brand/50'}`}>
                          {icon}{label}
                        </button>
                      ))}
                    </div>
                    {payMethod === 'upi'
                      ? <input placeholder="yourname@upi" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                      : <div className="space-y-3">
                          <input placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                          <div className="flex gap-3">
                            <input placeholder="MM/YY" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                            <input placeholder="CVV"   className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                          </div>
                        </div>
                    }
                  </div>

                  <button onClick={handlePay} disabled={payLoading}
                    className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black text-sm
                               shadow-md flex items-center justify-center gap-2 disabled:opacity-60 transition-all">
                    {payLoading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                      : <><Shield size={15}/> Pay ₹{pendingBooking.totalAmount} Securely</>}
                  </button>
                </div>
              )}

              {/* ── SUCCESS ── */}
              {step === 'success' && pendingBooking && (
                <div className="p-6 text-center">
                  {/* Confetti */}
                  <div className="relative flex justify-center h-20 mb-2">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        animate={{ opacity: 0, x: (i%2===0?1:-1)*(20+i*9), y: -50-i*4, scale: 0 }}
                        transition={{ duration: 0.8, delay: i * 0.04 }}
                        className="absolute w-2.5 h-2.5 rounded-full top-5"
                        style={{ background: ['#e30613','#22c55e','#3b82f6','#f59e0b'][i%4] }}
                      />
                    ))}
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center z-10">
                      <CheckCircle size={34} className="text-emerald-500" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-slate-800 mb-1">Booking Confirmed!</h2>
                  <p className="text-slate-500 text-sm mb-4">Payment received & slot reserved successfully 🎉</p>

                  <div className="bg-slate-50 rounded-2xl p-4 text-left mb-4 space-y-2 text-sm border border-slate-200">
                    <Row label="Booking ID" val={pendingBooking.bookingReference} />
                    <Row label="Date"       val={pendingBooking.date} />
                    <Row label="From"       val={fmtTime(pendingBooking.startTime)} />
                    <Row label="To"         val={fmtTime(pendingBooking.endTime)} />
                    <Row label="Duration"   val={`${pendingBooking.duration} hr`} />
                    <Row label="Amount"     val={`₹${pendingBooking.totalAmount}`} />
                  </div>

                  {/* Automatic Admin WhatsApp Status Card */}
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 mb-5 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow">
                          ✓
                        </span>
                        <span className="font-extrabold text-sm text-emerald-950">Automated Admin WhatsApp Sent</span>
                      </div>
                      <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                        +91 6382022478
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">
                      Booking details and slot timings have been automatically routed to the DD Turf administrator via WhatsApp.
                    </p>
                    <a
                      href={getAdminWhatsappLink(pendingBooking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline inline-flex items-center gap-1"
                    >
                      💬 View formatted receipt or chat with Admin
                    </a>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={closeModal}
                      className="flex-1 py-3 border-2 border-brand text-brand rounded-xl font-bold text-sm hover:bg-brand/5 transition-all">
                      Book Another
                    </button>
                    <button onClick={() => { closeModal(); navigate('/bookings'); }}
                      className="flex-1 py-3 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-dark shadow-md transition-all">
                      My Bookings →
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Range preview card ────────────────────────────────────────────────────────
function RangePreview({ startHour, endHour, slots, estimatedPrice, issues }) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  return (
    <div className={`rounded-2xl p-4 border-2 ${issues.length > 0 ? 'bg-red-50 border-red-200' : 'bg-brand/5 border-brand/20'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-bold text-slate-700">
            {hourLabel(startHour)} → {hourLabel(endHour)}
          </p>
          <p className="text-xs text-slate-500">{endHour - startHour} hour(s)</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-brand">₹{estimatedPrice}</p>
          <p className="text-xs text-slate-400">estimated</p>
        </div>
      </div>

      {/* Mini slot strip */}
      <div className="flex gap-1 flex-wrap">
        {hours.map((h) => {
          const slot = slots.find((s) => s.startTime?.startsWith(String(h).padStart(2,'0') + ':'));
          const status = slot?.status || 'AVAILABLE';
          const cfg = {
            AVAILABLE: 'bg-emerald-200 text-emerald-800',
            HELD:      'bg-amber-200 text-amber-800',
            BOOKED:    'bg-red-200 text-red-800',
            BLOCKED:   'bg-slate-200 text-slate-600',
          }[status] || 'bg-emerald-200';
          return (
            <span key={h} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${cfg}`}>
              {hourLabel(h).replace(':00', '')}
            </span>
          );
        })}
      </div>

      {issues.length > 0 && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          <span>{hourLabel(issues[0].hour)} is {issues[0].status.toLowerCase()}. Choose a different range.</span>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function FField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && (
        <div className="flex items-start gap-1 mt-1.5">
          <AlertCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-500 leading-snug">{error}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, val }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{val}</span>
    </div>
  );
}
