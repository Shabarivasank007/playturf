import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Zap, Calendar, ArrowRight, ShieldCheck, Trophy, Sparkles, Award, MapPin, Grid, Camera, ChevronDown, Check, Clock, Eye } from 'lucide-react';

const pitchesData = [
  {
    id: 1,
    category: "5-a-side",
    name: "Astroturf Pitch A (5v5)",
    desc: "Perfect for fast-paced mini matches. High quality astroturf with rubber granule infill.",
    rate: 70,
    icon: Trophy
  },
  {
    id: 2,
    category: "5-a-side",
    name: "Astroturf Pitch B (5v5)",
    desc: "Equipped with shockpad shock-absorption backing. Ideal for friendly runarounds and kids games.",
    rate: 70,
    icon: Award
  },
  {
    id: 3,
    category: "7-a-side",
    name: "Stadium Arena Field (7v7)",
    desc: "Full-sized Coimbatore local arena configuration with high floodlights and spectator sideline benches.",
    rate: 90,
    icon: Sparkles
  },
  {
    id: 4,
    category: "7-a-side",
    name: "Championship Turf C (7v7)",
    desc: "Double netted side boundary. Optimized for high intensity league tournaments and training camps.",
    rate: 95,
    icon: Trophy
  },
  {
    id: 5,
    category: "Futsal",
    name: "Wooden Futsal Court A",
    desc: "Polished hardwood flooring with official futsal lines. Perfect for professional indoor futsal leagues.",
    rate: 80,
    icon: Sparkles
  },
  {
    id: 6,
    category: "Futsal",
    name: "Wooden Futsal Court B",
    desc: "Indoor AC climate controlled arena. Equipment locker access and scoreboard available.",
    rate: 85,
    icon: Trophy
  }
];

const galleryPhotos = [
  { id: 1, src: "/DD turf image.jpg", title: "Main Arena", colSpan: "md:col-span-2 md:row-span-2", size: "7-a-side" },
  { id: 2, src: "/turf image2.jpg", title: "Astroturf Pitch A", colSpan: "", size: "5-a-side" },
  { id: 3, src: "/turf5.png", title: "Stadium Under Lights", colSpan: "md:col-span-1 md:row-span-2", size: "Championship" },
  { id: 4, src: "/turf image3.jpg", title: "Sideline spectator lounge", colSpan: "", size: "Lounge" },
  { id: 5, src: "/turf image4.jpg", title: "Match Action Nets", colSpan: "md:col-span-2", size: "Pitch B" }
];

const faqData = [
  {
    id: 1,
    q: "How does the 5-minute Redis checkout lock work?",
    a: "When you select an available hour slot, our system flags it as 'held' for 5 minutes. This locks the slot exclusively to your account, giving you time to choose match durations and finalize payments without anyone else booking it."
  },
  {
    id: 2,
    q: "What is your peak hours slot pricing configuration?",
    a: "Standard rates apply for morning and afternoon slots. Peak rates apply after 5:00 PM when our professional floodlight systems are active. Toggling between Pitch A (5v5) and Pitch B (7v7) updates slots rates dynamically."
  },
  {
    id: 3,
    q: "Do you provide football accessories (bibs, balls, pumps)?",
    a: "Yes, we provide official match balls and training bibs for free at our counter. Goldwins members also get access to shoe rentals and equipment lockers free of cost."
  },
  {
    id: 4,
    q: "What is the cancellation and rescheduling policy?",
    a: "You can cancel or reschedule any session up to 2 hours before your slot starts directly from your My Bookings history dashboard. Cancelled bookings are instantly credited back as club vouchers."
  }
];

const loyaltyTiersData = [
  { name: "Bronze Member", requirement: "0-4 bookings", benefits: ["Standard pricing", "5m slot hold timer", "Standard support"] },
  { name: "Silver Member", requirement: "5-19 bookings", benefits: ["10% discount on peak slots", "10m slot hold timer", "Priority slot notifications", "Free drinking water"] },
  { name: "Gold Member", requirement: "20+ bookings", benefits: ["15% discount on all slots", "15m slot hold timer", "Free bibs & balls rental", "Sideline lounge reservation"] }
];

export default function Home() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [openFaq, setOpenFaq] = useState(null);
  
  // Parallax Scroll Tracking
  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax background transform offset
  const parallaxBgY = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  const handleBookNow = () => {
    navigate('/book');
  };

  const filteredPitches = activeFilter === 'All'
    ? pitchesData
    : pitchesData.filter(p => p.category === activeFilter);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="relative min-h-screen bg-white text-slate-900 overflow-hidden"
    >
      {/* Full Home Page Border Linear Gradients - Left and Right */}
      <div className="absolute top-0 bottom-0 left-0 w-28 bg-gradient-to-r from-brand/15 via-brand/3 to-transparent z-35 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-28 bg-gradient-to-l from-brand/15 via-brand/3 to-transparent z-35 pointer-events-none" />
      
      {/* Full-Screen Background Video */}
      <div className="absolute inset-0 w-full h-[90vh] md:h-screen z-0 overflow-hidden bg-white">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/slideshow.mp4" type="video/mp4" />
        </video>
        
        {/* Red duotone sports filter */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-[#e30613]/55 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/50 z-10" />
        
        {/* Background text decoration */}
        <div className="absolute bottom-10 right-10 z-10 select-none pointer-events-none hidden lg:block opacity-5">
          <span className="text-[14vw] font-black tracking-tighter text-[#e30613] font-sports uppercase leading-none">
            DD TURF
          </span>
        </div>
      </div>

      {/* Hero Content Card Overlay (Left-aligned) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-16 md:pt-48 min-h-[90vh] md:min-h-screen flex flex-col justify-center">
        
        {/* Left Side Booking Panel - Light, Transparent Glassmorphic */}
        <div className="max-w-lg text-left bg-white/40 backdrop-blur-lg border border-white/60 shadow-2xl p-7 rounded-3xl relative overflow-hidden mt-6 lg:mt-12 text-slate-900 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-black uppercase tracking-wider mb-4 animate-pulse">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Redis Lock Active
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 font-sports leading-none">
            DD TURF
          </h1>
          
          <div className="flex items-start gap-1.5 text-xs md:text-sm text-slate-600 font-bold mt-3">
            <MapPin className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
            <span>Near MERLIS HOTEL, Avinashi Road, Goldwins, Coimbatore - 641014</span>
          </div>

          <p className="mt-4 text-sm md:text-base text-slate-700 leading-relaxed font-semibold">
            Reserve premium local turf fields in seconds. Secure your preferred session instantly for 5 minutes during checkout to protect against overlapping slots.
          </p>

          <div className="grid grid-cols-2 gap-3.5 my-6 text-xs md:text-sm text-slate-700 font-bold border-t border-slate-200/60 pt-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>Instant Redis Hold</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>WhatsApp Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>Peak-Pricing System</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>Weekly Streaks</span>
            </div>
          </div>

          <button
            onClick={handleBookNow}
            className="w-full bg-brand hover:bg-brand-dark text-white font-black text-lg py-3.5 rounded-lg shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>BOOK NOW</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Infinite Ticker Marquee Loop */}
      <div className="bg-slate-950 py-5 overflow-hidden select-none flex border-y border-slate-900 z-30 relative">
        {/* Left Side Red Linear Gradient Overlay */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-brand/50 to-transparent z-45 pointer-events-none" />
        {/* Right Side Red Linear Gradient Overlay */}
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-brand/50 to-transparent z-45 pointer-events-none" />

        <motion.div
          className="flex gap-20 whitespace-nowrap text-white/50 text-xs font-black tracking-widest uppercase items-center"
          animate={{ x: [0, -1030] }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        >
          <span>🏆 DD Premier Tournament Goldwins</span>
          <span>⚽ 5v5 astroturf and 7v7 stadium</span>
          <span>⚡ Redis spot lock session security</span>
          <span>🔥 weekly match streak multipliers</span>
          <span>🔔 whatsapp receipt notifications</span>
          <span>⭐ Coimbatore's five star arena</span>
          {/* Duplicate loop */}
          <span>🏆 DD Premier Tournament Goldwins</span>
          <span>⚽ 5v5 astroturf and 7v7 stadium</span>
          <span>⚡ Redis spot lock session security</span>
          <span>🔥 weekly match streak multipliers</span>
          <span>🔔 whatsapp receipt notifications</span>
          <span>⭐ Coimbatore's five star arena</span>
        </motion.div>
      </div>

      {/* Advanced UI: Live Slot Occupancy & Quick Launcher Widget */}
      <div className="relative z-30 bg-slate-50 border-b border-slate-200 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left panel: Circular stats */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5 shadow-sm">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-brand"
                  strokeDasharray="75, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: "75, 100" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-sports text-xl font-black text-slate-800">
                75%
              </div>
            </div>
            <div>
              <span className="text-[10px] text-brand font-black uppercase tracking-widest">Live Capacity</span>
              <h4 className="text-base font-extrabold text-slate-900 mt-0.5 leading-none">Pitches Occupied Today</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1.5">12 of 16 reservation blocks secured.</p>
            </div>
          </div>

          {/* Right panel: Quick Booking Launchers */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="max-w-md">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Quick checkout Launcher</span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 leading-none">Immediate Available Slots</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1.5">Click any open session block below to lock the pitch instantly.</p>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={handleBookNow} 
                className="bg-slate-50 border border-slate-200 hover:border-brand px-3.5 py-2.5 rounded-xl text-left hover:bg-brand/5 group transition-all cursor-pointer flex items-center gap-3"
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-black text-slate-800 leading-none">06:00 PM</p>
                  <span className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5 block group-hover:underline">Pitch A (5v5)</span>
                </div>
              </button>
              <button 
                onClick={handleBookNow} 
                className="bg-slate-50 border border-slate-200 hover:border-brand px-3.5 py-2.5 rounded-xl text-left hover:bg-brand/5 group transition-all cursor-pointer flex items-center gap-3"
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-black text-slate-800 leading-none">08:00 PM</p>
                  <span className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5 block group-hover:underline">Pitch B (7v7)</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Section 2: BookMyShow-style Arena Pitch Categories with 3D Hover Tilt */}
      <div className="relative z-30 bg-white py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-brand text-sm font-bold uppercase tracking-wider">Quick Reservation</span>
              <h2 className="text-4xl font-extrabold uppercase tracking-tight text-slate-900 font-sports mt-1">
                Explore Arena Categories
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {['All', '5-a-side', '7-a-side', 'Futsal'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-extrabold tracking-widest uppercase border transition-all cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-brand border-brand text-white shadow-md'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter === 'All' ? 'All Courts' : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Staggered Grid with 3D Tilt Card animations */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={activeFilter}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredPitches.map((pitch) => {
                const Icon = pitch.icon;
                return (
                  <motion.div
                    key={pitch.id}
                    variants={itemVariants}
                    layout
                    exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
                    className="[perspective:1000px]"
                  >
                    <motion.div
                      whileHover={{ 
                        rotateY: 8, 
                        rotateX: -4, 
                        scale: 1.025,
                        boxShadow: "0 15px 30px rgba(227, 6, 19, 0.08)"
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:border-brand transition-colors duration-300 flex flex-col justify-between h-72 shadow-sm"
                    >
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-5">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 uppercase font-sports leading-none">{pitch.name}</h3>
                        <p className="text-sm text-slate-500 mt-3 font-semibold leading-relaxed">
                          {pitch.desc}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-slate-200 pt-5 text-sm font-bold mt-5">
                        <span className="text-slate-600 uppercase tracking-wide">Rate: ₹{pitch.rate}/hr</span>
                        <button 
                          onClick={handleBookNow} 
                          className="text-brand hover:text-brand-dark flex items-center gap-1 hover:underline cursor-pointer font-extrabold"
                        >
                          Select Slots
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>

      {/* Advanced UI: Framer Motion Scroll-Driven Parallax Banner */}
      <div 
        ref={parallaxRef}
        className="relative h-96 overflow-hidden z-30 border-y border-slate-200 flex items-center justify-center bg-[#120303]"
      >
        <motion.div
          style={{ 
            y: parallaxBgY, 
            backgroundImage: "url('/turf5.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%'
          }}
          className="absolute inset-0 w-full h-[130%] -top-[15%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/95" />
        <div className="absolute inset-0 bg-[#e30613]/25 mix-blend-color" />
        
        {/* Content banner */}
        <div className="relative text-center px-6 max-w-3xl text-white">
          <span className="text-brand text-xs font-black uppercase tracking-widest bg-brand/20 px-3.5 py-1 rounded-full border border-brand/35 inline-block">DD Turf Coimbatore</span>
          <h2 className="text-4xl md:text-5xl font-black uppercase font-sports mt-5 tracking-tight leading-none">
            Dominate Coimbatore's Elite Field
          </h2>
          <p className="text-slate-200 mt-4 text-sm md:text-base font-semibold leading-relaxed">
            Standard-compliant 5-a-side and 7-a-side playgrounds. Top-tier synthetic astroturf layout, complete with night match floodlights, net protection boundaries, and change rooms.
          </p>
        </div>
      </div>

      {/* Section 3: Facility Photo Gallery (Masonry style using local photos) */}
      <div className="relative z-30 bg-white py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-brand text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Camera className="w-4.5 h-4.5" />
              Live Tour
            </span>
            <h2 className="text-4xl font-extrabold uppercase tracking-tight text-slate-900 font-sports mt-1.5">
              DD Turf Coimbatore Facility Gallery
            </h2>
            <p className="text-sm text-slate-500 font-semibold mt-3 max-w-lg mx-auto leading-relaxed">
              Explore our pristine synthetic surfaces, floodlighting systems, and athlete lounges in Goldwins.
            </p>
          </div>

          {/* Staggered masonry layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {galleryPhotos.map((photo) => (
              <div 
                key={photo.id}
                className={`relative overflow-hidden rounded-2xl border border-slate-200 group shadow-sm bg-slate-200 h-72 ${photo.colSpan}`}
              >
                <img 
                  src={photo.src} 
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-brand/90 px-2.5 py-1 rounded border border-brand text-white">{photo.size}</span>
                    <h4 className="text-lg md:text-xl font-extrabold uppercase font-sports mt-2 tracking-wide leading-none">{photo.title}</h4>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-350">
                    <Grid className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Section 4: Loyalty Perks and FAQ accordions */}
      <div className="relative z-30 bg-slate-50 border-t border-slate-200 py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left panel: Loyalty program membership comparison */}
          <div>
            <span className="text-brand text-xs font-black uppercase tracking-widest">Privileges Log</span>
            <h3 className="text-3xl font-extrabold text-slate-900 uppercase font-sports tracking-tight mt-1 mb-6">
              Membership Loyalty Tiers
            </h3>
            
            <div className="space-y-4">
              {loyaltyTiersData.map((tier, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{tier.name}</h4>
                    <span className="text-[10px] text-brand font-black uppercase tracking-wider">{tier.requirement}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:max-w-xs justify-start md:justify-end">
                    {tier.benefits.slice(0, 2).map((benefit, bIdx) => (
                      <span key={bIdx} className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        <Check className="w-2.5 h-2.5 text-brand" />
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: FAQ accordions */}
          <div>
            <span className="text-brand text-xs font-black uppercase tracking-widest">Support desk</span>
            <h3 className="text-3xl font-extrabold text-slate-900 uppercase font-sports tracking-tight mt-1 mb-6">
              Frequently Asked Questions
            </h3>

            <div className="space-y-3.5">
              {faqData.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-slate-800">{faq.q}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-slate-400"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs text-slate-500 font-semibold leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </motion.div>
  );
}
