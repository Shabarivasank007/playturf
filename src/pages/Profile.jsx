import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Trophy, Award, Flame, ChevronRight, Compass, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useApp();

  const nextRewardTarget = 10;
  const currentLevelCount = user.bookingsCount;
  const progressPercent = Math.min(100, (currentLevelCount / nextRewardTarget) * 100);

  const getTierDetails = () => {
    switch (user.tier) {
      case 'Gold':
        return {
          color: 'from-amber-400 to-yellow-600',
          textColor: 'text-amber-600',
          desc: '15% discount on all evening slots + free equipment rental',
          bonus: 'Gold Club Access'
        };
      case 'Silver':
        return {
          color: 'from-slate-300 to-slate-500',
          textColor: 'text-slate-500',
          desc: '10% discount on peak hours + booking holds extended to 10m',
          bonus: 'Priority holds enabled'
        };
      case 'Bronze':
      default:
        return {
          color: 'from-amber-700 to-amber-950',
          textColor: 'text-amber-800',
          desc: 'Standard pricing. Play 5 more matches to unlock Silver',
          bonus: 'Base club member'
        };
    }
  };

  const tier = getTierDetails();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="max-w-6xl mx-auto px-4 md:px-8 py-10 relative bg-white min-h-[85vh] text-slate-900"
    >
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-brand/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar & Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full border-4 border-brand overflow-hidden shadow-md mb-4 bg-slate-200">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.src = "https://api.dicebear.com/7.x/pixel-art/svg?seed=ronaldo";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-brand/10 text-brand">
                  R9
                </div>
              )}
              {/* Badge overlay */}
              <div className="absolute bottom-1 right-1 bg-brand p-1.5 rounded-full border border-white text-white">
                <Flame className="w-4 h-4 fill-current text-white animate-bounce" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 font-sports uppercase leading-none">{user.name}</h2>
            <span className={`inline-block font-extrabold text-[10px] tracking-widest uppercase mt-2 px-3 py-1 rounded-lg bg-gradient-to-r ${tier.color} text-white`}>
              {user.tier} Member
            </span>

            {/* Info details */}
            <div className="w-full border-t border-slate-200 mt-6 pt-6 text-left space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase leading-none mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase leading-none mb-1">WhatsApp Contact</p>
                  <p className="text-sm font-bold text-slate-800">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase leading-none mb-1">Membership ID</p>
                  <p className="text-sm font-bold text-slate-800">TC-9082-A</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Streaks & Progress Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Streaks & Loyalty metrics */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Trophy className="w-32 h-32 text-brand" />
            </div>

            <span className="text-brand text-xs font-black uppercase tracking-widest">Rewards Program</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase mt-1 font-sports">
              Loyalty Club Dashboard
            </h2>

            {/* Streak card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              
              <div className="bg-brand/5 border border-brand/20 p-5 rounded-xl flex items-center gap-4 hover:bg-brand/10 transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
                  <Flame className="w-7 h-7 text-brand fill-current" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-extrabold uppercase">Weekly Streak</p>
                  <h3 className="text-2xl font-black text-slate-900 font-sports mt-0.5">{user.streakCount} Matches 🔥</h3>
                  <p className="text-[10px] text-brand font-bold uppercase mt-0.5">Keep playing to maintain streak!</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center gap-4 hover:bg-slate-100 transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-brand" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-extrabold uppercase">Total Bookings</p>
                  <h3 className="text-2xl font-black text-slate-900 font-sports mt-0.5">{user.bookingsCount} Games</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{tier.bonus}</p>
                </div>
              </div>

            </div>

            {/* Progress to next reward */}
            <div className="mt-8 border-t border-slate-200 pt-8">
              <div className="flex items-center justify-between text-sm mb-2 font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand" />
                  Next Tier: Gold Member
                </span>
                <span className="text-brand font-extrabold">{currentLevelCount} / {nextRewardTarget} Bookings</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-300/40">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-brand h-full rounded-full"
                />
              </div>
              
              <div className="flex justify-between items-center mt-3 text-xs text-slate-500 font-semibold">
                <span>Silver Benefits Active</span>
                <span className="text-brand font-bold">
                  {nextRewardTarget - currentLevelCount > 0 
                    ? `${nextRewardTarget - currentLevelCount} more bookings for next tier discount`
                    : 'Target reached! Processing rewards'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Membership tier benefits info */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 font-sports uppercase tracking-tight">Membership Benefits Breakdown</h3>
            <div className="space-y-3 font-semibold text-slate-700">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-200 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
                  <span>Bronze (0-4 bookings)</span>
                </div>
                <span className="text-xs text-slate-400 font-bold uppercase">Base privileges</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-brand/5 border border-brand/20 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
                  <span className="font-extrabold text-slate-900">Silver (5-19 bookings)</span>
                </div>
                <span className="text-xs text-brand font-black uppercase">10% peak discount active</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-200 text-sm opacity-60">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Gold (20+ bookings)</span>
                </div>
                <span className="text-xs text-slate-400 font-bold uppercase">15% discount + free gear</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
