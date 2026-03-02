

## Smart Pages: Education Commerce Platform Upgrade

This is a ground-up redesign of Smart Pages into a full merchant operations platform, starting with the Education category. The goal: let merchants run their entire online education business (courses, webinars, 1:1 sessions) from within the Razorpay dashboard.

---

### Architecture Overview

```text
Smart Pages (Education)
├── Page Types (each with dedicated creation wizard)
│   ├── Online Course    → Landing page + Products + Checkout
│   ├── Webinar          → Landing page + Registration + Meeting link + Attendees
│   ├── 1:1 Coaching     → Landing page + Booking slots + Checkout
│   ├── Workshop         → Landing page + Schedule + Enrollment
│   └── Membership       → Landing page + Plans + Recurring billing
│
├── Connectors (sidebar nav)
│   ├── Zoom
│   ├── Google Meet
│   ├── Google Calendar
│   └── Google Drive
│
└── Manage View (per page, enhanced)
    ├── Overview
    ├── Customers / Registrations
    ├── Transactions
    ├── Analytics
    ├── Attendees (post-event, Zoom API or CSV upload)
    ├── Workflow (triggers → actions)
    ├── Communications
    └── Settings
```

---

### What Will Be Built

#### 1. Webinar Creation Wizard (new multi-step flow)
A dedicated step-by-step creation flow for webinars replacing the current generic template picker when "Webinar" is selected:

- **Step 1 — Basic Details**: Webinar name, description, banner image, paid/free toggle, amount (if paid)
- **Step 2 — Schedule & Meeting**: Date/time picker, duration, timezone. Connect Zoom/GMeet or paste meeting link. Create new event or select existing.
- **Step 3 — Registration Form**: Default fields (Name, Email, Phone) + customizable additional fields (Experience Level, Company, etc.)
- **Step 4 — Landing Page Preview**: Live preview of the generated webinar landing page with all details populated
- **Step 5 — Publish**: Review and publish

#### 2. Enhanced Page Type Selection (SmartPageCreate redesign)
Instead of a flat template grid, education category shows **purpose-driven cards**:
- "Sell an Online Course"
- "Host a Webinar"  
- "Offer 1:1 Coaching Sessions"
- "Run a Workshop Series"
- "Build a Membership Community"

Each card leads to its specific creation wizard.

#### 3. Connectors Page & Sidebar Nav
- New "Connectors" item in the left sidebar under a new section
- Connectors page showing available integrations (Zoom, Google Meet, Google Calendar, Google Drive) with connect/disconnect state
- Mock connection flow (since actual OAuth requires backend — UI will show the flow, actual integration would need Supabase edge functions)

#### 4. Enhanced Manage/Detail View (SmartPageDetail upgrade)
New tabs added to the existing detail view:

- **Attendees Tab** (for webinars): Table of attendees with attended/absent status. "Import from Zoom" button + CSV upload option. Post-event attendance tracking.
- **Workflow Tab**: Visual trigger-action builder. Example triggers: "On Registration", "Post Event", "Payment Success". Actions: Send Email, Send WhatsApp, Send SMS, Enroll in Course. Each workflow is a card with trigger → action chain.
- Enhanced **Customers** tab to show registrations with form field data

#### 5. Data Model Updates
- Extend `SmartPageSite` with `pageType` (webinar/course/coaching/workshop/membership), `eventConfig` (date, time, duration, meetingLink, platform), `registrationFields`, `workflows`
- New types: `EventConfig`, `WorkflowTrigger`, `WorkflowAction`, `Attendee`

#### 6. Public Webinar Page
- Customer-facing registration page at `/s/:slug` with webinar details, countdown, speaker info, and registration form
- Registration confirmation with meeting link reveal (for free) or payment flow (for paid)

---

### Technical Details

**New files:**
- `src/pages/WebinarCreate.tsx` — Multi-step webinar creation wizard
- `src/pages/Connectors.tsx` — Connectors management page
- `src/types/smartPages.ts` — Centralized types for the upgraded data model

**Modified files:**
- `src/pages/SmartPageCreate.tsx` — Education category shows purpose-driven cards instead of templates
- `src/pages/SmartPageDetail.tsx` — Add Attendees and Workflow tabs
- `src/pages/WebsiteBuilder.tsx` — Show page type badges, updated list columns
- `src/pages/SmartPagePublic.tsx` — Handle webinar registration flow
- `src/components/layout/DashboardSidebar.tsx` — Add Connectors nav item
- `src/App.tsx` — New routes for webinar creation and connectors
- `src/data/smartPageTemplates.ts` — Education templates get `pageType` metadata

**Implementation priority:** Webinar flow first (most complex, validates the pattern), then extend to other education types.

---

### Scope Boundaries
- Zoom/GMeet integration will be **UI-complete with mock data** (actual OAuth requires Supabase backend setup)
- Workflow engine will be **visual configuration only** (trigger-action cards, no actual execution without backend)
- WhatsApp/SMS actions shown as options but flagged as "coming soon" or mock
- CSV upload for attendees will parse and display data in-browser (localStorage)

