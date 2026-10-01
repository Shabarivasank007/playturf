import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const TOAST_THEMES = {
  success: {
    border: 'border-emerald-300',
    iconBg: 'bg-emerald-50',
    icon: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
  },
  warning: {
    border: 'border-amber-400',
    iconBg: 'bg-amber-50',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
  },
  error: {
    border: 'border-red-400',
    iconBg: 'bg-red-50',
    icon: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
  },
  info: {
    border: 'border-slate-300',
    iconBg: 'bg-slate-50',
    icon: <Info className="w-5 h-5 text-brand flex-shrink-0" />,
  },
};

const ToastItem = ({ toast }) => {
  const { removeToast } = useApp();
  const { id, message, type = 'info' } = toast;
  const theme = TOAST_THEMES[type] || TOAST_THEMES.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border-2 ${theme.border} shadow-xl shadow-slate-900/10 overflow-hidden`}
    >
      <div className={`p-1.5 rounded-xl ${theme.iconBg} mt-0.5`}>
        {theme.icon}
      </div>
      <div className="flex-1 text-sm font-semibold text-slate-800 leading-snug break-words pt-1">
        {message}
      </div>
      <button
        type="button"
        onClick={() => removeToast(id)}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors ml-1"
        aria-label="Dismiss toast"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};
