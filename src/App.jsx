import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { CinematicIntro } from './components/CinematicIntro';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Book from './pages/Book';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Auth from './pages/Auth';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Navbar />
      
      {/* 
        Home video goes full bleed behind floating navbar (no padding).
        Subpages are offset by pt-24 so content starts cleanly below the floating pill.
      */}
      <main className={`flex-1 w-full relative ${isHome ? '' : 'pt-24'}`}>
        <AnimatedRoutes />
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}

function AppContent() {
  const [introCompleted, setIntroCompleted] = useState(() => {
    return localStorage.getItem('skipIntro') === 'true';
  });

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    localStorage.setItem('skipIntro', 'true');
  };

  if (!introCompleted) {
    return <CinematicIntro onComplete={handleIntroComplete} />;
  }

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
