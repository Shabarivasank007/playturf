import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, HelpCircle, AlertCircle, X, Check, Timer, MessageSquare, ArrowRight, Zap, MapPin } from 'lucide-react';

export default function Book() {
  const {
    dates,
    slots,
    selectedDate,
    setSelectedDate,
    activeHeldSlot,
    holdTimer,
    holdSlot,
    releaseHeldSlot,
    confirmBooking,
    user
  } = useApp();

  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [duration, setDuration] = useState(1); // 1h, 1.5h, 2h
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [lastBookingId, setLastBookingId] = useState('');
  
  // Tactical Pitch Selector state: 'pitchA' (5v5) vs 'pitchB' (7v7)
  const [selectedPitch, setSelectedPitch] = useState('pitchA');

  // Selected date's slots
  const baseSlots = slots[selectedDate] || [];
  
  // Dynamically adjust price and pitch configurations based on selected pitch
  const activeSlots = baseSlots.map(slot => {
    const rateMultiplier = selectedPitch === 'pitchB' ? 1.28 : 1; // 7v7 rates are higher
    return {
      ...slot,
      price: Math.round(slot.price * rateMultiplier)
    };
  });

  // Reset local modal state when hold releases from context
  useEffect(() => {
    if (!activeHeldSlot) {
      setBookingSlotId(null);
    }
  }, [activeHeldSlot]);

  const handleSlotClick = (slot) => {
    if (slot.status === 'available') {
      holdSlot(selectedDate, slot.id);
      setBookingSlotId(slot.id);
      setDuration(1);
      setBookingSuccess(false);
    }
  };

  const handleCloseModal = () => {
    if (activeHeldSlot) {
      releaseHeldSlot(activeHeldSlot.date, activeHeldSlot.slotId);
    }
    setBookingSlotId(null);
  };

  const handleConfirm = () => {
    if (activeHeldSlot) {
      const result = confirmBooking(activeHeldSlot.date, activeHeldSlot.slotId, duration);
      if (result) {
        setLastBookingId(result.id);
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSlotId(null);
          setBookingSuccess(false);
        }, 4000);
      }
    }
  };

  const selectedSlot = activeSlots.find(s => s.id === bookingSlotId);
  const priceEstimate = selectedSlot ? Math.round(selectedSlot.price * duration) : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Determine current active step for the progress tracker
  const getActiveStep = () => {
    if (bookingSuccess) return 3;
    if (bookingSlotId !== null) return 2;
    return 1;
  };

  // Framer Motion staggered loading configurations
  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const cardVariants = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative bg-white min-h-[80vh] text-slate-900"
    >
      <div className="absolute top-10 left-1/3 w-[300px] h-[300px] bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Booking Steps Progress Tracker */}
      <div className="max-w-3xl mx-auto mb-8 hidden md:block">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 relative">
          {/* Connector bar */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-brand -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: getActiveStep() === 1 ? '0%' : getActiveStep() === 2 ? '50%' : '100%' }}
          />

          <div className="z-10 flex flex-col items-center gap-1 bg-white px-4">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold ${
              getActiveStep() >= 1 ? 'bg-brand text-white border-brand' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>1</span>
            <span className={getActiveStep() >= 1 ? 'text-brand' : ''}>Choose Session</span>
          </div>

          <div className="z-10 flex flex-col items-center gap-1 bg-white px-4">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold ${
              getActiveStep() >= 2 ? 'bg-brand text-white border-brand' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>2</span>
            <span className={getActiveStep() >= 2 ? 'text-brand' : ''}>Secure Timer Hold</span>
          </div>

          <div className="z-10 flex flex-col items-center gap-1 bg-white px-4">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold ${
              getActiveStep() >= 3 ? 'bg-brand text-white border-brand' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>3</span>
            <span className={getActiveStep() >= 3 ? 'text-brand' : ''}>WhatsApp Dispatch</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
        <div>
          <span className="text-brand text-xs font-black uppercase tracking-widest flex items-center gap-1.5 leading-none mb-2">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Arena Reservation
          </span>
          <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight uppercase font-sports leading-none">
            DD TURF
          </h2>
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-brand" />
            <span>Near MERLIS HOTEL, Avinashi Road, Goldwins, Coimbatore - 641014</span>
          </div>
        </div>

        {/* Date Selector Strip */}
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto self-start">
          {dates.slice(0, 5).map((date) => (
            <button
              key={date.dateStr}
              onClick={() => {
                if (activeHeldSlot) releaseHeldSlot(activeHeldSlot.date, activeHeldSlot.slotId);
                setSelectedDate(date.dateStr);
              }}
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

      {/* Advanced UI: Interactive Tactical Pitch Selector Map */}
      <div className="mb-8">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3.5">
          Select Pitch Layout (Coimbatore DD Turf Arena)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pitch A (5v5) */}
          <div
            onClick={() => {
              if (activeHeldSlot) releaseHeldSlot(activeHeldSlot.date, activeHeldSlot.slotId);
              setSelectedPitch('pitchA');
            }}
            className={`cursor-pointer rounded-2xl border p-5 flex items-center justify-between transition-all duration-300 ${
              selectedPitch === 'pitchA'
                ? 'bg-brand/5 border-brand ring-1 ring-brand shadow-md'
                : 'bg-slate-50 border-slate-200 hover:border-slate-350'
            }`}
          >
            <div>
              <span className={`inline-block text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md ${
                selectedPitch === 'pitchA' ? 'bg-brand text-white' : 'bg-slate-200 text-slate-600'
              }`}>PITCH A (5v5 Astroturf)</span>
              <h4 className="text-lg font-extrabold mt-2 font-sports text-slate-900 uppercase">Futsal & 5v5 Court</h4>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Perfect for quick matches. Rates start from ₹70/hr.</p>
            </div>
            {/* Interactive mini-stadium schematic icon */}
            <div className="w-20 h-12 border-2 border-slate-300 rounded-lg relative overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#047857]/5">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 -translate-x-1/2" />
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              {selectedPitch === 'pitchA' && (
                <div className="absolute inset-0 bg-brand/10 border border-brand flex items-center justify-center text-brand font-black text-xs">ACTIVE</div>
              )}
            </div>
          </div>

          {/* Pitch B (7v7) */}
          <div
            onClick={() => {
              if (activeHeldSlot) releaseHeldSlot(activeHeldSlot.date, activeHeldSlot.slotId);
              setSelectedPitch('pitchB');
            }}
            className={`cursor-pointer rounded-2xl border p-5 flex items-center justify-between transition-all duration-300 ${
              selectedPitch === 'pitchB'
                ? 'bg-brand/5 border-brand ring-1 ring-brand shadow-md'
                : 'bg-slate-50 border-slate-200 hover:border-slate-350'
            }`}
          >
            <div>
              <span className={`inline-block text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md ${
                selectedPitch === 'pitchB' ? 'bg-brand text-white' : 'bg-slate-200 text-slate-600'
              }`}>PITCH B (7v7 Arena)</span>
              <h4 className="text-lg font-extrabold mt-2 font-sports text-slate-900 uppercase">Championship Field</h4>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Sideline benches & high fencing. Rates start from ₹90/hr.</p>
            </div>
            {/* Interactive mini-stadium schematic icon */}
            <div className="w-20 h-12 border-2 border-slate-300 rounded-lg relative overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#047857]/5">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 -translate-x-1/2" />
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              {selectedPitch === 'pitchB' && (
                <div className="absolute inset-0 bg-brand/10 border border-brand flex items-center justify-center text-brand font-black text-xs">ACTIVE</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time Slot Grid with Staggered Load Animation */}
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3.5">
        Select Hourly Session ({dates.find(d => d.dateStr === selectedDate)?.dayName}, {dates.find(d => d.dateStr === selectedDate)?.monthName} {dates.find(d => d.dateStr === selectedDate)?.dayNum})
      </h3>
      <motion.div 
        variants={gridVariants}
        initial="hidden"
        animate="show"
        key={`${selectedDate}-${selectedPitch}`} // Re-triggers animations when date or pitch is toggled!
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        {activeSlots.map((slot) => {
          const isAvailable = slot.status === 'available';
          const isBooked = slot.status === 'booked';
          const isHeld = slot.status === 'held';
          const isBlocked = slot.status === 'blocked';
          
          let cardStyle = '';
          let textStyle = '';
          let badgeText = 'Available';
          let badgeStyle = '';

          if (isAvailable) {
            cardStyle = 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-brand hover:bg-brand/5 hover:scale-[1.01]';
            textStyle = 'text-slate-900 font-extrabold';
            badgeText = 'Available';
            badgeStyle = 'text-emerald-600 bg-emerald-50 border-emerald-200';
          } else if (isBooked) {
            cardStyle = 'bg-slate-50 border-slate-150 opacity-60 booked-stripes cursor-not-allowed';
            textStyle = 'text-slate-400 line-through';
            badgeText = 'Sold Out';
            badgeStyle = 'text-slate-55 bg-slate-100 border-slate-250';
          } else if (isHeld) {
            const isMe = slot.heldBy === 'me';
            cardStyle = isMe 
              ? 'bg-brand border-brand text-white glow-red animate-pulse' 
              : 'bg-slate-50 border-slate-150 opacity-75 cursor-not-allowed';
            textStyle = isMe ? 'text-white font-black' : 'text-slate-400';
            badgeText = isMe ? 'Hold Active' : 'Lock Held';
            badgeStyle = isMe 
              ? 'text-white bg-red-800/40 border-red-500/50'
              : 'text-amber-600 bg-amber-50 border-amber-200';
          } else if (isBlocked) {
            cardStyle = 'bg-slate-100 border-slate-200 opacity-40 cursor-not-allowed';
            textStyle = 'text-slate-400';
            badgeText = 'Blocked';
            badgeStyle = 'text-slate-500 bg-slate-200 border-slate-350';
          }

          return (
            <motion.div
              key={slot.id}
              variants={cardVariants}
              onClick={() => !isBooked && !isBlocked && !isHeld && handleSlotClick(slot)}
              whileTap={isAvailable ? { scale: 0.96 } : {}}
              className={`p-5 rounded-xl border flex flex-col justify-between h-36 transition-all duration-200 ${cardStyle}`}
            >
              <div>
                <span className={`inline-flex items-center text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                  {badgeText}
                </span>
                <h3 className={`text-2xl font-sports mt-3 ${textStyle}`}>{slot.time}</h3>
              </div>
              <div className="flex justify-between items-center mt-3 text-xs font-bold text-slate-500">
                <span className="opacity-75">{selectedPitch === 'pitchA' ? '5v5 Astroturf' : '7v7 Arena'}</span>
                <span className="text-slate-800">₹{slot.price}/hr</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sticky Bottom Active Hold Bar */}
      <AnimatePresence>
        {activeHeldSlot && !bookingSlotId && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100%-2rem)] bg-white border border-brand/35 p-4 rounded-xl shadow-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand animate-pulse">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase leading-none mb-1">Checkout Lock Active</p>
                <p className="text-sm font-extrabold text-slate-900">
                  Secured for {formatTime(holdTimer)}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setBookingSlotId(activeHeldSlot.slotId)}
              className="bg-brand hover:bg-brand-dark text-white font-black text-xs uppercase px-5 py-2.5 rounded-lg shadow-lg shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Complete Booking
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Flow Modal */}
      <AnimatePresence>
        {bookingSlotId && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-filter backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 z-10 text-slate-900"
            >
              {/* Confetti Explosion */}
              {bookingSuccess && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
                  {[...Array(24)].map((_, i) => {
                    const angle = (i / 24) * 360;
                    const velocity = 85;
                    const rad = (angle * Math.PI) / 180;
                    const xDest = Math.cos(rad) * velocity;
                    const yDest = Math.sin(rad) * velocity;

                    return (
                      <motion.div
                        key={i}
                        initial={{ x: "0%", y: "0%", scale: 1, rotate: 0 }}
                        animate={{ 
                          x: `${xDest}px`, 
                          y: `${yDest}px`, 
                          scale: 0, 
                          rotate: 360,
                          opacity: [1, 1, 0]
                        }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="absolute left-1/2 top-1/2 w-3.5 h-3.5 rounded-full"
                        style={{
                          backgroundColor: ['#e30613', '#ff4d4d', '#0f172a', '#64748b', '#cbd5e1'][i % 5]
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {!bookingSuccess && (
                <button
                  onClick={handleCloseModal}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {bookingSuccess ? (
                <div className="text-center py-6 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    className="w-16 h-16 rounded-full bg-brand flex items-center justify-center mb-6 glow-red border-2 border-white shadow-md"
                  >
                    <Check className="w-8 h-8 text-white stroke-[3px]" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-black text-slate-955 uppercase tracking-tight font-sports">Reservation Secured!</h3>
                  <p className="text-xs text-brand mt-1 font-extrabold uppercase">Booking ID: {lastBookingId}</p>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 w-full my-6 text-left space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2.5">
                      <span className="text-slate-500 font-bold">Turf Location</span>
                      <span className="text-slate-900 font-extrabold">DD Turf, Coimbatore</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2.5">
                      <span className="text-slate-500 font-bold">Pitch Layout</span>
                      <span className="text-slate-900 font-extrabold">
                        {selectedPitch === 'pitchA' ? 'Pitch A (5v5 astroturf)' : 'Pitch B (7v7 arena)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2.5">
                      <span className="text-slate-500 font-bold">Session Time</span>
                      <span className="text-slate-900 font-extrabold">{selectedSlot.time} ({duration === 1 ? '1 Hr' : duration === 1.5 ? '1.5 Hrs' : '2 Hrs'})</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">Amount Paid</span>
                      <span className="text-brand font-black font-sports text-lg">₹{priceEstimate}</span>
                    </div>
                  </div>

                  <div className="bg-red-50/80 border border-red-200 text-brand text-xs py-3 px-4 rounded-xl flex items-center gap-3 w-full justify-center">
                    <span className="font-bold text-center">
                      ✅ Booking confirmed! Receipts dispatched to athlete WhatsApp.
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2.5 mb-6 text-brand">
                    <Timer className="w-5 h-5 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-brand">
                      Redis Hold Locked: {formatTime(holdTimer)}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-sports">Confirm Reservation</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Configure your match options to complete booking.</p>

                  <div className="space-y-5 mt-6">
                    <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Time Slot</span>
                        <p className="text-sm font-extrabold text-slate-800 mt-0.5">{selectedSlot.time}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Hourly Price</span>
                        <p className="text-sm font-extrabold text-brand mt-0.5">₹{selectedSlot.price}/hr</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Match Duration
                      </label>
                      <div className="flex gap-2">
                        {[1, 1.5, 2].map((dur) => (
                          <button
                            key={dur}
                            onClick={() => setDuration(dur)}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold uppercase border transition-all cursor-pointer ${
                              duration === dur
                                ? 'bg-brand border-brand text-white font-black'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            {dur === 1 ? '1 Hr' : dur === 1.5 ? '1.5 Hrs' : '2 Hrs'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Estimated Cost</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Includes service fees & tax</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-brand font-sports">₹{priceEstimate}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-3.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="flex-1 bg-brand hover:bg-brand-dark text-white font-black text-sm py-3.5 rounded-lg shadow-md shadow-brand/10 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
