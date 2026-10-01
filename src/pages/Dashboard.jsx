import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { fetchSlots } from '../api/slots';
import { useSlotSocket } from '../hooks/useSlotSocket';

function getDates(n = 7) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: days[d.getDay()],
      dayNum:  d.getDate(),
      month:   months[d.getMonth()],
    };
  });
}

const STATUS_CONFIG = {
  AVAILABLE: { color: 'bg-emerald-400', label: 'Available', textColor: 'text-emerald-700' },
  HELD:      { color: 'bg-amber-400',   label: 'Held',      textColor: 'text-amber-700' },
  BOOKED:    { color: 'bg-slate-400',   label: 'Booked',    textColor: 'text-slate-600' },
  BLOCKED:   { color: 'bg-red-400',     label: 'Blocked',   textColor: 'text-red-600' },
};

export default function Dashboard() {
  const dates = getDates(7);
  const [selDate, setSelDate] = useState(dates[0].dateStr);
  const [slots, setSlots]     = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSlots(await fetchSlots(selDate));
    } finally {
      setLoading(false);
    }
  }, [selDate]);

  useEffect(() => { load(); }, [load]);

  useSlotSocket(selDate, (updated) => {
    setSlots((prev) => prev.map((s) => s.id === updated.id ? updated : s));
  });

  const counts = slots.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Activity className="text-brand" size={28} /> Live Slot Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Real-time availability — updates automatically</p>
        </div>
        <button onClick={() => navigate('/book')}
          className="px-5 py-2.5 bg-brand text-white rounded-2xl font-bold text-sm hover:bg-brand-dark transition-all shadow-md">
          Book Now →
        </button>
      </div>

      {/* Date strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {dates.map((d) => (
          <button key={d.dateStr} onClick={() => setSelDate(d.dateStr)}
            className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all
              ${selDate === d.dateStr ? 'bg-brand border-brand text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-brand/50'}`}>
            <span className="text-xs font-semibold">{d.dayName}</span>
            <span className="text-xl font-black">{d.dayNum}</span>
            <span className="text-xs">{d.month}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className={`w-3 h-3 rounded-full ${cfg.color} mb-2`} />
            <div className="text-2xl font-black text-slate-800">{counts[status] || 0}</div>
            <div className={`text-xs font-semibold ${cfg.textColor}`}>{cfg.label}</div>
          </div>
        ))}
      </div>

      {/* Slot map */}
      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Array(24).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {slots.map((slot, i) => {
            const cfg = STATUS_CONFIG[slot.status] || STATUS_CONFIG.AVAILABLE;
            return (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                title={`${slot.startTime?.slice(0,5)} — ${slot.status}`}
                className={`rounded-xl p-2 text-center border-2 transition-all
                  ${slot.status === 'AVAILABLE'
                    ? 'bg-emerald-50 border-emerald-200 cursor-pointer hover:scale-105 hover:shadow-md'
                    : slot.status === 'HELD'
                    ? 'bg-amber-50 border-amber-200'
                    : slot.status === 'BOOKED'
                    ? 'bg-slate-100 border-slate-200'
                    : 'bg-red-50 border-red-200'
                  }`}
                onClick={() => slot.status === 'AVAILABLE' && navigate('/book')}
              >
                <div className={`w-2 h-2 rounded-full ${cfg.color} mx-auto mb-1`} />
                <div className="text-xs font-bold text-slate-700">{slot.startTime?.slice(0,5)}</div>
                <div className="text-[10px] text-slate-500">₹{slot.price}</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 mt-6 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-2 text-xs text-slate-500">
            <span className={`w-3 h-3 rounded-full ${cfg.color}`} />
            {cfg.label}
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-slate-400 ml-auto">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live updates via WebSocket
        </div>
      </div>
    </div>
  );
}
