import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Zap, Shield, Trophy } from 'lucide-react';

export const CinematicIntro = ({ onComplete }) => {
  const containerRef = useRef(null);
  const [showSkip, setShowSkip] = useState(false);

  // Set up Framer Motion scroll listeners
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Scene transitions based on scroll
  // Scene 1: Logo & Title (Scale, zoom, fade)
  const titleScale = useTransform(scrollYProgress, [0, 0.45], [1, 0.7]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.35, 0.45], [1, 0.9, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.45], [0, -80]);

  // Scene 2: The Stadium Push-In
  const bgScale = useTransform(scrollYProgress, [0, 0.4, 0.85, 1], [1.1, 1.5, 2.5, 3]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.7, 0.95], [0.75, 0.6, 0]);
  const bgFilter = useTransform(scrollYProgress, [0, 0.5], ["brightness(0.75) contrast(1.1)", "brightness(0.3) contrast(1.3)"]);

  // Scene 3: Taglines overlay
  const text2Opacity = useTransform(scrollYProgress, [0.35, 0.55, 0.75, 0.85], [0, 1, 1, 0]);
  const text2Scale = useTransform(scrollYProgress, [0.35, 0.6, 0.85], [0.8, 1, 1.2]);
  
  // Transition indicator (scroll helper)
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Handle Skip delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 1200);

    // Lock body scroll during cinematic intro if we want strict control,
    // but standard scroll-linked animation requires the user to be able to scroll the page.
    // So we just hide index.html's horizontal overflow.
    return () => clearTimeout(timer);
  }, []);

  // When scroll reaches 95%, auto-trigger completion
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      if (latest >= 0.96) {
        onComplete();
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, onComplete]);

  return (
    <div ref={containerRef} className="relative h-[300vh] w-full bg-[#04060b]">
      {/* Fixed viewport container */}
      <div className="sticky top-0 left-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        
        {/* Background Turf/Stadium Image with Parallax Zoom */}
        <motion.div 
          style={{ 
            scale: bgScale, 
            opacity: bgOpacity,
            filter: bgFilter
          }}
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
          // We can use a stylized canvas or a high-quality soccer turf picture/gradient.
          // Since we have ronaldo.jpg in root, let's use it as a premium overlay or background!
          // We'll fall back to a gorgeous dark-green gradient if ronaldo.jpg is missing, but it is there.
          // We link to file:///c:/Users/admin/OneDrive/Desktop/UI/ronaldo.jpg or simply '/ronaldo.jpg' (Vite serves public files, let's use path)
          // Since it's in the project root, let's copy it or reference it from /public or /src.
          // In Vite, root assets can be referenced directly or put in public.
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-[#080c14] z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080c14] via-transparent to-[#080c14] z-10" />
          <div 
            className="w-full h-full bg-[#120303]" 
            style={{
              backgroundImage: `url('/ronaldo.jpg')`, // Served via Vite public/assets dev server once copied, or fallback to CSS patterns
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
            }}
          />
        </motion.div>

        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none z-10" />

        {/* Skip Intro Button */}
        {showSkip && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="absolute top-6 right-6 z-50 glass hover:bg-brand/20 text-white font-medium px-5 py-2.5 rounded-full text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Skip Intro
            <Zap className="w-4 h-4 text-brand" />
          </motion.button>
        )}

        {/* SCENE 1: Primary Title and Tagline */}
        <motion.div 
          style={{ 
            scale: titleScale, 
            opacity: titleOpacity, 
            y: titleY 
          }}
          className="relative z-20 text-center px-4 max-w-4xl flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-brand text-xs font-semibold tracking-wider uppercase mb-6"
          >
            <Trophy className="w-3.5 h-3.5 text-brand" />
            Arena Booking Revolution
          </motion.div>

          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black tracking-tight text-white uppercase font-sports"
          >
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-brand to-red-800">TURF</span> CLUB
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-2xl"
          >
            Book premium football fields in seconds. Seamless Redis slot locking, instant WhatsApp status alerts, and loyalty streaks.
          </motion.p>
        </motion.div>

        {/* SCENE 2: Scroll-Driven Feature Showcase (Pushed in on scroll) */}
        <motion.div 
          style={{ 
            opacity: text2Opacity,
            scale: text2Scale
          }}
          className="absolute z-20 flex flex-col items-center text-center px-6 max-w-2xl pointer-events-none"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center mb-6 glow-red">
            <Shield className="w-8 h-8 text-brand" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight">
            SECURE YOUR SLOT
          </h2>
          <p className="mt-4 text-lg text-gray-300 font-light leading-relaxed">
            Our microsecond Redis-hold locks your slot the moment you select it. No double bookings. No disputes. Just pure soccer.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 w-full max-w-md">
            <div className="glass p-4 rounded-xl text-center">
              <span className="text-2xl font-bold text-brand">5m</span>
              <p className="text-xs text-gray-400 mt-1">Slot Lock</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <span className="text-2xl font-bold text-brand">10s</span>
              <p className="text-xs text-gray-400 mt-1">Live Sync</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <span className="text-2xl font-bold text-brand">100%</span>
              <p className="text-xs text-gray-400 mt-1">WhatsApp</p>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-10 z-20 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold animate-pulse">
            Scroll to enter arena
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5 text-brand" />
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};
