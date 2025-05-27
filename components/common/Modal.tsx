import React from 'react';
import { XMarkIcon } from './Icon'; // Assuming Icon.tsx is in the same directory

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  dialogClassName?: string; // Optional custom styling for the dialog itself
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  dialogClassName = 'max-w-md' // Default width
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close on overlay click
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`bg-slate-800 rounded-lg shadow-xl w-full overflow-hidden transform transition-all duration-300 ease-in-out ${dialogClassName}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dialog
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-text-on-dark-primary">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-300 transition-colors p-1 rounded-full -mr-2 -mt-2"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}; 