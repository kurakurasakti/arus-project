// ============================================
// ARUS FINANCIAL APPLICATION - TYPE DEFINITIONS
// ============================================
// Based on PRD v1.0 - March 5, 2026

// ============================================
// USER & BUSINESS PROFILE
// ============================================

export interface BusinessProfile {
  id: string;
  businessName: string;
  businessType: 'PT Perorangan' | 'CV' | 'Firma' | 'Koperasi';
  npwp: string;
  phone: string;
  whatsappVerified: boolean;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  industry?: string;
  roughRevenueSize?: '< 100jt' | '100jt - 500jt' | '500jt - 1M' | '> 1M';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email?: string;
  phone: string;
  profile: BusinessProfile;
  role: 'owner' | 'accountant' | 'viewer';
  subscription: Subscription;
}

// ============================================
// SUBSCRIPTION & BILLING
// ============================================

export interface Subscription {
  id: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  transactionLimit: number;
  transactionsUsed: number;
}

// ============================================
// BANK & UPLOAD
// ============================================

export type BankType = 'BCA' | 'MANDIRI' | 'BNI' | 'BRI';

export interface BankConnection {
  id: string;
  bankType: BankType;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  connectedAt: Date;
}

export interface Upload {
  id: string;
  userId: string;
  filename: string;
  storagePath: string;
  bankType: BankType;
  status: 'uploading' | 'processing' | 'parsed' | 'categorized' | 'failed';
  rawExtraction?: RawExtraction;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface RawExtraction {
  totalPages: number;
  extractedText: string;
  rawTransactions: Partial<Transaction>[];
}

// ============================================
// TRANSACTIONS (Core Entity)
// ============================================

export type TransactionType = 'debit' | 'credit';
export type TransactionStatus = 'pending_review' | 'verified' | 'disputed';

export interface Transaction {
  id: string;
  userId: string;
  uploadId: string;
  transactionDate: Date;
  description: string;
  counterparty?: string;
  amount: number; // Always positive, use type for direction
  type: TransactionType;
  category: SakEmkmCategory;
  aiConfidence: number; // 0.0 - 1.0
  status: TransactionStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  createdAt: Date;
}

// ============================================
// SAK EMKM CATEGORIES
// ============================================

export type SakEmkmCategoryType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface SakEmkmCategory {
  code: string;
  nameId: string;
  nameEn: string;
  type: SakEmkmCategoryType;
  parentCode?: string;
  description?: string;
}

// Predefined categories based on PRD Section 3.2
export const SAK_EMKM_CATEGORIES: SakEmkmCategory[] = [
  // Aset (Assets)
  { code: '1-1000', nameId: 'Kas & Setara Kas', nameEn: 'Cash & Cash Equivalents', type: 'asset' },
  { code: '1-2000', nameId: 'Piutang', nameEn: 'Receivables', type: 'asset' },
  { code: '1-3000', nameId: 'Persediaan', nameEn: 'Inventory', type: 'asset' },
  { code: '1-4000', nameId: 'Aset Tetap', nameEn: 'Fixed Assets', type: 'asset' },
  
  // Liabilitas (Liabilities)
  { code: '2-1000', nameId: 'Hutang Usaha', nameEn: 'Accounts Payable', type: 'liability' },
  { code: '2-2000', nameId: 'Hutang Bank', nameEn: 'Bank Loans', type: 'liability' },
  { code: '2-3000', nameId: 'Hutang Lainnya', nameEn: 'Other Liabilities', type: 'liability' },
  
  // Ekuitas (Equity)
  { code: '3-1000', nameId: 'Modal', nameEn: 'Capital', type: 'equity' },
  { code: '3-2000', nameId: 'Laba Ditahan', nameEn: 'Retained Earnings', type: 'equity' },
  
  // Pendapatan (Revenue)
  { code: '4-1000', nameId: 'Penjualan', nameEn: 'Sales', type: 'revenue' },
  { code: '4-2000', nameId: 'Pendapatan Lain', nameEn: 'Other Income', type: 'revenue' },
  
  // Beban (Expenses)
  { code: '5-1000', nameId: 'Beban Pokok Penjualan', nameEn: 'Cost of Goods Sold', type: 'expense' },
  { code: '5-2000', nameId: 'Beban Operasional', nameEn: 'Operating Expenses', type: 'expense' },
  { code: '5-3000', nameId: 'Beban Lainnya', nameEn: 'Other Expenses', type: 'expense' },
];

// Helper function to get category by code
export function getCategoryByCode(code: string): SakEmkmCategory | undefined {
  return SAK_EMKM_CATEGORIES.find(cat => cat.code === code);
}

// Helper function to get categories by type
export function getCategoriesByType(type: SakEmkmCategoryType): SakEmkmCategory[] {
  return SAK_EMKM_CATEGORIES.filter(cat => cat.type === type);
}

// ============================================
// FINANCIAL REPORTS
// ============================================

export interface BalanceSheetItem {
  description: string;
  amount: number;
}

export interface BalanceSheetCategory {
  category: SakEmkmCategory;
  amount: number;
  items: BalanceSheetItem[];
}

export interface BalanceSheet {
  asOfDate: Date;
  assets: BalanceSheetCategory[];
  totalAssets: number;
  liabilities: BalanceSheetCategory[];
  totalLiabilities: number;
  equity: BalanceSheetCategory[];
  totalEquity: number;
}

export interface ProfitLossItem {
  category: SakEmkmCategory;
  amount: number;
}

export interface ProfitLoss {
  periodStart: Date;
  periodEnd: Date;
  revenue: ProfitLossItem[];
  totalRevenue: number;
  expenses: ProfitLossItem[];
  totalExpenses: number;
  netProfit: number;
}

export interface CashFlowCategory {
  category: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface CashFlow {
  periodStart: Date;
  periodEnd: Date;
  operating: CashFlowCategory[];
  investing: CashFlowCategory[];
  financing: CashFlowCategory[];
  netCashChange: number;
  beginningCash: number;
  endingCash: number;
}

// ============================================
// DASHBOARD DATA
// ============================================

export interface HealthScoreFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface HealthScore {
  score: number; // 0-100
  trend: number; // vs last month
  factors: HealthScoreFactor[];
}

export interface BigThreeData {
  totalAssets: number;
  assetsTrend: number;
  shortTermLiabilities: number;
  liabilitiesRatio: number; // % of assets
  netEquity: number;
  equityTrend: number;
}

export interface NeedsReviewData {
  count: number;
  urgent: number; // < 0.7 confidence
  transactions: Transaction[];
}

export interface MonthlyTrendDataPoint {
  month: string;
  cashIn: number;
  cashOut: number;
  netFlow: number;
}

export interface DashboardData {
  healthScore: HealthScore;
  bigThree: BigThreeData;
  needsReview: NeedsReviewData;
  monthlyTrend: MonthlyTrendDataPoint[];
}

// ============================================
// SETTINGS & PREFERENCES
// ============================================

export interface NotificationPreferences {
  whatsappEnabled: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  monthlySummary: boolean;
  reviewReminders: boolean;
  processingComplete: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'accountant' | 'viewer';
  invitedAt: Date;
  joinedAt?: Date;
  status: 'pending' | 'active' | 'inactive';
}

// ============================================
// ONBOARDING STATE
// ============================================

export type OnboardingStep = 
  | 'whatsapp-verification' 
  | 'business-profile' 
  | 'first-upload' 
  | 'processing' 
  | 'first-review' 
  | 'subscription';

export interface OnboardingProcessingStatus {
  step: 'uploading' | 'extracting' | 'categorizing' | 'complete';
  progress: number;
  transactionsFound: number;
}

export interface OnboardingFirstUpload {
  uploadId?: string;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'failed';
}

export interface OnboardingData {
  currentStep: number;
  whatsappVerification: {
    phone: string;
    verified: boolean;
  };
  businessProfile: Partial<BusinessProfile>;
  firstUpload: OnboardingFirstUpload;
  processingStatus: OnboardingProcessingStatus;
}

// ============================================
// QUERY PARAMETERS
// ============================================

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  bankType?: BankType;
  category?: string;
  status?: TransactionStatus;
  search?: string;
  sortBy?: 'date' | 'amount' | 'confidence';
  sortOrder?: 'asc' | 'desc';
}

export interface ReportQueryParams {
  type: 'balance-sheet' | 'profit-loss' | 'cash-flow';
  periodStart: Date;
  periodEnd: Date;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: SidebarItem[];
}

// ============================================
// ANIMATION TYPES
// ============================================

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: number[] | string;
}

export interface StaggerConfig {
  staggerChildren?: number;
  delayChildren?: number;
}

// ============================================
// TESTIMONIAL (Hero Page)
// ============================================

export interface Testimonial {
  id: string;
  name: string;
  business: string;
  location: string;
  quote: string;
  avatar?: string;
}

// ============================================
// EXPORT FORMATS
// ============================================

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  periodStart: Date;
