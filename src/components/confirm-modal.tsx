'use client';

import { FiAlertCircle, FiX } from 'react-icons/fi';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getColors = () => {
    switch(type) {
      case 'danger': return { btn: 'bg-red-500 hover:bg-red-600', icon: 'text-red-500', bg: 'bg-red-500/10' };
      case 'warning': return { btn: 'bg-amber-500 hover:bg-amber-600', icon: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'success': return { btn: 'bg-[#00D4AA] hover:bg-[#00b894]', icon: 'text-[#00D4AA]', bg: 'bg-[#00D4AA]/10' };
      default: return { btn: 'bg-[#6C63FF] hover:bg-[#5b54e0]', icon: 'text-[#6C63FF]', bg: 'bg-[#6C63FF]/10' };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#12121a] border border-white/5 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
             <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center text-2xl ${colors.icon}`}>
                <FiAlertCircle />
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-[#8888aa] transition-colors">
                <FiX size={20} />
             </button>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-[#8888aa] text-sm leading-relaxed">{message}</p>
        </div>

        <div className="p-4 bg-black/40 flex items-center gap-3">
           <button 
             onClick={onClose}
             className="flex-1 py-3 text-sm font-bold text-[#8888aa] hover:bg-white/5 rounded-2xl transition-colors"
           >
              {cancelText}
           </button>
           <button 
             onClick={() => {
                onConfirm();
                onClose();
             }}
             className={`flex-1 py-3 text-sm font-bold text-white rounded-2xl transition-all active:scale-95 shadow-lg ${colors.btn}`}
           >
              {confirmText}
           </button>
        </div>
      </div>
    </div>
  );
}
