/** Serializable dashboard payload for the executive overview UI. */

export type DataSource = "live" | "demo";

export type TrendDirection = "up" | "down" | "flat";

export type DashboardKpi = {
  id: string;
  label: string;
  value: number | null;
  /** Display unit suffix, e.g. "butir", "%", "kg/butir". */
  unit?: string;
  format: "count" | "percent" | "fcr" | "currency" | "integer";
  /** Absolute delta vs comparison period. */
  delta: number | null;
  /** Percent change vs comparison period. */
  deltaPercent: number | null;
  direction: TrendDirection;
  /** When true, downward trend is the favorable signal (FCR, critical stock). */
  invertTrend?: boolean;
  comparisonLabel: string;
  sparkline: number[];
};

export type DatePoint = {
  date: string;
  label: string;
};

export type ProductionPoint = DatePoint & {
  eggs: number;
};

export type HdpPoint = DatePoint & {
  hdp: number;
  target: number;
};

export type GradeSlice = {
  grade: string;
  value: number;
  fill: string;
};

export type CageFeedBar = {
  cage: string;
  kg: number;
};

export type MortalityPoint = DatePoint & {
  deaths: number;
};

export type SalesPoint = DatePoint & {
  amount: number;
};

export type CashflowPoint = DatePoint & {
  income: number;
  expense: number;
};

export type InventoryBucket = {
  type: "Feed" | "Medicine" | "Vaccine";
  label: string;
  quantity: number;
  unit: string;
  itemCount: number;
};

export type LowStockAlert = {
  id: string;
  name: string;
  totalQuantity: number;
  unit: string;
  minStockAlert: number;
};

export type TimelineKind =
  | "production"
  | "vaccination"
  | "purchase_order"
  | "stock_adjustment";

export type TimelineItem = {
  id: string;
  kind: TimelineKind;
  title: string;
  description: string;
  at: string;
  href?: string;
};

export type DashboardEarlyWarning = {
  cageId: string;
  cageName: string;
  actualHdp: number;
  targetHdp: number;
};

export type DashboardMortalityWarning = {
  cageId: string;
  cageName: string;
  deaths: number;
};

export type DashboardExecutive = {
  recordDate: string;
  kpis: DashboardKpi[];
  production30d: ProductionPoint[];
  hdpVsTarget30d: HdpPoint[];
  eggGradeDistribution: GradeSlice[];
  feedPerCage: CageFeedBar[];
  mortalityTrend: MortalityPoint[];
  sales7d: SalesPoint[];
  cashflow7d: CashflowPoint[];
  weeklyProfit: number;
  weekSalesTotal: number;
  inventory: InventoryBucket[];
  lowStockAlerts: LowStockAlert[];
  timeline: TimelineItem[];
  earlyWarnings: DashboardEarlyWarning[];
  mortalityWarnings: DashboardMortalityWarning[];
};
