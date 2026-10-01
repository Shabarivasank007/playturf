import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Calendar, Users, Lock, Unlock, RefreshCw, Filter } from 'lucide-react';
import { fetchAllBookings, fetchBookingsByDate, toggleBlockSlot, generateSlots } from '../api/admin';
import { fetchSlots } from '../api/slots';
import { useApp } from '../context/AppContext';
import { useSlotSocket } from '../hooks/useSlotSocket';

function today() { return new Date().toISOString().split('T')[0]; }

export default function Admin() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('bookings'); // bookings | slots
  const [bookings, setBookings]   = useState([]);
  const [slots, setSlots]         = useState([]);
  const [dateFilter, setDateFilter] = useState(today());
  const [loading, setLoading]     = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);

  // ── Load bookings ────────────────────────────────────────────────────────────
  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = dateFilter
        ? await fetchBookingsByDate(dateFilter)
        : await fetchAllBookings();
      setBookings(data);
    } catch { showToast('Failed to load bookings', 'warning'); }
    finally { setLoading(false); }
  }, [dateFilter]);

  // ── Load slots ───────────────────────────────────────────────────────────────
  const loadSlots = useCallback(async () => {
    setSlotLoading(true);
    try {
      setSlots(await fetchSlots(dateFilter));
    } finally { setSlotLoading(false); }
  }, [dateFilter]);

  useEffect(() => { loadBookings(); loadSlots(); }, [loadBookings, loadSlots]);

  useSlotSocket(dateFilter, (updated) => {
    setSlots((prev) => prev.map((s) => s.id === updated.id ? updated : s));
  });

  // ── Stats ────────────────────────────────────────────────────────────────────
  const revenue  = bookings.filter((b) => b.paymentStatus === 'PAID')
                           .reduce((s, b) => s + b.totalAmount, 0);
  const paid     = bookings.filter((b) => b.paymentStatus === 'PAID').length;
  const pending  = bookings.filter((b) => b.paymentStatus === 'PENDING').length;
  const bookedSl = slots.filter((s) => s.status === 'BOOKED').length;
  const heldSl   = slots.filter((s) => s.status === 'HELD').length;
  const util     = slots.length ? Math.round(((bookedSl + heldSl) / slots.length) * 100) : 0;

  // ── Toggle block ─────────────────────────────────────────────────────────────
  const handleToggle = async (slotId) => {
    try {
      const updated = await toggleBlockSlot(slotId);
      setSlots((prev) => prev.map((s) => s.id === updated.id ? updated : s));
      showToast(`Slot ${updated.status === 'BLOCKED' ? 'blocked' : 'unblocked'}`, 'info');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed', 'warning');
    }
  };

  const handleGenerate = async () => {
    try {
      await generateSlots(7);
      showToast('Slots generated for next 7 days', 'success');
    } catch { showToast('Generation failed', 'warning'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Admin Panel</h1>
          <p className="text-slate-500 mt-1">DD Turf Control Centre</p>
        </div>
        <button onClick={handleGenerate}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-2xl text-sm font-bold hover:bg-brand-dark transition-all">
          <RefreshCw size={14} /> Generate Slots
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Revenue" val={`₹${revenue}`} color="text-brand" />
        <Stat label="Paid Bookings" val={paid} color="text-emerald-600" />
        <Stat label="Utilization" val={`${util}%`} color="text-blue-600" />
        <Stat label="Pending" val={pending} color="text-amber-600" />
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-3 mb-6">
        <Filter size={16} className="text-slate-400" />
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        <button onClick={() => { loadBookings(); loadSlots(); }}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-600 transition-all">
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-2xl p-1 mb-6 w-fit">
        {['bookings','slots'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize
              ${activeTab === t ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Bookings table */}
      {activeTab === 'bookings' && (
        loading ? <Skeleton n={5} /> : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            {bookings.length === 0 ? (
              <div className="p-10 text-center text-slate-400">No bookings for this date</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>{['Ref','Name','Phone','Email','Date','Time','Dur','Team','Status','Amount'].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{b.bookingReference}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{b.userName}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <span>{b.userPhone || '—'}</span>
                            {b.userPhone && (
                              <a
                                href={`https://wa.me/${b.userPhone.replace(/\D/g,'').startsWith('91') ? b.userPhone.replace(/\D/g,'') : '91' + b.userPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${b.userName}, regarding your DD Turf booking ${b.bookingReference} on ${b.date}:`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp Customer"
                                className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-1 rounded-md text-xs font-bold inline-flex items-center"
                              >
                                💬
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{b.userEmail}</td>
                        <td className="px-4 py-3 text-slate-600">{b.date}</td>
                        <td className="px-4 py-3 text-slate-600">{b.startTime?.slice(0,5)}</td>
                        <td className="px-4 py-3">{b.duration}h</td>
                        <td className="px-4 py-3 text-slate-500">{b.teamName || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                            ${b.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                              b.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-600'}`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-brand">₹{b.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {/* Slots grid */}
      {activeTab === 'slots' && (
        slotLoading ? <Skeleton n={4} /> : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {slots.map((slot) => (
              <motion.div key={slot.id}
                whileHover={{ scale: 1.02 }}
                className={`rounded-2xl border-2 p-3 text-center
                  ${slot.status === 'BOOKED' ? 'bg-slate-100 border-slate-200' :
                    slot.status === 'HELD'   ? 'bg-amber-50 border-amber-200' :
                    slot.status === 'BLOCKED'? 'bg-red-50 border-red-200' :
                    'bg-white border-slate-200'}`}
              >
                <div className="text-sm font-bold text-slate-700">{slot.startTime?.slice(0,5)}</div>
                <div className={`text-xs mt-1 font-semibold
                  ${slot.status === 'BOOKED' ? 'text-slate-500' :
                    slot.status === 'HELD'   ? 'text-amber-600' :
                    slot.status === 'BLOCKED'? 'text-red-500' :
                    'text-emerald-600'}`}>
                  {slot.status}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">₹{slot.price}</div>

                {(slot.status === 'AVAILABLE' || slot.status === 'BLOCKED') && (
                  <button onClick={() => handleToggle(slot.id)}
                    className={`mt-2 w-full py-1 rounded-lg text-xs font-bold transition-all
                      ${slot.status === 'BLOCKED'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                    {slot.status === 'BLOCKED' ? <><Unlock size={10} className="inline mr-1"/>Unblock</> : <><Lock size={10} className="inline mr-1"/>Block</>}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function Stat({ label, val, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className={`text-2xl font-black ${color}`}>{val}</div>
      <div className="text-xs text-slate-500 font-semibold mt-1">{label}</div>
    </div>
  );
}

function Skeleton({ n }) {
  return (
    <div className="space-y-3">
      {Array(n).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-2xl animate-pulse" />)}
    </div>
  );
}
