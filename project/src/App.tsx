import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TableProvider } from './context/TableContext';
import { CartProvider } from './context/CartContext';
import { MenuPage } from './pages/MenuPage';
import { KitchenPage } from './pages/KitchenPage';
import { AdminPage } from './pages/AdminPage';
import { StaffNav, type RouteType } from './components/common/StaffNav';
import { PinGate } from './components/common/PinGate';
import { ChangePinModal } from './components/common/ChangePinModal';

function parseRoute(): RouteType {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/kitchen') return 'kitchen';
  if (path === '/admin') return 'admin';
  return 'customer';
}

function navigate(route: RouteType) {
  const target = route === 'customer' ? '/menu' : `/${route}`;
  const search = route === 'customer' ? window.location.search : '';
  window.history.pushState({}, '', target + search);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function AppContent() {
  const [route, setRoute] = useState<RouteType>(parseRoute);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const {
    isAdminUnlocked,
    isKitchenUnlocked,
    getStoredPin,
    updateStoredPin,
    unlockAdmin,
    lockAdmin,
    unlockKitchen,
    lockKitchen,
  } = useAuth();

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const showStaffNav = route === 'kitchen' || route === 'admin';

  return (
    <div className="relative min-h-screen bg-stone-50 font-sans antialiased text-stone-900">
      {showStaffNav && (
        <StaffNav
          current={route}
          onNavigate={navigate}
          onOpenPinModal={() => setIsPinModalOpen(true)}
          onLock={route === 'admin' ? lockAdmin : lockKitchen}
        />
      )}

      {/* Customer Menu View */}
      {route === 'customer' && <MenuPage />}

      {/* Protected Kitchen View */}
      {route === 'kitchen' && (
        isKitchenUnlocked ? (
          <KitchenPage />
        ) : (
          <PinGate
            roleName="Kitchen View"
            correctPin={getStoredPin('kitchen')}
            onSuccess={unlockKitchen}
          />
        )
      )}

      {/* Protected Admin View */}
      {route === 'admin' && (
        isAdminUnlocked ? (
          <AdminPage />
        ) : (
          <PinGate
            roleName="Admin Dashboard"
            correctPin={getStoredPin('admin')}
            onSuccess={unlockAdmin}
          />
        )
      )}

      {/* Security PINs Modal */}
      <ChangePinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        getPin={getStoredPin}
        onUpdatePin={updateStoredPin}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TableProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </TableProvider>
    </AuthProvider>
  );
}