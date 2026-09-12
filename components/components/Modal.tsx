import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className={`bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/10 w-full max-h-[90vh] overflow-y-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${maxWidth}`}>
        <div className="flex flex-row items-center justify-between p-6 sm:px-8 sm:pt-8 pb-4 border-b border-transparent">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors p-3 rounded-full flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          {children}
        </div>
      </div>
    </div>
  );
};
