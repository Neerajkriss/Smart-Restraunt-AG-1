import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { SessionOrder, TableSession } from '../types/order';
import {
  getSessionForTable,
  updateOrderInSession,
  clearSession,
  notifySessionChange,
  SESSION_EVENT,
} from '../services/sessionService';
import { fetchOrdersByIds } from '../services/orderService';
import { RESTAURANT_CONFIG } from '../config/restaurant.config';

interface TableContextType {
  table: number | null;
  session: TableSession | null;
  activeOrders: SessionOrder[];
  hasActiveOrders: boolean;
  isStatusOpen: boolean;
  setIsStatusOpen: (open: boolean) => void;
  refreshSession: () => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

function parseTableFromUrl(): number | null {
  const params = new URLSearchParams(window.location.search);
  const t = params.get('table');
  const n = t ? parseInt(t, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [table, setTable] = useState<number | null>(parseTableFromUrl);
  const [session, setSession] = useState<TableSession | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Listen for navigation changes
  useEffect(() => {
    const handleUrlChange = () => {
      setTable(parseTableFromUrl());
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Sync session on mount and when table changes
  useEffect(() => {
    if (table !== null) {
      setSession(getSessionForTable(table));
    } else {
      setSession(null);
    }
  }, [table]);

  // Sync session on cross-tab storage / session change events
  useEffect(() => {
    const handler = () => {
      if (table !== null) {
        setSession(getSessionForTable(table));
      }
    };

    window.addEventListener(SESSION_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(SESSION_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [table]);

  const refreshSession = useCallback(() => {
    if (table !== null) {
      setSession(getSessionForTable(table));
      notifySessionChange();
    }
  }, [table]);

  const sessionRef = React.useRef(session);
  sessionRef.current = session;

  // Poll active orders for status updates
  useEffect(() => {
    const currentSession = sessionRef.current;
    if (!currentSession || currentSession.orders.length === 0) return;

    const ids = currentSession.orders.map((o) => o.id);
    let active = true;

    const poll = async () => {
      try {
        const fresh = await fetchOrdersByIds(ids);
        if (!active) return;

        if (fresh.length !== ids.length || fresh.some((o) => o.archived)) {
          clearSession();
          setSession(null);
          return;
        }

        const activeSession = sessionRef.current;
        if (!activeSession) return;

        let changed = false;
        const updated = activeSession.orders.map((o) => {
          const f = fresh.find((x) => x.id === o.id);
          if (f && (f.status !== o.status || f.payment_status !== o.payment_status)) {
            changed = true;
            updateOrderInSession(f);
            return {
              ...o,
              status: f.status,
              payment_status: f.payment_status,
              total: f.total,
            };
          }
          return o;
        });

        if (changed) {
          setSession({ table: activeSession.table, orders: updated });
          notifySessionChange();
        }
      } catch {
        /* keep last known state */
      }
    };

    poll();
    const timer = setInterval(poll, RESTAURANT_CONFIG.orderStatusPollIntervalMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [session?.table, session?.orders.length]);

  const activeOrders = useMemo(
    () => (session?.orders ?? []).filter((o) => o.status !== 'Completed'),
    [session]
  );

  const hasActiveOrders = activeOrders.length > 0;

  return (
    <TableContext.Provider
      value={{
        table,
        session,
        activeOrders,
        hasActiveOrders,
        isStatusOpen,
        setIsStatusOpen,
        refreshSession,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export function useTable(): TableContextType {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
}
