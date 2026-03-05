# 🌊 Product Requirements Document: Arus v1.0

### _AI-Driven Automated Balance Sheet for Indonesian SMEs_

**Version:** 1.0  
**Date:** March 5, 2026  
**Founder:** Roy Tjandra (Technical Negotiator)  
**Status:** Draft → Ready for Review

---

## 1. Executive Summary

**Arus** (Indonesian for "Flow") automates the creation of compliant financial statements for Indonesian SMEs (Usaha Mikro, Kecil, dan Menengah/UMKM). By ingesting raw bank PDFs and applying AI categorization, Arus transforms messy transaction data into SAK EMKM-compliant Balance Sheets and P&L statements.

**Key Differentiator:** Unlike generic accounting software, Arus is built specifically for the Indonesian context—understanding local bank formats (BCA, Mandiri), Indonesian transaction descriptions, and SAK EMKM compliance requirements—while maintaining a "human-in-the-loop" verification system to ensure accuracy and build trust.

---

## 2. The 2026 Visual Identity System

### 2.1 Design Philosophy

To build trust in West Jakarta's SME circles, the UI must signal **"expensive simplicity"**—premium without being intimidating. The design language reflects the product name: liquid, flowing, transparent.

### 2.2 Color Palette

| Role               | Color               | Hex                     | Usage                                 |
| ------------------ | ------------------- | ----------------------- | ------------------------------------- |
| **Primary**        | Transformative Teal | `#004D4D`               | CTAs, active states, brand identity   |
| **Background**     | Off-White Paper     | `#F9F9F7`               | Main canvas, reduces eye strain       |
| **Surface**        | Frosted Glass       | `rgba(0, 77, 77, 0.05)` | Card backgrounds with blur            |
| **Border**         | Teal Whisper        | `rgba(0, 77, 77, 0.1)`  | Subtle definition                     |
| **Text Primary**   | Charcoal            | `#1A1A1A`               | Headings, primary content             |
| **Text Secondary** | Slate               | `#64748B`               | Labels, metadata                      |
| **Success**        | Verified Green      | `#10B981`               | Confirmed transactions, positive flow |
| **Warning**        | Review Amber        | `#F59E0B`               | Pending review items                  |
| **Error**          | Alert Red           | `#EF4444`               | Discrepancies, failed imports         |

### 2.3 Typography Stack

| Element          | Font       | Weight         | Size      | Notes                                                     |
| ---------------- | ---------- | -------------- | --------- | --------------------------------------------------------- |
| **H1/H2**        | Geist Sans | SemiBold (600) | 32px/24px | Geometric, tech-bank feel                                 |
| **H3/H4**        | Geist Sans | Medium (500)   | 20px/16px | Section headers                                           |
| **Body**         | Inter      | Regular (400)  | 14px      | High legibility UI standard                               |
| **Data/Numeric** | Geist Mono | Medium (500)   | 14px      | **Mandatory** for all financial figures—decimal alignment |
| **Labels**       | Inter      | Medium (500)   | 12px      | Uppercase for section labels (tracking: 0.05em)           |

**Critical Rule:** All monetary values must use `tabular-nums` CSS property to ensure vertical alignment of decimals in tables.

### 2.4 Component Specifications

#### The "Liquid" Card

```css
/* Standard Glass Card */
.glass-card {
  background: rgba(0, 77, 77, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 77, 77, 0.1);
  border-radius: 20px;
  padding: 24px;
}
```

#### Buttons

- **Primary:** Solid `#004D4D`, white text, 12px radius, 48px height
- **Secondary:** Transparent with `#004D4D` border, teal text, 12px radius
- **Tertiary:** Text only with hover underline

#### Spacing System

- Base unit: 8px
- Card padding: 24px (3 units)
- Section gaps: 32px (4 units)
- Dashboard grid gap: 24px

---

## 3. Functional Requirements

### 3.1 Tech Stack Overview

| Layer        | Technology                          | Justification                                        |
| ------------ | ----------------------------------- | ---------------------------------------------------- |
| **Frontend** | Next.js 14 (App Router)             | SSR for SEO, React Server Components for performance |
| **Styling**  | Tailwind CSS + Custom Design System | Rapid iteration, consistent tokens                   |
| **Backend**  | Node.js (Supabase Edge Functions)   | Shared TypeScript types, serverless scaling          |
| **Database** | Supabase PostgreSQL                 | Real-time subscriptions, Row Level Security          |
| **Storage**  | Supabase Storage                    | PDF ingestion, encrypted at rest                     |
| **AI/OCR**   | LlamaParse + GPT-4o-mini            | Purpose-built for table extraction, cost-effective   |
| **WhatsApp** | Twilio API / Meta Business API      | Direct integration to user behavior                  |
| **Auth**     | Supabase Auth (OTP + WhatsApp)      | Frictionless for Indonesian users                    |

### 3.2 Core Feature Specifications

#### P0: The Ingestion Engine

**Objective:** Convert BCA/Mandiri PDF bank statements into structured transaction data with >95% accuracy.

**Flow:**

1. **Upload:** User drops PDF into Next.js frontend or forwards via WhatsApp
2. **Storage:** File uploaded to Supabase Storage (`/uploads/{user_id}/{timestamp}.pdf`)
3. **Trigger:** Database webhook triggers Edge Function `process-bank-statement`
4. **OCR:** LlamaParse extracts tables → Markdown
5. **Cleaning:** GPT-4o-mini converts Markdown → JSON array
6. **Validation:** Schema validation (Zod) ensures required fields present
7. **Storage:** Raw JSON saved to `raw_extractions` table
8. **Categorization:** Trigger categorization layer
9. **User Notification:** WhatsApp notification: "Arus has processed your BCA statement. 23 transactions need your review."

**Supported Banks (v1.0):**

- BCA (Personal & Bisnis)
- Bank Mandiri (Personal & Bisnis)

**Error Handling:**

- Corrupted PDF → User notification: "We couldn't read this file. Please ensure it's the original PDF from your bank."
- Unsupported bank → Notification: "We don't support this bank yet. Contact us to add it."
- Parse failure → Flag for manual review, notify user of delay

#### P0: The AI Auditor (Categorization Engine)

**Objective:** Automatically categorize transactions into SAK EMKM-compliant categories with contextual awareness.

**SAK EMKM Categories (Level 1):**

- **Aset (Assets):** Kas & Setara Kas, Piutang, Persediaan, Aset Tetap
- **Liabilitas (Liabilities):** Hutang Usaha, Hutang Bank, Hutang Lainnya
- **Ekuitas (Equity):** Modal, Laba Ditahan
- **Pendapatan (Revenue):** Penjualan, Pendapatan Lain
- **Beban (Expenses):** Beban Pokok Penjualan (HPP), Beban Operasional, Beban Lainnya

**The "Secret Sauce" - Contextual Categorization:**

```typescript
// Pseudocode for categorization flow
async function categorizeTransaction(transaction, userId) {
  // 1. RAG Lookup: Check user history
  const historicalContext = await db.query(
    `
    SELECT category, counterparty 
    FROM transactions 
    WHERE user_id = $1 
    AND (description ILIKE $2 OR counterparty ILIKE $2)
    AND status = 'verified'
    ORDER BY date DESC
    LIMIT 5
  `,
    [userId, `%${extractCounterparty(transaction.description)}%`],
  );

  // 2. Build enriched prompt
  const prompt = `
    Categorize this Indonesian bank transaction:
    Date: ${transaction.date}
    Description: ${transaction.description}
    Amount: ${transaction.amount}
    Type: ${transaction.type}
    
    User Business Context: ${await getUserBusinessProfile(userId)}
    
    Historical Pattern: ${JSON.stringify(historicalContext)}
    
    Categories: [List of SAK EMKM categories]
    
    Return JSON: {
      "category": "SAK_EMKM_CODE",
      "confidence": 0.0-1.0,
      "explanation": "Why this category (in Indonesian)",
      "counterparty": "Extracted name",
      "splits": [] // For complex transactions
    }
  `;

  // 3. GPT-4o-mini call
  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(result.choices[0].message.content);
}
```

**Confidence Scoring:**

- **>0.9:** Auto-accept, mark as "verified"
- **0.7-0.9:** Accept but flag for monthly review
- **<0.7:** Mark "needs_review", require user confirmation

#### P1: The Concierge Bot (WhatsApp Integration)

**Objective:** Reduce friction by meeting users where they already are—WhatsApp.

**Supported Actions:**

- **Forward PDF:** User forwards bank PDF → Automatic processing trigger
- **Check Status:** "Status" → Returns processing queue and pending items count
- **Quick Review:** "Review" → Returns top 3 transactions needing confirmation with inline buttons
- **Monthly Summary:** "Laporan" → Generates and sends PDF summary
- **Help:** "Bantuan" → Context-aware help menu

**Security:**

- WhatsApp number must be verified and linked to account during onboarding
- File size limit: 10MB per PDF
- Rate limiting: 5 PDFs per hour per user

#### P1: SAK EMKM Export

**Objective:** Generate compliant financial statements for tax reporting and business licensing.

**Outputs:**

1. **Neraca (Balance Sheet)** - Standard format per SAK EMKM
2. **Laporan Laba Rugi (P&L)** - Monthly and YTD views
3. **Arus Kas (Cash Flow)** - Operating/Investing/Financing breakdown

**Format:** PDF export with digital signature placeholder, Excel export for accountant review.

---

## 4. Page Templates & User Flows

### 4.1 Template Specifications

#### 1. The Hero Landing (`/`)

**Purpose:** Conversion and trust building  
**Hero Section:**

- Full-width gradient background (Teal `#004D4D` to Deep Teal `#003333`)
- Headline: "Balance Sheet Anda, Selesai dalam Hitungan Menit"
- Subheadline: "Cukup upload laporan bank BCA atau Mandiri. Arus akan mengkategorikan otomatis sesuai standar SAK EMKM."
- **Interactive Element:** "Before/After" slider showing messy PDF vs. clean balance sheet

**Trust Signals:**

- "Bank-grade security" badge
- "100% Indonesia-compliant" badge
- Testimonial carousel from beta users (Jakarta-based SMEs)

**CTA:** Primary button "Coba Gratis 14 Hari" → Onboarding flow

#### 2. Security & Compliance (`/keamanan`)

**Purpose:** Objection handling for security-conscious SMEs  
**Layout:** Clean "Paper" aesthetic with minimal glass effects

**Content Sections:**

- **Data Residency:** "Data tersimpan di Jakarta" with server map illustration
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Access Control:** Row Level Security explanation
- **Compliance:** ISO 27001 roadmap, SAK EMKM accuracy guarantee
- **Team Access:** Role-based permissions (Owner, Accountant, Viewer)

#### 3. Command Center (Dashboard) (`/dashboard`)

**Purpose:** Financial health overview  
**Layout:** 12-column grid, responsive to 4-column on tablet/mobile

**Key Widgets:**

1. **Health Score Card (Glass, 20px radius)**
   - Overall financial health score (0-100)
   - Trend indicator (vs. last month)
   - Quick actions: "Review Pending", "Export Report"

2. **The "Big Three" (3-column layout)**
   - **Total Aset:** `Geist Mono`, green if growing
   - **Liabilitas Jangka Pendek:** `Geist Mono`, amber if >50% of assets
   - **Ekuitas Bersih:** `Geist Mono`, primary teal color

3. **"Needs Human Review" Section (Critical)**
   - **Visibility:** Always above the fold
   - **Content:** Table of pending transactions with AI guess confidence
   - **Action:** One-click confirm or edit category
   - **Urgency Indicator:** Badge showing "23 items need review"

4. **Monthly Trend Chart**
   - Minimalist line chart showing cash flow "Arus" over 6 months
   - Hover state shows exact values (Geist Mono)

#### 4. The Mutation Ledger (`/ledger`)

**Purpose:** Transaction review and categorization  
**Table Specifications:**

- **Font:** Geist Mono for all numeric columns
- **Columns:** Date | Description | Counterparty | Amount (In/Out) | AI Category | Confidence | Status | Actions
- **Row Highlighting:**
  - Verified: Subtle green left border
  - Pending: Amber left border
  - Needs Review: Red left border + pulse animation
- **Inline Editing:** Click category to dropdown select, auto-save
- **Bulk Actions:** Select multiple → "Confirm All", "Change Category"

**The "Human-in-the-Loop" Interaction:**

- When user clicks "Confirm" on AI guess:
  - Checkmark animation (Lottie)
  - Row slides subtly to "Verified" section
  - Background AI retrains on this confirmation (future improvement)

#### 5. Reports & Analytics (`/reports`)

**Purpose:** Strategic financial insights  
**Views:**

- **Neraca (Balance Sheet):** Interactive tree view, expand/collapse categories
- **Laba Rugi (P&L):** Monthly comparison, variance analysis
- **Arus Kas (Cash Flow):** Sankey diagram showing flow between categories
- **Export Options:** PDF (for tax), Excel (for accountant), CSV (raw data)

#### 6. Profile & PT Settings (`/settings`)

**Purpose:** Legal identity and preferences  
**Sections:**

- **Identitas Bisnis:** PT Perorangan details, NPWP, business address
- **Bank Connections:** Manage linked accounts (BCA, Mandiri)
- **Notifikasi:** WhatsApp preferences (frequency, types)
- **Tim:** Invite accountant/bookkeeper (email/WhatsApp invite)
- **Billing:** Subscription management (Midtrans integration)

### 4.2 User Onboarding Flow

1. **Landing** → CTA click
2. **WhatsApp Verification** → Enter number, receive OTP via WhatsApp
3. **Business Profile** → PT Perorangan name, industry, rough revenue size
4. **First Upload** → Guided upload of first bank PDF
5. **Processing State** → Animated "Arus is analyzing..." with progress steps
6. **First Review** → Guided walkthrough of "Needs Human Review" section
7. **First Report** → Generate and download first Balance Sheet
8. **Subscription Prompt** → Free tier: 50 transactions/month, then upgrade

---

## 5. Data Model (Core Tables)

```sql
-- Users & Profiles
profiles (
  id uuid PRIMARY KEY,
  business_name varchar(255),
  business_type varchar(50), -- 'PT Perorangan', 'CV', etc.
  npwp varchar(20),
  phone varchar(20),
  whatsapp_verified boolean,
  created_at timestamp
);

-- Raw uploads
uploads (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  filename varchar(255),
  storage_path varchar(500),
  bank_type varchar(50), -- 'BCA', 'MANDIRI'
  status varchar(50), -- 'processing', 'parsed', 'failed'
  raw_extraction jsonb,
  created_at timestamp
);

-- Transactions (The Core)
transactions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  upload_id uuid REFERENCES uploads(id),
  transaction_date date,
  description text,
  counterparty varchar(255),
  amount decimal(15,2),
  type varchar(10), -- 'debit', 'credit'
  category varchar(100), -- SAK EMKM category code
  ai_confidence decimal(3,2),
  status varchar(50), -- 'pending_review', 'verified', 'disputed'
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamp,
  notes text,
  created_at timestamp
);

-- Categories (SAK EMKM Standard)
categories (
  code varchar(20) PRIMARY KEY,
  name_id varchar(255),
  name_en varchar(255),
  type varchar(50), -- 'asset', 'liability', 'equity', 'revenue', 'expense'
  parent_code varchar(20) REFERENCES categories(code)
);

-- Historical Patterns (For RAG)
transaction_patterns (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  counterparty varchar(255),
  keyword varchar(100),
  category varchar(100),
  frequency integer,
  last_used timestamp
);
```

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **Page Load:** <2s for dashboard (Lighthouse score >90)
- **PDF Processing:** <30s for 10-page statement
- **Real-time Updates:** WebSocket connection for processing status

### 6.2 Security

- **Encryption:** All data AES-256 encrypted at rest
- **Transmission:** TLS 1.3 minimum
- **PII Handling:** Mask NPWP and account numbers in logs
- **Access:** Row Level Security (RLS) on all tables
- **Audit Trail:** All categorization changes logged with user ID and timestamp

### 6.3 Compliance

- **SAK EMKM:** All categories mapped to standard codes
- **Tax Reporting:** Export formats compatible with DJP (Direktorat Jenderal Pajak)
- **Data Residency:** All data stored in Jakarta region (Supabase SE Asia)

### 6.4 Reliability

- **Uptime Target:** 99.9% (excluding planned maintenance)
- **Backup:** Daily automated backups, 30-day retention
- **Disaster Recovery:** RTO <4 hours, RPO <1 hour

---

## 7. The Critical "Blindspot" System

**The Hazard:** Over-automation leading to categorization errors, destroying user trust.

**The Fix: "Human-in-the-Loop" Protocol**

### 7.1 Automatic Safeguards

1. **Confidence Threshold:** No transaction with <0.7 confidence auto-verified
2. **Anomaly Detection:** Flag transactions >3 standard deviations from user's monthly average
3. **New Counterparty:** Any new vendor/payee automatically flagged for review
4. **Category Changes:** If AI suggests different category than historical pattern, flag for review

### 7.2 User Experience

- **Dashboard Widget:** "Needs Human Review" always visible, sorted by confidence (lowest first)
- **WhatsApp Digest:** Daily summary: "Arus found 5 transactions needing your confirmation"
- **Monthly Lock:** Balance Sheet cannot be exported until all transactions for that month are verified
- **Undo Capability:** 30-second undo window for all confirmations

### 7.3 Trust Indicators

- **Accuracy Score:** Show user their verification accuracy vs. AI suggestions over time
- **Explanation:** AI provides reasoning for each suggestion ("Berdasarkan deskripsi 'TRF BCA' dan histori pembayaran ke Budi...")
- **Dispute Channel:** One-click "This is wrong" with feedback to improve model

---

## 8. Success Metrics (KPIs)

| Metric                           | Target            | Measurement                                   |
| -------------------------------- | ----------------- | --------------------------------------------- |
| **PDF Parse Success Rate**       | >95%              | % of uploads successfully parsed              |
| **Auto-categorization Accuracy** | >85%              | % of AI guesses confirmed without change      |
| **Time to First Balance Sheet**  | <5 minutes        | From upload to export                         |
| **Monthly Active Users**         | 70% of registered | Users processing >1 statement/month           |
| **Verification Completion Rate** | >90%              | % of flagged transactions reviewed within 48h |
| **NPS Score**                    | >50               | Quarterly survey                              |

---

## 9. Open Questions for Clarification

Before development begins, the following need confirmation:

1. **Pricing Model:** Freemium (50 txns/month free) or straight subscription? What price point for Indonesian SMEs?
2. **Bank Expansion:** Timeline for supporting BNI, BRI, or digital banks (Jenius, Blu)?
3. **Accountant Portal:** Do we need a separate login for external accountants, or just "share by email" exports?
4. **Multi-Currency:** Handle USD transactions in BCA statements (common for importers/exporters)?
5. **Historical Data:** How many months back should we process for initial onboarding? (Suggest 6 months for trend analysis)

---

## 10. Appendix

### A. Glossary

- **SAK EMKM:** Standar Akuntansi Keuangan Entitas Mikro, Kecil, dan Menengah (Indonesian SME Accounting Standards)
- **PT Perorangan:** Perseroan Terbatas Perorangan (Single-person limited company, common SME structure)
- **LlamaParse:** Specialized PDF table extraction service by LlamaIndex

### B. Risk Register

| Risk                     | Likelihood | Impact   | Mitigation                                |
| ------------------------ | ---------- | -------- | ----------------------------------------- |
| Bank PDF format changes  | Medium     | High     | Monitoring + rapid parser updates         |
| AI categorization errors | High       | Medium   | Human-in-the-loop + confidence thresholds |
| Data breach              | Low        | Critical | Encryption + RLS + audit trails           |
| WhatsApp API changes     | Medium     | Medium   | Abstraction layer, fallback to email      |

---

**Next Steps:**

1. Review and approve PRD
2. Create Figma design system based on Section 2
3. Set up Supabase project with schema from Section 5
4. Begin with P0: Ingestion Engine MVP

---
