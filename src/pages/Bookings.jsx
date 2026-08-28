import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Receipt, MessageCircle, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function Bookings() {
  const { bookings, user } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="max-w-6xl mx-auto px-4 md:px-8 py-10 relative bg-white min-h-[85vh] text-slate-900"
    >
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-brand/5 rounded-full blur-[90px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-150 pb-6">
        <div>
          <span className="text-brand text-xs font-black uppercase tracking-widest">Dashboard</span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase mt-1 font-sports">
            My Booking History
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-semibold">
            View status confirmations, receipts, and WhatsApp owner dispatch tracking logs.
          </p>
        </div>
        <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full border border-brand bg-brand/10 flex items-center justify-center font-bold text-brand text-lg">
            🔥
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase leading-none mb-1">Active Streak</p>
            <p className="text-lg font-black text-slate-900 font-sports leading-none">{user.streakCount} Bookings</p>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-slate-50 p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Bookings Found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs font-semibold">
            You don't have any bookings yet. Head back to the scheduler to book your first slot!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-brand/30 transition-all duration-300 relative overflow-hidden shadow-sm"
            >
              {/* Left Column: Booking Details */}
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                {/* Date Badge */}
                <div className="w-16 h-16 rounded-xl bg-brand/10 border border-brand/20 flex flex-col items-center justify-center text-center">
                  <Calendar className="w-5 h-5 text-brand" />
                  <span className="text-[10px] text-brand font-black uppercase mt-1">Pitch 1</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white bg-brand px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider">
                      {booking.id}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">Created {booking.createdAt}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 font-sports uppercase tracking-tight">{booking.dateFormatted}</h3>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-sm text-slate-500 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand" />
                      <span>{booking.time} ({booking.duration})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand" />
                      <span>{booking.pitch}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & WhatsApp Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:border-l lg:border-slate-200 lg:pl-8">
                {/* Status Badges */}
                <div className="flex flex-col gap-2 font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">WhatsApp Alert:</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-lg border ${
                      booking.whatsappStatus === 'Delivered'
                        ? 'bg-brand/10 text-brand border-brand/20 animate-pulse'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      <MessageCircle className="w-3 h-3" />
                      {booking.whatsappStatus === 'Delivered' ? 'Delivered' : 'Sent'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Owner Alert:</span>
                    <span className="text-xs font-black text-slate-800">✅ Dispatch Completed</span>
                  </div>
                </div>

                {/* Price Details */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Total Paid</p>
                    <p className="text-2xl font-black text-brand font-sports leading-none">₹{booking.price}</p>
                  </div>
                  
                  <button className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-brand transition-all cursor-pointer shadow-sm">
                    <Receipt className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
