export const RESTAURANT_CONFIG = {
  restaurantName: 'Grand Bistro',
  tagline: 'Browse the menu, add what you love, and place your order — right from your table. No app, no login, just great food.',
  subTagline: 'Dine-in · Fast Service · Contactless',
  currencySymbol: '₹',
  gstRate: 0.05,
  upiVpa: 'restaurant@upi',
  upiPayeeName: 'Grand Bistro',
  defaultAdminPin: '1234',
  defaultKitchenPin: '5678',
  categories: ['Starters', 'Main Course', 'Beverages'] as const,
  tableNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  sessionStorageKey: 'grand_bistro_session_v1',
  sessionChangeEvent: 'grand-bistro-session-changed',
  kitchenPollIntervalMs: 8000,
  orderStatusPollIntervalMs: 6000,
  summaryPollIntervalMs: 15000,
} as const;

export type MenuCategory = typeof RESTAURANT_CONFIG.categories[number];

export function formatINR(amount: number): string {
  return `${RESTAURANT_CONFIG.currencySymbol}${amount.toLocaleString('en-IN')}`;
}
