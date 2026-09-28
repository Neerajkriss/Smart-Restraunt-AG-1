import React, { createContext, useContext, useState } from 'react';
import { RESTAURANT_CONFIG } from '../config/restaurant.config';

type Role = 'admin' | 'kitchen';

interface AuthContextType {
  isAdminUnlocked: boolean;
  isKitchenUnlocked: boolean;
  getStoredPin: (role: Role) => string;
  updateStoredPin: (role: Role, newPin: string) => void;
  unlockAdmin: () => void;
  lockAdmin: () => void;
  unlockKitchen: () => void;
  lockKitchen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(
    () => sessionStorage.getItem('admin_unlocked') === 'true'
  );
  const [isKitchenUnlocked, setIsKitchenUnlocked] = useState(
    () => sessionStorage.getItem('kitchen_unlocked') === 'true'
  );

  const getStoredPin = (role: Role): string => {
    const savedPin = localStorage.getItem(`${role}_pin`);
    if (savedPin) return savedPin;
    return role === 'admin'
      ? RESTAURANT_CONFIG.defaultAdminPin
      : RESTAURANT_CONFIG.defaultKitchenPin;
  };

  const updateStoredPin = (role: Role, newPin: string) => {
    localStorage.setItem(`${role}_pin`, newPin);
  };

  const unlockAdmin = () => {
    sessionStorage.setItem('admin_unlocked', 'true');
    setIsAdminUnlocked(true);
  };

  const lockAdmin = () => {
    sessionStorage.removeItem('admin_unlocked');
    setIsAdminUnlocked(false);
  };

  const unlockKitchen = () => {
    sessionStorage.setItem('kitchen_unlocked', 'true');
    setIsKitchenUnlocked(true);
  };

  const lockKitchen = () => {
    sessionStorage.removeItem('kitchen_unlocked');
    setIsKitchenUnlocked(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminUnlocked,
        isKitchenUnlocked,
        getStoredPin,
        updateStoredPin,
        unlockAdmin,
        lockAdmin,
        unlockKitchen,
        lockKitchen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
