import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  show: boolean;
}

const Modal: React.FC<ModalProps> = ({ show, title, children, confirmText, onConfirm, cancelText, onCancel }) => {
  if (!show) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-slate-700">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">{title}</h2>
        <div className="text-slate-300 mb-6">{children}</div>
        <div className="flex justify-end gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 bg-slate-600 hover:bg-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-400"
            >
              {cancelText || 'Cancel'}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 bg-cyan-600 hover:bg-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-400"
            >
              {confirmText || 'Confirm'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
