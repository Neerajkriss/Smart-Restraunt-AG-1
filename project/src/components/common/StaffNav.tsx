import React from 'react';
import { UtensilsCrossed, ChefHat, LayoutGrid, Shield, Lock } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant.config';

export type RouteType = 'customer' | 'kitchen' | 'admin';

interface StaffNavProps {
  current: RouteType;
  onNavigate: (r: RouteType) => void;
  onOpenPinModal: () => void;
  onLock: () => void;
}

export const StaffNav: React.FC<StaffNavProps> = ({
  current,
  onNavigate,
  onOpenPinModal,
  onLock,
}) => {
  const tabs: { id: RouteType; label: string; icon: React.ReactNode }[] = [
    { id: 'kitchen', label: 'Kitchen', icon: <ChefHat className="h-4 w-4" /> },
    { id: 'admin', label: 'Admin', icon: <LayoutGrid className="h-4 w-4" /> },
  ];

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-stone-200 bg-stone-900 px-4 py-2.5">
      <div className="flex items-center gap-2 text-amber-400">
        <UtensilsCrossed className="h-4 w-4" />
        <span className="text-sm font-semibold text-white">
          {RESTAURANT_CONFIG.restaurantName}
        </span>
      </div>

      <div className="flex items-center gap-1 rounded-full bg-stone-800 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              current === tab.id
                ? 'bg-amber-500 text-stone-900'
                : 'text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {current === 'admin' && (
          <button
            onClick={onOpenPinModal}
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-800 px-3 py-1.5 text-sm font-medium text-amber-400 transition hover:bg-stone-700 hover:text-amber-300"
            title="Change Security PINs"
          >
            <Shield className="h-4 w-4" />
            PINs
          </button>
        )}

        <button
            onClick={onLock}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-900/50 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-800/60 hover:text-white"
            title="Lock View"
        >
          <Lock className="h-4 w-4" />
          Lock
        </button>

        <button
          onClick={() => onNavigate('customer')}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-stone-400 transition hover:text-white"
        >
          <UtensilsCrossed className="h-4 w-4" />
          Menu
        </button>
      </div>
    </div>
  );
};
