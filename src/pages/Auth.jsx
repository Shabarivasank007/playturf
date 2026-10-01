import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CheckCircle2, ArrowRight, ArrowLeft, RotateCw, User, Mail, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sendOtp, verifyOtp } from '../api/auth';

export default function Auth() {
  const { loginUser, showToast } = useApp();
  const navigate = useNavigate();

  // ── Flow State: 'phone' | 'otp' | 'details' ─────────────────────────────────
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // ── OTP State ───────────────────────────────────────────────────────────────
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const otpInputs = useRef([]);

  // ── New User Profile State ──────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name: '',
    city: 'Coimbatore',
    email: '',
  });
  const [profileErrors, setProfileErrors] = useState({});

  // ── Resend Countdown Timer ──────────────────────────────────────────────────
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // ── Clean Phone input (only digits, up to 10) ────────────────────────────────
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
    if (phoneError) setPhoneError('');
  };

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError('');
    setLoading(true);

    try {
      const res = await sendOtp(phone);
      if (res.devOtp) setDevOtp(res.devOtp);
      setStep('otp');
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      showToast(res.message || `Code sent to +91 ${phone}`, 'success');
      // Auto focus first OTP input on transition
      setTimeout(() => otpInputs.current[0]?.focus(), 150);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || (!err.response ? 'Cannot connect to backend server. Make sure it is running on port 8080.' : 'Failed to send OTP. Please try again.');
      showToast(msg, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Box Handlers ────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    // Auto-advance
    if (digit && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 filled
    if (digit && updated.every((d) => d !== '')) {
      submitOtpVerification(updated.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const updated = [...otp];
      for (let i = 0; i < 6; i++) {
        updated[i] = pasted[i] || '';
      }
      setOtp(updated);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputs.current[nextFocus]?.focus();
      if (pasted.length === 6) {
        submitOtpVerification(pasted);
      }
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const submitOtpVerification = async (codeToVerify) => {
    const code = codeToVerify || otp.join('');
    if (code.length < 6) {
      showToast('Please enter the complete 6-digit code', 'warning');
      return;
    }
    setLoading(true);

    try {
      const res = await verifyOtp({
        phone,
        otp: code,
      });

      if (res.newUser) {
        // Needs name and profile details
        setStep('details');
        showToast('Code verified! Please complete your profile', 'info');
      } else {
        // Existing user logged in
        loginUser({
          name: res.name,
          email: res.email,
          phone: res.phone,
          role: res.role,
          city: res.city,
        }, res.token);
        showToast(res.message || `Welcome back, ${res.name}!`, 'success');
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid verification code. Please try again.';
      showToast(msg, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Complete New User Registration ───────────────────────────────────
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profile.name.trim()) errs.name = 'Full name is required';
    if (!profile.city.trim()) errs.city = 'City is required';
    if (profile.email.trim() && !/\S+@\S+\.\S+/.test(profile.email)) {
      errs.email = 'Invalid email address format';
    }

    if (Object.keys(errs).length) {
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});
    setLoading(true);

    try {
      const code = otp.join('') || devOtp || '123456';
      const res = await verifyOtp({
        phone,
        otp: code,
        name: profile.name.trim(),
        city: profile.city.trim(),
        email: profile.email.trim(),
      });

      loginUser({
        name: res.name,
        email: res.email,
        phone: res.phone,
        role: res.role,
        city: res.city,
      }, res.token);

      showToast(`Welcome to DD Turf, ${res.name}!`, 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to complete registration';
      showToast(msg, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Helper to prefill admin phone
  const handleQuickAdmin = () => {
    setPhone('6382022478');
    setPhoneError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand/20">
            <span className="text-white text-2xl font-black">DD</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">DD Turf Coimbatore</h1>
          <p className="text-slate-500 text-sm mt-1">Instant Mobile Verification & Booking</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: ENTER PHONE ── */}
            {step === 'phone' && (
              <motion.div
                key="step-phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Enter Mobile Number</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    We will send a one-time verification code via SMS / WhatsApp.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Mobile Number
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <div className="relative flex-1">
                        <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="98765 43210"
                          autoFocus
                          maxLength={10}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-base font-semibold tracking-wider text-slate-800
                                     bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                        />
                      </div>
                    </div>
                    {phoneError && <p className="text-red-500 text-xs font-medium mt-1.5">{phoneError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-sm
                               shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Get Verification Code <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Benefits / Info */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-500" /> No password needed
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickAdmin}
                    className="text-xs text-brand hover:underline font-semibold"
                  >
                    Admin (+91 6382022478)
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: VERIFY OTP ── */}
            {step === 'otp' && (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <ArrowLeft size={14} /> Change Number
                  </button>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    OTP Sent
                  </span>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Verify Mobile Code</h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Sent to <span className="font-bold text-slate-800">+91 {phone}</span>
                  </p>
                </div>

                {/* Dev Helper Pill (makes testing super smooth) */}
                {devOtp && (
                  <div
                    onClick={() => {
                      const digits = devOtp.split('').slice(0, 6);
                      setOtp(digits);
                      submitOtpVerification(devOtp);
                    }}
                    className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs cursor-pointer hover:bg-amber-100/70 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-600" />
                      <span className="text-amber-900 font-semibold">
                        Verification Code: <span className="font-mono font-bold tracking-widest text-sm text-brand">{devOtp}</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 underline">Auto-fill & Verify</span>
                  </div>
                )}

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-between gap-2 mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-13 text-center text-xl font-black rounded-xl border-2 border-slate-200 bg-slate-50
                                 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => submitOtpVerification()}
                  disabled={loading || otp.join('').length < 6}
                  className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-sm
                             shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mb-4"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify & Continue <CheckCircle2 size={16} />
                    </>
                  )}
                </button>

                {/* Resend Action */}
                <div className="text-center text-xs text-slate-500">
                  {countdown > 0 ? (
                    <span>Resend code in <span className="font-bold text-slate-700">{countdown}s</span></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-brand font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw size={13} /> Resend OTP
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: NEW USER PROFILE ── */}
            {step === 'details' && (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5">
                  <span className="text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    New Player Profile
                  </span>
                  <h2 className="text-xl font-black text-slate-800 mt-2">Welcome to DD Turf!</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Enter your name and details to finish creating your account.
                  </p>
                </div>

                <form onSubmit={handleCompleteRegistration} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Shabari Kumar"
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                      />
                    </div>
                    {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Turf Location</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                        placeholder="Coimbatore"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                      />
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">Email Address</label>
                      <span className="text-[11px] text-slate-400 font-medium">Optional</span>
                    </div>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                        placeholder="shabari@example.com (optional)"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                      />
                    </div>
                    {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>}
                    <p className="text-[11px] text-slate-400 mt-1">Used for booking receipts and calendar invites.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-sm
                               shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Complete Setup & Enter DD Turf ⚽
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
