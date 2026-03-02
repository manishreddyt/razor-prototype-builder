

## Agents Tab — Full Functionality

Transform the current static Agents page into a fully interactive agent management system with View, Configure, Deploy, and Activity tracking.

### Architecture

```text
/agents                     → Agent listing (overview + cards)
/agents/:agentId            → Agent detail (config, activity log, deploy controls)
```

Since there's no backend (Supabase not connected), all state will be managed via React `useState` with mock data. The pattern follows the existing Workflows page (chat-based AI config via Dialog).

### Page Structure

**1. Agents Overview (`/agents`) — Enhance existing page**

Keep the hero, stats, and FAQ sections. Enhance agent cards with:
- Three action buttons: **View** (navigates to detail), **Configure** (opens AI chat dialog), **Deploy/Pause** toggle
- Status indicators: `Draft` | `Configured` | `Deployed` | `Paused`
- Quick stats on each card: leads processed, conversions, last active

**2. Agent Detail Page (`/agents/:agentId`) — New page**

Tabs layout:
- **Overview tab**: Agent description, current goal, status, key metrics (leads contacted, converted, revenue generated)
- **Activity Log tab**: Scrollable list of agent actions with timestamps, outcomes, and status badges. Filter by date/type. Example entries:
  - "Called +91-98xxx — Pitched Advanced Python Course — Outcome: Interested, follow-up scheduled"
  - "Sent WhatsApp to 45 webinar attendees — 12 opened, 3 clicked CTA"
  - "Collected NPS from Batch #12 — Avg score: 8.4"
- **Configuration tab**: Shows the agent's current goal/process definition with an "Edit with AI" button that opens the chat dialog

**3. Configure Dialog (AI Chat) — New component**

Reuses the pattern from `EmailWorkflows.tsx` (AI chat mode in a Dialog). The merchant describes their goal conversationally:
- "I want this agent to call all free webinar leads within 1 hour, pitch the paid Python course, and if they say yes, send them the payment link"
- AI responds with a structured process breakdown, asks clarifying questions
- Merchant confirms, agent config is saved

Chat includes quick-start templates per agent type (e.g., "Free webinar → Paid conversion", "Post-course NPS collection").

**4. Deploy Controls**

Each agent card and detail page has a Deploy/Pause button. Deploying changes status and starts showing mock activity entries. Pausing stops new entries.

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/Agents.tsx` | Major rewrite — add state management, configure dialog, deploy toggles, navigation to detail |
| `src/pages/AgentDetail.tsx` | New — tabbed detail page with overview, activity log, configuration |
| `src/components/AgentConfigChat.tsx` | New — reusable AI chat dialog for agent configuration (follows EmailWorkflows pattern) |
| `src/App.tsx` | Add route `/agents/:agentId` |

### Mock Data

Activity log entries per agent type with realistic timestamps, actions, and outcomes. Agent state tracks: `id`, `title`, `status`, `goal`, `activities[]`, `metrics` (leads, conversions, revenue).

### UI Patterns

- Activity log uses the same `blade-card` list style as Workflows page
- Each activity row: icon + timestamp + description + outcome badge (Success/Pending/Failed)
- Configure chat follows the exact same AI chat UX from EmailWorkflows (message bubbles, quick actions, suggestion chips)
- Deploy button uses primary variant when deploying, outline when pausing

