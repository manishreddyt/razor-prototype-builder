

## Agents Page

Create a new `src/pages/Agents.tsx` page and register it in `App.tsx`.

### Page Structure

**Hero Section** — "Build Your AI Workforce" headline with subtitle about automating sales, marketing, and support for your creator business. Include a "Watch Agents@Work" banner (like the Relevance AI example) linking to a demo video.

**Stats Row** — 3 metrics: "60% faster follow-ups", "40% higher conversions", "24/7 availability"

**Agent Cards (4 cards in a grid)** — Each with icon, title, description, status badge (Coming Soon / Beta), and a "Configure" button:

1. **Sales Agent** — Follows up with free webinar leads via calls, pitches paid courses, auto-converts. Icon: PhoneCall.
2. **Marketing Agent** — Runs campaigns and retargets students across channels. Icon: Megaphone.
3. **Customer Service Agent** — WhatsApp-based agent for customer queries and support. Icon: MessageCircle.
4. **Feedback Agent** — Collects NPS scores and reviews after course completion. Icon: Star.

**FAQ Accordion** at bottom — 4-5 questions like "What are AI agents?", "How do they integrate?", "What's the ROI?", "Can they replace human reps?"

### Technical Details

- New file: `src/pages/Agents.tsx` — uses `DashboardLayout`, `blade-card` classes, Accordion component, Badge component
- Update `src/App.tsx` — add route `"/agents"` pointing to `Agents` component
- Style matches existing dashboard pages (animate-fade-in, blade-card pattern)

