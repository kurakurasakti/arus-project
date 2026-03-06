# Arus Component Hierarchy Diagram

## Visual Component Tree

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              APP ROUTER STRUCTURE                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

Root Layout (app/layout.tsx)
├── Metadata Provider
├── Font Provider (Geist Sans, Geist Mono)
└── Theme Provider
    ├── (marketing) Group
    │   └── Marketing Layout
    │       ├── Navbar
    │       │   ├── Logo
    │       │   ├── Nav Links
    │       │   └── CTA Button
    │       ├── Page Content
    │       │   ├── Hero Page (/)
    │       │   │   ├── HeroSection
    │       │   │   │   ├── Headline (animated)
    │       │   │   │   ├── Subheadline
    │       │   │   │   └── CTA Buttons
    │       │   │   ├── BeforeAfterSlider (interactive)
    │       │   │   ├── TrustBadges
    │       │   │   └── TestimonialCarousel
    │       │   └── Security Page (/keamanan)
    │       │       ├── SecurityHero
    │       │       ├── DataResidencySection
    │       │       ├── EncryptionSection
    │       │       ├── ComplianceSection
    │       │       └── TeamAccessSection
    │       └── Footer
    │
    ├── (dashboard) Group
    │   └── Dashboard Layout
    │       ├── Sidebar (collapsible)
    │       │   ├── Logo
    │       │   ├── Navigation Items
    │       │   │   ├── Dashboard Link
    │       │   │   ├── Ledger Link
    │       │   │   ├── Reports Link
    │       │   │   └── Settings Link
    │       │   └── User Profile Preview
    │       ├── Header
    │       │   ├── Page Title
    │       │   ├── Search
    │       │   ├── Notifications
    │       │   └── User Menu
    │       └── Main Content Area
    │           ├── Dashboard Page (/dashboard)
    │           │   ├── PageTransition wrapper
    │           │   ├── HealthScoreCard
    │           │   │   ├── ScoreDisplay (AnimatedCounter)
    │           │   │   ├── TrendIndicator
    │           │   │   └── QuickActions
    │           │   ├── BigThreeStats (3-column grid)
    │           │   │   ├── TotalAset Card
    │           │   │   ├── Liabilitas Card
    │           │   │   └── Ekuitas Card
    │           │   ├── NeedsReviewSection
    │           │   │   ├── SectionHeader with Badge
    │           │   │   └── CompactTransactionTable
    │           │   └── MonthlyTrendChart (Recharts)
    │           │
    │           ├── Ledger Page (/ledger)
    │           │   ├── PageTransition wrapper
    │           │   ├── FiltersBar
    │           │   │   ├── DateRangePicker
    │           │   │   ├── BankFilter
    │           │   │   ├── CategoryFilter
    │           │   │   └── StatusFilter
    │           │   ├── TransactionTable
    │           │   │   ├── TableHeader
    │           │   │   ├── TableBody
    │           │   │   │   └── TransactionRow (many)
    │           │   │   │       ├── Date Cell
    │           │   │   │       ├── Description Cell
    │           │   │   │       ├── Counterparty Cell
    │           │   │   │       ├── Amount Cell (font-data)
    │           │   │   │       ├── CategoryDropdown
    │           │   │   │       ├── ConfidenceBadge
    │           │   │   │       ├── StatusIndicator
    │           │   │   │       └── Actions Menu
    │           │   │   └── TableFooter
    │           │   │       └── Pagination
    │           │   └── BulkActionsBar (appears on selection)
    │           │
    │           ├── Reports Page (/reports)
    │           │   ├── PageTransition wrapper
    │           │   ├── Tabs (Neraca/LabaRugi/ArusKas)
    │           │   ├── BalanceSheetTree (Tab 1)
    │           │   │   ├── AssetSection
    │           │   │   ├── LiabilitySection
    │           │   │   └── EquitySection
    │           │   ├── ProfitLossChart (Tab 2)
    │           │   │   └── MonthlyComparisonChart
    │           │   ├── CashFlowSankey (Tab 3)
    │           │   │   └── SankeyDiagram
    │           │   └── ExportOptions
    │           │       ├── PDF Export Button
    │           │       ├── Excel Export Button
    │           │       └── CSV Export Button
    │           │
    │           └── Settings Page (/settings)
    │               ├── PageTransition wrapper
    │               ├── SettingsTabs
    │               ├── BusinessProfileForm (Tab 1)
    │               │   └── FormFields with validation
    │               ├── BankConnections (Tab 2)
    │               │   └── BankCard list
    │               ├── NotificationPreferences (Tab 3)
    │               │   └── Toggle switches
    │               ├── TeamManagement (Tab 4)
    │               │   └── MemberList + InviteForm
    │               └── SubscriptionCard (Tab 5)
    │
    └── (onboarding) Group
        └── Onboarding Layout
            ├── StepIndicator (progress bar)
            │   ├── Step 1: WhatsApp
            │   ├── Step 2: Business
            │   ├── Step 3: Upload
            │   ├── Step 4: Processing
            │   ├── Step 5: Review
            │   └── Step 6: Subscribe
            └── Step Content
                ├── WhatsAppVerification Page
                │   ├── PhoneInput
                │   ├── OTPInput
                │   └── VerifyButton
                ├── BusinessProfile Page
                │   └── BusinessProfileForm
                ├── FirstUpload Page
                │   ├── PDFUploader (drag-drop)
                │   └── UploadProgress
                ├── Processing Page
                │   └── ProcessingAnimation
                │       ├── FlowWave animation
                │       ├── ProgressSteps
                │       └── TransactionCounter
                ├── FirstReview Page
                │   └── ReviewTutorial
                │       ├── GuidedWalkthrough
                │       └── SampleTransaction
                └── Subscription Page
                    └── PricingCards
                        ├── FreeTier Card
                        ├── BasicTier Card
                        └── ProTier Card
```

## Component Composition Patterns

### 1. Page Component Pattern

```tsx
// app/(dashboard)/dashboard/page.tsx
import { PageTransition } from "@/components/animations/page-transition";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { BigThreeStats } from "@/components/dashboard/big-three-stats";

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <HealthScoreCard />
        <BigThreeStats />
      </div>
    </PageTransition>
  );
}
```

### 2. Card Composition Pattern

```tsx
// components/dashboard/health-score-card.tsx
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedCounter } from "@/components/animations/animated-counter";

export function HealthScoreCard({ score }: { score: number }) {
  return (
    <GlassCard>
      <h3>Financial Health</h3>
      <AnimatedCounter value={score} />
    </GlassCard>
  );
}
```

### 3. Table Row Pattern

```tsx
// components/ledger/transaction-row.tsx
import { StatusIndicator } from "./status-indicator";
import { CategoryDropdown } from "./category-dropdown";

export function TransactionRow({ transaction }: Props) {
  return (
    <tr className={getRowStyles(transaction.status)}>
      <td>{formatDate(transaction.date)}</td>
      <td>{transaction.description}</td>
      <td className="font-data">{formatCurrency(transaction.amount)}</td>
      <td>
        <CategoryDropdown value={transaction.category} />
      </td>
      <td>
        <StatusIndicator status={transaction.status} />
      </td>
    </tr>
  );
}
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          STATE FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

User Interaction
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Local State │────▶│ Server State │◀────│  Global State│
│  useState    │     │ React Query  │     │   Zustand    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  API Client  │
                     │   (fetch)    │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Backend    │
                     │    API       │
                     └──────────────┘

Examples:
- Form Input ──────▶ Local State (useState)
- Transaction List ─▶ Server State (React Query)
- User Session ─────▶ Global State (Zustand)
- Sidebar Collapsed ─▶ Global State (Zustand)
```

## Animation Hierarchy

```
Page Load
├── PageTransition (fade + slide)
│   └── StaggerContainer (children stagger)
│       ├── Component A (fade up)
│       ├── Component B (fade up)
│       └── Component C (fade up)
│
User Interaction
├── Button Hover (scale)
├── Card Hover (lift + shadow)
└── Row Verification
    ├── Checkmark Animation (spring)
    ├── Row Slide Out
    └── List Reorder (layout)

Scroll Trigger
├── Fade In Up (when visible)
├── Counter Animation (count up)
└── Chart Draw (path animation)
```

## File Dependencies

### Critical Path

```
layout.tsx
├── page.tsx (depends on layout)
├── layout/
│   ├── sidebar.tsx (depends on ui components)
│   └── header.tsx
├── components/
│   ├── ui/ (base components)
│   ├── shared/ (shared utilities)
│   └── [feature]/ (page-specific)
└── hooks/ (data fetching)
```

### Shared Components Used Across Pages

| Component       | Used In                              |
| --------------- | ------------------------------------ |
| GlassCard       | Dashboard, Ledger, Reports, Settings |
| StatusBadge     | Dashboard, Ledger                    |
| AnimatedCounter | Dashboard                            |
| PageTransition  | All pages                            |
| EmptyState      | Ledger, Reports                      |
| LoadingSpinner  | All data-loading states              |

## Build Order Recommendation

1. **Foundation** (Week 1)
   - Root layout + fonts
   - TypeScript types
   - Shared utilities (GlassCard, formatters)
   - Animation wrappers

2. **Layouts** (Week 1-2)
   - Marketing layout + Navbar/Footer
   - Dashboard layout + Sidebar/Header
   - Onboarding layout + StepIndicator

3. **Marketing Pages** (Week 2)
   - Hero page with Before/After slider
   - Security page

4. **Dashboard Pages** (Week 3-4)
   - Dashboard with widgets
   - Ledger with table
   - Reports with charts
   - Settings with forms

5. **Onboarding Flow** (Week 4)
   - All 6 steps
   - Processing animation

6. **Integration** (Week 5)
   - API connection
   - State management
   - Testing

---

_This diagram should be used as a reference during implementation to understand component relationships and dependencies._
