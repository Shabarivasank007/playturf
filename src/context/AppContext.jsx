import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Helper to format dates
const getDatesList = () => {
  const dates = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    
    // YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateVal = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dateVal}`;
    
    dates.push({
      dateStr,
      dayName: i === 0 ? 'Today' : daysOfWeek[d.getDay()],
      dayNum: d.getDate(),
      monthName: months[d.getMonth()],
      rawDate: d
    });
  }
  return dates;
};

// Generates time slots from 6 AM to 11 PM
const generateInitialSlots = (dates) => {
  const initialSlots = {};
  
  // Names for mock bookings
  const mockNames = ['Carlos', 'David', 'Marcus', 'Sophia', 'Sarah K.', 'Alex M.', 'Ryan', 'Team Liquid', 'Neymar FC', 'PSG Academy', 'Leo Messi'];

  dates.forEach(({ dateStr }, dayIndex) => {
    const daySlots = [];
    for (let hour = 6; hour < 23; hour++) {
      const isAM = hour < 12;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = isAM ? 'AM' : 'PM';
      
      const timeLabel = `${displayHour}:00 ${ampm}`;
      
      // Seed status: Today has more bookings, future days have less
      let status = 'available';
      let bookedBy = null;
      let heldBy = null;
      
      const rand = Math.random();
      if (dayIndex === 0) {
        // Today is busy
        if (rand < 0.45) {
          status = 'booked';
          bookedBy = mockNames[Math.floor(Math.random() * mockNames.length)];
        } else if (rand < 0.55) {
          status = 'held';
          heldBy = 'other';
        } else if (rand < 0.60) {
          status = 'blocked';
        }
      } else {
        // Future days have fewer bookings
        if (rand < 0.20) {
          status = 'booked';
          bookedBy = mockNames[Math.floor(Math.random() * mockNames.length)];
        } else if (rand < 0.25) {
          status = 'held';
          heldBy = 'other';
        }
      }
      
      daySlots.push({
        id: hour,
        time: timeLabel,
        status,
        bookedBy,
        heldBy,
        price: hour >= 16 && hour <= 21 ? 90 : 70, // Peak pricing 4 PM - 9 PM
      });
    }
    initialSlots[dateStr] = daySlots;
  });
  
  return initialSlots;
};

export const AppProvider = ({ children }) => {
  const dates = getDatesList();
  
  // App states
  const [user, setUser] = useState({
    name: 'Ronaldo Nazário',
    email: 'ronaldo.r9@turfclub.com',
    phone: '+55 11 99999-9999',
    avatar: '/ronaldo-eye.jpg', // Local workspace image!
    isLoggedIn: true,
    streakCount: 5,
    bookingsCount: 14,
    tier: 'Silver',
  });

  const [slots, setSlots] = useState(() => generateInitialSlots(dates));
  const [selectedDate, setSelectedDate] = useState(dates[0].dateStr);
  const [activeHeldSlot, setActiveHeldSlot] = useState(null); // { date, slotId }
  const [holdTimer, setHoldTimer] = useState(0); // seconds remaining

  // Mock Bookings list
  const [bookings, setBookings] = useState([
    {
      id: 'BK-9982',
      date: dates[0].dateStr,
      dateFormatted: `${dates[0].dayName}, ${dates[0].monthName} ${dates[0].dayNum}`,
      time: '7:00 PM',
      duration: '1.5 hours',
      pitch: 'DD Turf (7v7 Court)',
      price: 135,
      status: 'Confirmed',
      whatsappStatus: 'Delivered',
      createdAt: 'Today, 2:00 PM'
    },
    {
      id: 'BK-9811',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      dateFormatted: '2 days ago',
      time: '8:00 PM',
      duration: '1 hour',
      pitch: 'DD Turf (5v5 Court)',
      price: 90,
      status: 'Completed',
      whatsappStatus: 'Delivered',
      createdAt: '3 days ago'
    },
    {
      id: 'BK-8902',
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      dateFormatted: '5 days ago',
      time: '6:00 PM',
      duration: '2 hours',
      pitch: 'DD Turf (7v7 Court)',
      price: 180,
      status: 'Completed',
      whatsappStatus: 'Delivered',
      createdAt: '6 days ago'
    }
  ]);

  // Notifications/Toasts state
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Slot hold countdown interval
  useEffect(() => {
    let interval = null;
    if (activeHeldSlot && holdTimer > 0) {
      interval = setInterval(() => {
        setHoldTimer(prev => {
          if (prev <= 1) {
            // Release hold!
            releaseHeldSlot(activeHeldSlot.date, activeHeldSlot.slotId);
            showToast('⚠️ Slot hold expired. The slot has been released.', 'warning');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeHeldSlot, holdTimer]);

  // Simulate real-time updates every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      // Pick random date and slot
      const randomDateObj = dates[Math.floor(Math.random() * dates.length)];
      const randomDate = randomDateObj.dateStr;
      
      setSlots(prevSlots => {
        const daySlots = [...prevSlots[randomDate]];
        const randSlotIdx = Math.floor(Math.random() * daySlots.length);
        const slot = { ...daySlots[randSlotIdx] };

        // Do not touch slots that are held by the active user
        if (activeHeldSlot && activeHeldSlot.date === randomDate && activeHeldSlot.slotId === slot.id) {
          return prevSlots;
        }

        // Transition states naturally
        if (slot.status === 'available') {
          // 80% change to held, 20% to booked
          if (Math.random() < 0.8) {
            slot.status = 'held';
            slot.heldBy = 'other';
          } else {
            slot.status = 'booked';
            slot.bookedBy = ['Marcus', 'David', 'Sophia', 'Leo FC', 'Neymar Jr'][Math.floor(Math.random() * 5)];
          }
        } else if (slot.status === 'held' && slot.heldBy === 'other') {
          // Release it or book it
          if (Math.random() < 0.6) {
            slot.status = 'available';
            slot.heldBy = null;
          } else {
            slot.status = 'booked';
            slot.bookedBy = ['Alex G.', 'Sarah K.', 'Neymar FC'][Math.floor(Math.random() * 3)];
          }
        } else if (slot.status === 'booked' && slot.bookedBy !== 'Ronaldo Nazário') {
          // Release occasional booked slot (simulating a cancellation)
          if (Math.random() < 0.15) {
            slot.status = 'available';
            slot.bookedBy = null;
          }
        }

        daySlots[randSlotIdx] = slot;
        return {
          ...prevSlots,
          [randomDate]: daySlots
        };
      });
    }, 10000);

    return () => clearInterval(timer);
  }, [dates, activeHeldSlot]);

  // Hold a slot for checkout
  const holdSlot = (date, slotId) => {
    // If there is already a held slot, release it first
    if (activeHeldSlot) {
      releaseHeldSlot(activeHeldSlot.date, activeHeldSlot.slotId);
    }

    setSlots(prev => {
      const daySlots = [...prev[date]];
      const idx = daySlots.findIndex(s => s.id === slotId);
      if (idx !== -1 && daySlots[idx].status === 'available') {
        const updatedSlot = { ...daySlots[idx], status: 'held', heldBy: 'me' };
        daySlots[idx] = updatedSlot;
      }
      return { ...prev, [date]: daySlots };
    });

    setActiveHeldSlot({ date, slotId });
    setHoldTimer(300); // 5 minutes
  };

  // Release held slot
  const releaseHeldSlot = (date, slotId) => {
    setSlots(prev => {
      const daySlots = [...prev[date]];
      const idx = daySlots.findIndex(s => s.id === slotId);
      if (idx !== -1 && daySlots[idx].status === 'held' && daySlots[idx].heldBy === 'me') {
        daySlots[idx] = { ...daySlots[idx], status: 'available', heldBy: null };
      }
      return { ...prev, [date]: daySlots };
    });
    setActiveHeldSlot(null);
    setHoldTimer(0);
  };

  // Confirm booking
  const confirmBooking = (date, slotId, duration = 1) => {
    const dayObj = dates.find(d => d.dateStr === date);
    const daySlots = slots[date];
    const slot = daySlots.find(s => s.id === slotId);
    
    if (!slot) return null;

    const basePrice = slot.price;
    const finalPrice = Math.round(basePrice * duration);
    const durationLabel = duration === 1 ? '1 hour' : duration === 1.5 ? '1.5 hours' : '2 hours';

    // Update slots
    setSlots(prev => {
      const currentDaySlots = [...prev[date]];
      const idx = currentDaySlots.findIndex(s => s.id === slotId);
      if (idx !== -1) {
        currentDaySlots[idx] = { 
          ...currentDaySlots[idx], 
          status: 'booked', 
          bookedBy: user.name, 
          heldBy: null 
        };
      }
      return { ...prev, [date]: currentDaySlots };
    });

    // Add to bookings history
    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: bookingId,
      date,
      dateFormatted: `${dayObj.dayName}, ${dayObj.monthName} ${dayObj.dayNum}`,
      time: slot.time,
      duration: durationLabel,
      pitch: 'DD Turf, Goldwins',
      price: finalPrice,
      status: 'Confirmed',
      whatsappStatus: 'Sent',
      createdAt: 'Just now'
    };

    setBookings(prev => [newBooking, ...prev]);

    // Update user stats
    setUser(prev => {
      const nextBookingsCount = prev.bookingsCount + 1;
      const nextStreakCount = prev.streakCount + 1;
      let nextTier = prev.tier;
      if (nextBookingsCount >= 20) nextTier = 'Gold';
      else if (nextBookingsCount >= 10) nextTier = 'Silver';
      else nextTier = 'Bronze';

      return {
        ...prev,
        bookingsCount: nextBookingsCount,
        streakCount: nextStreakCount,
        tier: nextTier
      };
    });

    // Clear active holds
    setActiveHeldSlot(null);
    setHoldTimer(0);

    // Simulate owner notification and WhatsApp delivery statuses
    showToast(`Booking ${bookingId} confirmed!`, 'success');
    
    setTimeout(() => {
      showToast('📩 Owner notified of booking.', 'info');
      // Update whatsapp status badge to Delivered in simulated bookings list
      setBookings(currentBookings => 
        currentBookings.map(b => 
          b.id === bookingId ? { ...b, whatsappStatus: 'Delivered' } : b
        )
      );
    }, 4000);

    return newBooking;
  };

  // Admin: Block/Unblock slot
  const toggleBlockSlot = (date, slotId) => {
    setSlots(prev => {
      const daySlots = [...prev[date]];
      const idx = daySlots.findIndex(s => s.id === slotId);
      if (idx !== -1) {
        const slot = daySlots[idx];
        const newStatus = slot.status === 'blocked' ? 'available' : 'blocked';
        daySlots[idx] = { 
          ...slot, 
          status: newStatus,
          bookedBy: null,
          heldBy: null
        };
        showToast(
          newStatus === 'blocked' ? `Slot at ${slot.time} blocked.` : `Slot at ${slot.time} unblocked.`,
          'info'
        );
      }
      return { ...prev, [date]: daySlots };
    });
  };

  // Auth: Login / Signup
  const loginUser = (emailOrPhone, name = '') => {
    setUser({
      name: name || 'Ronaldo Nazário',
      email: emailOrPhone.includes('@') ? emailOrPhone : 'ronaldo.r9@turfclub.com',
      phone: !emailOrPhone.includes('@') ? emailOrPhone : '+55 11 99999-9999',
      avatar: '/ronaldo-eye.jpg',
      isLoggedIn: true,
      streakCount: 5,
      bookingsCount: 14,
      tier: 'Silver',
    });
    showToast('Logged in successfully!', 'success');
  };

  const logoutUser = () => {
    setUser({
      name: '',
      email: '',
      phone: '',
      avatar: '',
      isLoggedIn: false,
      streakCount: 0,
      bookingsCount: 0,
      tier: 'Bronze',
    });
    showToast('Logged out.', 'info');
  };

  return (
    <AppContext.Provider value={{
      dates,
      slots,
      selectedDate,
      setSelectedDate,
      user,
      activeHeldSlot,
      holdTimer,
      bookings,
      toasts,
      holdSlot,
      releaseHeldSlot,
      confirmBooking,
      toggleBlockSlot,
      loginUser,
      logoutUser,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};
