// @/context/NotificationContext.tsx
"use client";

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Typy i Kontekst ---
type NotificationType = 'success' | 'error' | 'info';
type NotificationDetails = string[] | Record<string, string[]>;

interface NotificationContextType {
  notify: (message: string, type: NotificationType, details?: NotificationDetails) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- Komponent Niestandardowego Powiadomienia (z ikonami) ---
const CustomToast = ({ type, message, details }: { type: NotificationType; message: string; details?: NotificationDetails }) => {
  
  const iconMap = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 w-6 h-6">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 w-6 h-6">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#e6915b] w-6 h-6">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    ),
  };

  const titles = {
    success: 'Pairly | Success',
    error: 'Pairly | Error',
    info: 'Pairly | Info',
  };

  const renderDetails = () => {
    if (!details) return null;
    const errorList = Array.isArray(details) ? details : Object.values(details).flat();
    if (errorList.length === 0) return null;
    return (
      <ul className="mt-2 list-disc list-inside text-xs opacity-80 font-montserrat-medium">
        {errorList.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    );
  };

  return (
    <div className="flex items-start text-left space-x-4">
      <div className="flex-shrink-0">{iconMap[type]}</div>
      <div className="flex-grow">
        <p className="font-montserrat-medium font-semibold text-white">{titles[type]}</p>
        <p className="pt-1 font-montserrat-medium text-sm text-zinc-300">{message}</p>
        {renderDetails()}
      </div>
    </div>
  );
};

// --- Dostawca (Provider) ---
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
    closeButton: true,
    pauseOnFocusLoss: false,
  };

  const notify = useCallback((message: string, type: NotificationType, details?: NotificationDetails) => {
    toast(<CustomToast type={type} message={message} details={details} />, {
      ...toastOptions,
      type: type,
      icon: false, 
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};

// --- Custom Hook ---
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
