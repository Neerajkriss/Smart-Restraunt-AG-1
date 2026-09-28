export interface SalesSummary {
  totalRevenue: number;
  totalOrdersToday: number;
  activeTables: number;
}

export interface MonthlyArchiveSummary {
  monthKey: string;
  label: string;
  orderCount: number;
  revenue: number;
}
