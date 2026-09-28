import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import type { Order } from '../../types/order';
import { useCart } from '../../context/CartContext';
import { useTable } from '../../context/TableContext';
import { CartItemRow } from './CartItemRow';
import { BillBreakdown } from './BillBreakdown';
import { StatusProgress } from '../order/StatusProgress';
import { createOrder, submitOrder, fetchOrder } from '../../services/orderService';
import { buildUpiDeepLink, generateUpiQrDataUrl } from '../../services/paymentService';
import { addOrderToSession } from '../../services/sessionService';
import { formatINR } from '../../config/restaurant.config';

type CartStage = 'cart' | 'pay' | 'status';

interface CartDrawerProps {
  menu: MenuItem[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ menu }) => {
  const { isCartOpen, setIsCartOpen, getCartLines, calculateTotals, clearCart } = useCart();
  const { table, refreshSession } = useTable();

  const [stage, setStage] = useState<CartStage>('cart');
  const [order, setOrder] = useState<Order | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [utr, setUtr] = useState('');
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const lines = getCartLines(menu);
  const totals = calculateTotals(menu);

  // Reset stage on drawer open
  useEffect(() => {
    if (isCartOpen) {
      setStage('cart');
      setOrder(null);
      setQrDataUrl(null);
      setUtr('');
      setPayError(null);
      setBusy(false);
    }
  }, [isCartOpen]);

  // Poll order in status stage
  useEffect(() => {
    if (!isCartOpen || stage !== 'status' || !order) return;
    let active = true;

    const poll = async () => {
      try {
        const fresh = await fetchOrder(order.id);
        if (active && fresh) setOrder(fresh);
      } catch {
        /* keep last known */
      }
    };

    const id = setInterval(poll, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [isCartOpen, stage, order]);

  const handleProceedToPay = async () => {
    if (table === null) return;
    setBusy(true);
    setPayError(null);

    try {
      const created = await createOrder(
        table,
        lines,
        totals.subtotal,
        totals.gst,
        totals.total
      );
      setOrder(created);
      const upiUrl = buildUpiDeepLink(created.id, table, totals.total);
      const dataUrl = await generateUpiQrDataUrl(upiUrl, 240);
      setQrDataUrl(dataUrl);
      setStage('pay');
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Could not start payment');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!order) return;
    setBusy(true);
    setPayError(null);

    try {
      const updated = await submitOrder(order.id, utr.trim() || null);
      setOrder(updated);
      addOrderToSession(updated);
      clearCart();
      refreshSession();
      setStage('status');
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Could not submit order');
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const upiUrl = order && table !== null ? buildUpiDeepLink(order.id, table, totals.total) : null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={handleClose}
      />
      <aside
        className={`fixed bottom-0 left-1/2 z-50 flex max-h-[92vh] w-full max-w-md -translate-x-1/2 flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-2">
            {stage !== 'cart' && stage !== 'status' && (
              <button
                onClick={() => setStage('cart')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-semibold text-stone-800">
                {stage === 'cart' && 'Your Order'}
                {stage === 'pay' && 'UPI Payment'}
                {stage === 'status' && 'Order Confirmed'}
              </h3>
              <p className="text-xs text-stone-500">
                {table !== null ? `Table #${table}` : 'Takeaway / Dine-in'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {stage === 'cart' && (
          <>
            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                  <ShoppingCart className="h-7 w-7" />
                </div>
                <p className="mt-4 font-medium text-stone-700">Your cart is empty</p>
                <p className="mt-1 text-sm text-stone-500">
                  Add a few dishes from the menu to get started.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <ul className="space-y-3">
                    {lines.map((line) => (
                      <CartItemRow key={line.item.id} line={line} />
                    ))}
                  </ul>
                </div>
                <div className="border-t border-stone-100 px-5 py-4">
                  <BillBreakdown
                    subtotal={totals.subtotal}
                    gst={totals.gst}
                    total={totals.total}
                  />
                  <button
                    onClick={handleProceedToPay}
                    disabled={busy || table === null}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 font-semibold text-stone-900 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 active:scale-[0.99] disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <QrCode className="h-5 w-5" />
                    )}
                    Proceed to Pay · {formatINR(totals.total)}
                  </button>
                  {payError && (
                    <p className="mt-2 text-center text-sm text-red-500">{payError}</p>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {stage === 'pay' && order && qrDataUrl && upiUrl && (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex flex-col items-center">
              <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
                <img
                  src={qrDataUrl}
                  alt="UPI payment QR code"
                  width={240}
                  height={240}
                  className="h-auto w-60"
                />
              </div>
              <p className="mt-4 text-center text-sm text-stone-600">
                Scan with{' '}
                <span className="font-semibold text-stone-800">Google Pay</span>,{' '}
                <span className="font-semibold text-stone-800">PhonePe</span>, or{' '}
                <span className="font-semibold text-stone-800">Paytm</span> to pay{' '}
                <span className="font-bold text-stone-900">{formatINR(totals.total)}</span>
              </p>
              <div className="mt-3 w-full rounded-xl bg-stone-50 px-3 py-2 text-center">
                <p className="text-xs text-stone-400">UPI deep link</p>
                <p className="mt-0.5 break-all font-mono text-[11px] text-stone-600">
                  {upiUrl}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="utr" className="text-sm font-medium text-stone-700">
                Enter UPI Transaction UTR / Ref ID{' '}
                <span className="text-stone-400">(Optional)</span>
              </label>
              <input
                id="utr"
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. 403219875421"
                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <div className="mt-4 rounded-xl bg-stone-50 p-4">
              <BillBreakdown
                subtotal={totals.subtotal}
                gst={totals.gst}
                total={totals.total}
                compact
              />
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={busy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3.5 font-semibold text-white shadow-lg transition hover:bg-stone-800 active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              Submit Order
            </button>
            {payError && (
              <p className="mt-2 text-center text-sm text-red-500">{payError}</p>
            )}
          </div>
        )}

        {stage === 'status' && order && (
          <div className="flex flex-1 flex-col px-6 py-8 text-center">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/30" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-9 w-9" />
              </span>
            </div>
            <h3 className="mt-5 text-xl font-bold text-stone-800">Order Received!</h3>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-stone-500">
              <Clock className="h-4 w-4 animate-pulse text-amber-500" />
              Waiting for Kitchen Confirmation…
            </p>

            <StatusProgress status={order.status} />

            <div className="mt-6 w-full rounded-2xl border border-stone-100 bg-stone-50 p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Order ID</span>
                <span className="font-mono font-medium text-stone-700">
                  {order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-stone-500">Amount</span>
                <span className="font-bold text-stone-900">{formatINR(order.total)}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="mt-6 w-full rounded-2xl bg-stone-900 py-3 font-semibold text-white transition hover:bg-stone-800"
            >
              Add More Food
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
