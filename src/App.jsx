import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';

import { Navbar }         from './components/Navbar';
import { Footer }         from './components/Footer';
import { ToastContainer } from './components/Toast';
import { CinematicIntro } from './components/CinematicIntro';

import Home      from './pages/Home';
import Auth      from './pages/Auth';
import Book      from './pages/Book';
import Bookings  from './pages/Bookings';
import Profile   from './pages/Profile';
import Admin     from './pages/Admin';
import Dashboard from './pages/Dashboard';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

function PageWrap({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const { user }  = useApp();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"           element={<PageWrap><Home /></PageWrap>} />
        <Route path="/dashboard"  element={<PageWrap><Dashboard /></PageWrap>} />
        <Route path="/book"       element={<PageWrap><Book /></PageWrap>} />
        <Route path="/login"
          element={user ? <Navigate to="/" replace /> : <PageWrap><Auth /></PageWrap>} />

        {/* Auth-protected */}
        <Route path="/bookings"
          element={user ? <PageWrap><Bookings /></PageWrap> : <Navigate to="/login" replace />} />
        <Route path="/profile"
          element={user ? <PageWrap><Profile /></PageWrap> : <Navigate to="/login" replace />} />

        {/* Admin-only */}
        <Route path="/admin"
          element={user?.role === 'ADMIN'
            ? <PageWrap><Admin /></PageWrap>
            : <Navigate to="/" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppLayout() {
  const location = useLocation();
  const isHome   = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className={`flex-1 ${isHome ? '' : 'pt-24'}`}>
        <AnimatedRoutes />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

function AppContent() {
  const [introComplete, setIntroComplete] = useState(
    () => localStorage.getItem('skipIntro') === 'true'
  );

  if (!introComplete) {
    return (
      <CinematicIntro onComplete={() => {
        localStorage.setItem('skipIntro', 'true');
        setIntroComplete(true);
      }} />
    );
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
