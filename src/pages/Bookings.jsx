import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, Hash } from 'lucide-react';
import { fetchMyBookings, fetchMyBookingCount } from '../api/bookings';
import { useApp } from '../context/AppContext';

const STATUS_BADGE = {
  PAID:    'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  FAILED:  'bg-red-100 text-red-600',
};

export default function Bookings() {
  const { user, showToast } = useApp();
  const [bookings, setBookings] = useState([]);
  const [count, setCount]       = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([fetchMyBookings(), fetchMyBookingCount()])
      .then(([bks, cnt]) => {
        setBookings(bks);
        setCount(cnt.count);
      })
      .catch(() => showToast('Failed to load bookings', 'warning'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">My Bookings</h1>
        <p className="text-slate-500 mt-1">
          You've booked <span className="font-bold text-brand">{count}</span> time{count !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="h-28 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-semibold">No bookings yet</p>
          <a href="/book" className="mt-4 inline-block px-5 py-2.5 bg-brand text-white rounded-2xl text-sm font-bold hover:bg-brand-dark transition-all">
            Book Your First Slot →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <motion.div key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-slate-400" />
                    <span className="font-mono text-sm font-bold text-slate-700">{b.bookingReference}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                    <Calendar size={13} /> {b.date}
                    <Clock size={13} className="ml-2" /> {b.startTime?.slice(0,5)} – {b.endTime?.slice(0,5)}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[b.paymentStatus] || STATUS_BADGE.PENDING}`}>
                  {b.paymentStatus}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Chip label={`${b.duration} hr`} icon={<Clock size={12}/>} />
                {b.teamName && <Chip label={b.teamName} />}
                {b.numPlayers && <Chip label={`${b.numPlayers} players`} icon={<CheckCircle size={12}/>} />}
                <span className="ml-auto font-bold text-brand text-base">₹{b.totalAmount}</span>
              </div>

              {b.paymentStatus === 'PAID' && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    <CheckCircle size={12} /> Confirmed & Paid
                  </div>
                  <a
                    href={b.adminWhatsappUrl || `https://wa.me/916382022478?text=${encodeURIComponent(`*BOOKING DETAILS - DD TURF COIMBATORE*\nRef: ${b.bookingReference}\nDate: ${b.date}\nTime: ${b.startTime?.slice(0,5)} - ${b.endTime?.slice(0,5)}\nAmount: ₹${b.totalAmount}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/70 border border-emerald-300 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <span>💬 WhatsApp Admin (+91 6382022478)</span>
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ label, icon }) {
  return (
    <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">
      {icon}{label}
    </span>
  );
}
