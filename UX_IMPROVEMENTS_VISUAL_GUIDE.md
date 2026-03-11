# Agent Onboarding UX - Visual Guide

## 🎯 Quick Visual Reference

### 1. Template Selection (Opening Screen)

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ Configure Sales Agent                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👋 Welcome! Let's set up your Sales Agent                  │
│                                                              │
│  I'll help you configure what this agent should do and when.│
│  You can describe your goal in your own words, or pick one  │
│  of the templates below to get started quickly.             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 💡 Choose a template to get started:                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [1]  Free webinar → Paid conversion              →    │ │
│  │      Call leads within 1hr, pitch paid course,         │ │
│  │      send payment link                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [2]  Demo request follow-up                      →    │ │
│  │      Follow up with demo requests, qualify             │ │
│  │      and convert                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [3]  Re-engage cold leads                        →    │ │
│  │      Contact leads who haven't responded               │ │
│  │      in 7 days                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Type your goal, or pick a template above...  [Send →]    │
└─────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
- ✅ Clear welcome message
- ✅ Numbered template cards (1, 2, 3)
- ✅ Two-line descriptions with proper spacing
- ✅ Arrow indicators showing clickability
- ✅ Section header explaining templates

---

### 2. AI Response (After Selecting Template)

```
┌─────────────────────────────────────────────────────────────┐
│  User Message (Right-aligned, Blue):                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Free webinar → Paid conversion      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  AI Response (Left-aligned, White background):              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Got it! Here's your workflow: 🎯                       │ │
│  │                                                         │ │
│  │ 1. Trigger: After webinar ends                         │ │
│  │ 2. Action: Call attendees within 1 hour                │ │
│  │ 3. Pitch: Advanced Python Course                       │ │
│  │ 4. Close: Send payment link if interested              │ │
│  │                                                         │ │
│  │ Ready to save?                                         │ │
│  │ ─────────────────────────────────────────────────────  │ │
│  │ ✨ Quick actions:                                      │ │
│  │                                                         │ │
│  │ [✓ Save this configuration]  [Add more steps]          │ │
│  │ [Change the timing]  [Include follow-up actions]       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
- ✅ Clear section header with emoji
- ✅ Numbered steps (1, 2, 3, 4)
- ✅ Bold labels for each step
- ✅ Proper spacing between lines
- ✅ Section divider before actions
- ✅ Save button highlighted in primary color with checkmark icon
- ✅ Other actions in secondary styling

---

### 3. Button Styling Comparison

#### Template Buttons (Hover State)

**Before:**
```
┌──────────────────────────────────┐
│ Free webinar → Paid conversion  │
│ Call leads within 1hr, pitch... │
└──────────────────────────────────┘
Small, plain, hard to read
```

**After:**
```
┌────────────────────────────────────────────┐
│ ┌───┐  Free webinar → Paid conversion  → │
│ │ 1 │  Call leads within 1hr, pitch paid  │
│ └───┘  course, send payment link          │
└────────────────────────────────────────────┘
Numbered, spacious, clear hierarchy
```

#### Action Buttons

**Before:**
```
[Save] [Add more steps] [Change timing]
All same size, same color
```

**After:**
```
[✓ Save this configuration] ← Primary, Green, Bold
[Add more steps] [Change timing] ← Secondary, White
Clear visual hierarchy
```

---

### 4. Content Formatting Comparison

#### Before (Plain Text):
```
I understand you want to set up a workflow. Let me break this down.
First, we need to understand the trigger point, which in this case
would be after the webinar ends. Then we'll proceed with the actions
like calling attendees and pitching the course. Finally, we'll send
a payment link if they're interested. Does this sound good?
```
❌ Wall of text
❌ Hard to scan
❌ No structure

#### After (Markdown Rendered):
```
Got it! Here's your workflow: 🎯

1. Trigger: After webinar ends
2. Action: Call attendees within 1 hour
3. Pitch: Advanced Python Course
4. Close: Send payment link if interested

Ready to save?
```
✅ Clear sections
✅ Easy to scan
✅ Numbered steps

---

### 5. Color Coding Guide

```
┌─────────────────────────────────────────────────────────────┐
│  Template Buttons:                                          │
│  ┌────────────────────────────────────┐                    │
│  │ bg-secondary/50                    │ Default state      │
│  │ hover:bg-secondary + shadow        │ Hover state        │
│  │ border-border/60 → border-primary  │ Active state       │
│  └────────────────────────────────────┘                    │
│                                                              │
│  Save Button:                                               │
│  ┌────────────────────────────────────┐                    │
│  │ bg-primary (Blue/Green)            │ Prominent CTA      │
│  │ text-primary-foreground (White)    │                    │
│  │ shadow-md + border-2               │ Stands out         │
│  └────────────────────────────────────┘                    │
│                                                              │
│  Secondary Buttons:                                         │
│  ┌────────────────────────────────────┐                    │
│  │ bg-background (White)              │ Less prominent     │
│  │ border border-border/60            │                    │
│  │ hover:shadow-md                    │ Subtle hover       │
│  └────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Spacing & Typography

```
Message Bubble Padding:
  Before: px-4 py-3 (16px × 12px)
  After:  px-5 py-4 (20px × 16px)
  Impact: +25% more breathing room

Line Spacing:
  Before: Default (1.5)
  After:  leading-relaxed (1.625)
  Impact: Easier to read

Section Gaps:
  Before: space-y-4 (16px)
  After:  space-y-5 (20px)
  Impact: Clearer message separation

Font Sizes:
  - Headers: text-sm font-semibold
  - Body: text-sm leading-relaxed
  - Descriptions: text-xs
  - Labels: text-xs font-medium
```

---

### 7. Interaction States

```
Template Button States:
  Idle:   bg-secondary/50 border-border/60
  Hover:  bg-secondary shadow-md border-primary/40
  Active: (Click → Send message)

Save Button States:
  Idle:   bg-primary text-white shadow-md
  Hover:  bg-primary/90 shadow-lg
  Active: (Click → Save configuration)

Input Field:
  Idle:   border-border
  Focus:  border-primary ring-primary
  Typing: Auto-focus on modal open
```

---

## 🎨 Design Tokens

```css
/* Colors */
--primary: hsl(221, 83%, 53%)        /* Blue for CTAs */
--secondary: hsl(210, 40%, 96%)      /* Light gray for templates */
--border: hsl(214, 32%, 91%)         /* Subtle borders */
--foreground: hsl(222, 47%, 11%)     /* Dark text */
--muted-foreground: hsl(215, 16%, 47%) /* Secondary text */

/* Spacing */
--spacing-4: 1rem    (16px)
--spacing-5: 1.25rem (20px)
--spacing-3: 0.75rem (12px)

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)

/* Border Radius */
--rounded-xl: 0.75rem  (12px)
--rounded-2xl: 1rem    (16px)
--rounded-lg: 0.5rem   (8px)
```

---

## 📱 Mobile Responsiveness

```
Desktop (> 768px):
  - Template buttons: Full width with 3-column layout
  - AI messages: Max 85% width
  - Suggestions: Flex wrap with gaps

Mobile (< 768px):
  - Template buttons: Stack vertically
  - AI messages: Max 95% width
  - Suggestions: Stack vertically
  - Smaller padding to fit content
```

---

## ✅ Testing Checklist

**Visual:**
- [ ] Template cards have numbered indicators
- [ ] Hover states show shadows and color shifts
- [ ] Save button is visibly different (primary color)
- [ ] Markdown renders properly (bold, lists)
- [ ] Spacing looks balanced
- [ ] Section headers are visible

**Interaction:**
- [ ] Clicking template sends message
- [ ] Input auto-focuses on modal open
- [ ] Typing indicator animates
- [ ] Save button triggers save action
- [ ] Hover states work on all buttons

**Content:**
- [ ] AI responses are short and scannable
- [ ] Steps are numbered clearly
- [ ] Sections have proper spacing
- [ ] Emojis add visual breaks

---

**Demo URL**: http://localhost:8081/agents
**Test Flow**: Click any agent → Configure → See improvements
