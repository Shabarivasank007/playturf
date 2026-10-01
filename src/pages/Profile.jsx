import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Shield, Calendar, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchMyBookingCount } from '../api/bookings';

export default function Profile() {
  const { user, logoutUser } = useApp();
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchMyBookingCount().then((r) => setCount(r.count)).catch(() => {});
  }, []);

  const tier = count >= 10 ? 'Gold' : count >= 5 ? 'Silver' : 'Bronze';
  const tierColors = { Gold: 'text-yellow-600 bg-yellow-50', Silver: 'text-slate-500 bg-slate-100', Bronze: 'text-orange-600 bg-orange-50' };
  const nextTier   = tier === 'Bronze' ? 5 : tier === 'Silver' ? 10 : null;
  const progress   = tier === 'Bronze' ? (count / 5) * 100 : tier === 'Silver' ? ((count - 5) / 5) * 100 : 100;

  const hasRealEmail = user?.email && !user.email.endsWith('@ddturf.user');

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-slate-800 mb-8">Profile</h1>

      {/* Avatar + name */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center text-white text-2xl font-black shadow-md">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-black text-xl text-slate-800">{user?.name}</div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tierColors[tier]}`}>{tier} Member</span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-5 space-y-3">
        {user?.phone && <InfoRow icon={<Phone size={15}/>} label="Mobile" val={user.phone} />}
        {user?.city && <InfoRow icon={<MapPin size={15}/>} label="City" val={user.city} />}
        {hasRealEmail ? (
          <InfoRow icon={<Mail size={15}/>} label="Email" val={user.email} />
        ) : (
          <InfoRow icon={<Mail size={15}/>} label="Email" val="Not provided" />
        )}
        <InfoRow icon={<Shield size={15}/>} label="Role" val={user?.role} />
        <InfoRow icon={<Calendar size={15}/>} label="Total Bookings" val={count} />
      </div>

      {/* Loyalty */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-5">
        <h3 className="font-bold text-slate-700 mb-3">Loyalty Progress</h3>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>{count} bookings</span>
          {nextTier ? <span>Next tier at {nextTier}</span> : <span>Max tier reached 🏆</span>}
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-brand rounded-full"
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          {[['Bronze','0–4 bookings','text-orange-600'],['Silver','5–9 bookings','text-slate-500'],['Gold','10+ bookings','text-yellow-600']].map(([t,d,c])=>(
            <div key={t} className={`p-2 rounded-xl border ${tier===t?'border-brand bg-brand/5':'border-slate-200'}`}>
              <div className={`font-bold ${c}`}>{t}</div>
              <div className="text-slate-400">{d}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={logoutUser}
        className="w-full py-3.5 border-2 border-red-200 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all">
        Sign Out
      </button>
    </div>
  );
}

function InfoRow({ icon, label, val }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <span className="text-sm text-slate-500 w-28">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{val}</span>
    </div>
  );
}
