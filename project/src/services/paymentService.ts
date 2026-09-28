import QRCode from 'qrcode';
import { RESTAURANT_CONFIG } from '../config/restaurant.config';

export function buildUpiDeepLink(orderId: string, table: number, total: number): string {
  const shortId = orderId.replace(/-/g, '').slice(0, 8).toUpperCase();
  const tn = `Table${table}_${shortId}`;
  const params = new URLSearchParams({
    pa: RESTAURANT_CONFIG.upiVpa,
    pn: RESTAURANT_CONFIG.upiPayeeName,
    am: String(total),
    cu: 'INR',
    tn,
  });
  return `upi://pay?${params.toString()}`;
}

export async function generateUpiQrDataUrl(upiUrl: string, size = 240): Promise<string> {
  return QRCode.toDataURL(upiUrl, {
    margin: 2,
    width: size,
    color: { dark: '#1c1917', light: '#ffffff' },
  });
}
