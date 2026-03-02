

## Webinar Create: AI Chat UX + Builder Redesign

### Problem
Current webinar creation is a traditional multi-step form. The user wants:
1. **AI Chat UX** for the creation flow — conversational, not form-based
2. **Split-pane builder** for the landing page (form/chat left, live preview right) — matching SmartPageEditor's pattern
3. **Post-publish confirmation screen** with name, URL, share options, and actions
4. **Consistency** between preview during creation and the actual saved/published page

### Architecture

```text
WebinarCreate.tsx (full rewrite)
├── Phase 1: AI Chat Flow (full-width conversational UI)
│   ├── Bot asks questions one-by-one (name, description, paid/free, schedule, platform, reg fields)
│   ├── User responds via chat input or inline action cards (date picker, toggle, platform selector)
│   ├── Each answer updates webinar state progressively
│   └── Once all details collected → "Let me build your landing page" → transition to Phase 2
│
├── Phase 2: Landing Page Builder (split-pane)
│   ├── LEFT: Chat + form controls for editing (like SmartPageEditor's AI panel)
│   ├── RIGHT: Live webinar landing page preview (rendered from collected data)
│   └── User can tweak via chat or direct edits → "Looks good, publish!" button
│
└── Phase 3: Confirmation Screen
    ├── Success animation + webinar name
    ├── Live URL with copy button
    ├── Share options (copy link, WhatsApp, email)
    ├── Action buttons: View Live, Manage Webinar, Edit Page, Create Another
    └── "View All Pages" link to /website-builder
```

### Implementation Details

**Rewrite `src/pages/WebinarCreate.tsx`** with three phases:

**Phase 1 — Chat Flow:**
- Chat messages array with bot/user roles
- Bot asks structured questions sequentially: "What's your webinar about?", "Is it paid or free?", "When is it scheduled?", etc.
- Inline interactive elements within chat: platform selector cards (Zoom/GMeet/Custom), date/time pickers, paid/free toggle, amount input
- Each user response advances to the next question
- Progress indicator showing completion (not step-based, just a subtle progress bar)

**Phase 2 — Builder:**
- Full-screen split layout (no DashboardLayout wrapper) matching SmartPageEditor pattern
- Left panel: AI chat continuing + webinar settings form (collapsible sections for details, schedule, registration)
- Right panel: Live webinar landing page preview built from the actual webinar data — reusing the same rendering that `SmartPagePublic.tsx` will use for the published page
- This ensures **consistency** between creation preview and published page

**Phase 3 — Confirmation:**
- Replaces the current toast + redirect
- Shows: webinar name, published URL with copy, share via WhatsApp/email/copy link
- Actions: "View Live Page", "Manage Webinar" (→ SmartPageDetail), "Create Another", "View All Pages" (→ /website-builder)

**Fix consistency issue:**
- Extract webinar landing page renderer into a shared component used by both the builder preview and `SmartPagePublic.tsx`
- When a webinar is published, `SmartPagePublic.tsx` reads `webinar_${id}` from localStorage and renders the same component

### Files Changed
- `src/pages/WebinarCreate.tsx` — Full rewrite with 3-phase chat → builder → confirmation flow
- `src/components/WebinarLandingPreview.tsx` — New shared component for webinar landing page rendering (used in both builder and public view)
- `src/pages/SmartPagePublic.tsx` — Detect `pageType: "webinar"` and render `WebinarLandingPreview` using stored webinar data

