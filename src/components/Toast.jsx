import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast }) => {
  const { id, message, type } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-brand flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-brand-light flex-shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-brand/40';
      case 'warning':
        return 'border-amber-500/40';
      case 'info':
      default:
        return 'border-white/10';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass border ${getBorderColor()} shadow-2xl overflow-hidden`}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium text-gray-100">{message}</div>
    </motion.div>
  );
};
