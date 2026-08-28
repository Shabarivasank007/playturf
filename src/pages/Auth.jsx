import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, LogIn, ArrowRight } from 'lucide-react';

export default function Auth() {
  const { loginUser } = useApp();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    const emailOrPhoneVal = formData.emailOrPhone.trim();
    if (!emailOrPhoneVal) {
      newErrors.emailOrPhone = 'Email or phone number is required';
    } else {
      const isEmail = emailOrPhoneVal.includes('@');
      const isPhone = /^[0-9+\s-]{8,15}$/.test(emailOrPhoneVal);
      if (!isEmail && !isPhone) {
        newErrors.emailOrPhone = 'Please enter a valid email or phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      loginUser(formData.emailOrPhone, formData.name);
      navigate('/');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-white"
    >
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand/5 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xl">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-xl bg-brand items-center justify-center font-bold text-white shadow-md shadow-brand/20 mb-4">
              TC
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase font-sports">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-2 text-xs text-slate-500 font-semibold">
              {isLogin ? 'Book your turf and start your streak' : 'Join the club and secure prime slots'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6 border border-slate-200/60">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all cursor-pointer ${
                isLogin
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all cursor-pointer ${
                !isLogin
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-semibold"
                  />
                </div>
                {errors.name && <p className="text-xs text-brand mt-1 font-bold">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  placeholder="name@email.com or +1 234..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-semibold"
                />
              </div>
              {errors.emailOrPhone && (
                <p className="text-xs text-brand mt-1 font-bold">{errors.emailOrPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-brand mt-1 font-bold">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-dark text-white font-black text-xs tracking-wider uppercase py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand/20 transition-all hover:scale-[1.01] active:scale-[0.98] mt-6 cursor-pointer"
            >
              <span>{isLogin ? 'Sign In' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-250"></div>
            </div>
            <span className="relative bg-white px-3.5 text-xs text-slate-400 font-extrabold uppercase tracking-widest">
              Or continue with
            </span>
          </div>

          {/* Social login */}
          <button
            onClick={() => {
              loginUser('google.user@gmail.com', 'Google User');
              navigate('/');
            }}
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2a5.96 5.96 0 0 1-6-6 5.96 5.96 0 0 1 6-6c1.636 0 3.127.604 4.282 1.6l3.11-3.11C18.91 2.378 15.786 1.2 12.24 1.2a10.8 10.8 0 0 0-10.8 10.8 10.8 10.8 0 0 0 10.8 10.8c5.85 0 10.35-4.11 10.35-10.518 0-.495-.045-.967-.135-1.41H12.24Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
