import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { ShieldCheck, BarChart3, Settings, Users, Calendar, Power, AlertCircle, Wrench } from 'lucide-react';

export default function Admin() {
  const { dates, slots, selectedDate, setSelectedDate, toggleBlockSlot } = useApp();
  
  // Calculate summary metrics for today
  const activeDateSlots = slots[selectedDate] || [];
  
  const bookedCount = activeDateSlots.filter(s => s.status === 'booked').length;
  const heldCount = activeDateSlots.filter(s => s.status === 'held').length;
  const blockedCount = activeDateSlots.filter(s => s.status === 'blocked').length;
  const availableCount = activeDateSlots.filter(s => s.status === 'available').length;

  const estimatedRevenue = activeDateSlots
    .filter(s => s.status === 'booked')
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative bg-white min-h-[85vh] text-slate-900"
    >
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-200 pb-6">
        <div>
          <span className="text-brand text-xs font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
            <ShieldCheck className="w-4 h-4 text-brand" />
            Security Level: Owner Dashboard
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase mt-1 font-sports">
            Arena Manager Console
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-semibold">
            Control slots status, declare pitch maintenance, and audit real-time bookings.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto self-start">
          {dates.map((date) => (
            <button
              key={date.dateStr}
              onClick={() => setSelectedDate(date.dateStr)}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold tracking-widest uppercase transition-all flex-shrink-0 cursor-pointer ${
                selectedDate === date.dateStr
                  ? 'bg-brand text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              {date.dayName} {date.dayNum}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 font-extrabold uppercase">Today's Revenue</p>
          <h3 className="text-2xl font-black text-brand mt-1 font-sports">₹{estimatedRevenue}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">From active booked slots</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 font-extrabold uppercase">Confirmed Bookings</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-sports">{bookedCount} Slots</h3>
          <p className="text-[10px] text-brand mt-1 font-extrabold uppercase">{Math.round((bookedCount / activeDateSlots.length) * 100)}% utilization</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 font-extrabold uppercase">Held/In Checkout</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1 font-sports">{heldCount} Slots</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Temporary Redis holds</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 font-extrabold uppercase">Under Maintenance</p>
          <h3 className="text-2xl font-black text-red-500 mt-1 font-sports">{blockedCount} Slots</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Blocked on user scheduler</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Slot Administration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand" />
                <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight font-sports">
                  Slot Controls Grid
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold">Click slots to block for maintenance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeDateSlots.map((slot) => {
                const isBlocked = slot.status === 'blocked';
                const isBooked = slot.status === 'booked';
                const isHeld = slot.status === 'held';

                let cardStyle = '';
                let statusStyle = '';

                if (isBlocked) {
                  cardStyle = 'bg-red-50 border-red-200 text-red-800';
                  statusStyle = 'text-red-600';
                } else if (isBooked) {
                  cardStyle = 'bg-white border-slate-200 text-slate-400 font-bold opacity-60';
                  statusStyle = 'text-slate-500';
                } else if (isHeld) {
                  cardStyle = 'bg-amber-50 border-amber-200 text-amber-800';
                  statusStyle = 'text-amber-600';
                } else {
                  cardStyle = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';
                  statusStyle = 'text-emerald-600';
                }

                return (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${cardStyle}`}
                  >
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{slot.time}</p>
                      <p className="text-[10px] font-extrabold uppercase text-slate-400 mt-0.5 leading-none">
                        Status: <span className={`font-black ${statusStyle}`}>{slot.status}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => toggleBlockSlot(selectedDate, slot.id)}
                      disabled={isBooked || isHeld}
                      className={`p-2.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                        isBooked || isHeld
                          ? 'opacity-20 cursor-not-allowed border-slate-200 bg-transparent text-slate-300'
                          : isBlocked
                          ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-brand hover:border-brand/40'
                      }`}
                      title={isBlocked ? 'Unblock Slot' : 'Block Slot'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dashboard Bookings List Audit */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
              <Users className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight font-sports">
                Activity Audit
              </h2>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {activeDateSlots.filter(s => s.status === 'booked' || s.status === 'held').length === 0 ? (
                <div className="text-center py-10">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase">No reservations recorded.</p>
                </div>
              ) : (
                activeDateSlots
                  .filter(s => s.status === 'booked' || s.status === 'held')
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-sm shadow-sm"
                    >
                      <div>
                        <p className="font-extrabold text-slate-900">{slot.time}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {slot.status === 'booked' ? `Booked by ${slot.bookedBy}` : 'Held by anonymous'}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                        slot.status === 'booked' 
                          ? 'bg-brand/10 text-brand border-brand/20' 
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
