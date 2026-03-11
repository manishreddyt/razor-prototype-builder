# Instagram Agent Setup Wizard - Implementation Guide

## 🎯 Overview

Comprehensive guided onboarding flow for Instagram agent that walks users through account connection, automated reply configuration, and automation rules before enabling the agent.

## ✅ What Was Implemented

### 1. Multi-Step Setup Wizard

**Component**: `InstagramSetupWizard.tsx`

4-step guided flow:
1. **Connect Account** - Instagram Business account OAuth
2. **Auto-Replies** - Configure greeting message and quick replies
3. **Automation Rules** - Enable DM auto-reply, comment conversion, cart reminders
4. **Review & Enable** - Summary of configuration before final enablement

### 2. Terminology Change

**Before**: "Deploy"
**After**: "Enable" (for Instagram agent only)

More appropriate terminology for social media integration - you "enable" an Instagram connection, not "deploy" it.

### 3. First-Time Setup Flow

**Trigger**: Click "Enable" button on Instagram agent (when status is "draft" or "configured")

**Flow**:
```
User clicks "Enable"
  ↓
Setup wizard opens
  ↓
User completes 4 steps
  ↓
Wizard closes
  ↓
Agent status → "deployed"
```

**Subsequent clicks**: If agent is already "deployed", clicking "Pause" will pause the agent (standard behavior).

## 📦 New Component: InstagramSetupWizard

### Props

```typescript
interface InstagramSetupWizardProps {
  open: boolean;              // Controls dialog visibility
  onOpenChange: (open: boolean) => void;  // Close handler
  onComplete: () => void;     // Called when setup is complete
}
```

### Key Features

#### Progress Indicator
- Visual stepper showing 4 steps
- Current step highlighted
- Completed steps show checkmark icon
- Progress bar connects steps

#### Step 1: Connect Account
- Instagram branding (purple-to-pink gradient)
- Clear requirements list:
  - Instagram Business or Creator account
  - Connected to Facebook Page
  - Admin access
- Mock OAuth flow (2-second simulation)
- Shows connected account with profile pic, username, followers
- "What's Next?" section teasing upcoming steps

#### Step 2: Auto-Replies
- Configure greeting message (textarea, 500 char limit)
- Preview of 3 pre-configured quick replies:
  - "What are your sizes?" → Size chart response
  - "How much does shipping cost?" → FREE shipping info
  - "What is your return policy?" → 7-day return policy
- Quick replies shown in preview cards (non-editable in demo)

#### Step 3: Automation Rules
- Three automation toggles with detailed descriptions:

**Auto-Reply to DMs** (Recommended badge)
- Automatically respond to product inquiries
- Example: "Do you have this in M?" → Availability + payment link

**Convert Comments to Sales** (High Impact badge)
- Turn comments into DM conversations
- Example: "Want this!" → Product card + payment link

**Cart Abandonment Reminders**
- Remind customers who didn't purchase
- Example: Viewed yesterday → Reminder with payment link

- Optional product catalog URL input

#### Step 4: Review & Enable
- Summary cards showing:
  - Connected account (profile pic, username, followers)
  - Enabled automations (with checkmarks)
  - Greeting message preview
- "What happens next?" info box:
  - Agent monitors DMs 24/7
  - Automated responses go live immediately
  - View conversations in dashboard
  - Pause or modify settings anytime
- Final CTA: "Enable Instagram Agent" (green button)

### Navigation

**Back button**: Disabled on first step
**Next button**: Enabled only when step requirements are met
**Enable button**: Only shown on final step

**Validation**:
- Step 1: Must have connected account
- Step 2: Greeting message must not be empty
- Step 3: Always can proceed (at least one automation enabled by default)
- Step 4: Always can proceed

## 🎨 Visual Design

### Color Scheme

```css
/* Instagram Branding */
--instagram-gradient: from-purple-500 to-pink-500

/* Steps */
--step-completed: bg-primary (blue)
--step-active: bg-primary/10 with ring-2 ring-primary/20
--step-inactive: bg-secondary text-muted-foreground

/* Action Button */
--enable-button: bg-green-600 hover:bg-green-700
```

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Instagram Icon] Instagram Agent Setup                │
│  Connect your account and configure automated responses│
├─────────────────────────────────────────────────────────┤
│  Progress Bar: [1]───[2]───[3]───[4]                   │
│                 ✓     ✓     •     ○                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Step Content Area - Scrollable]                       │
│                                                          │
│                                                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  [← Back]                              [Next →]         │
└─────────────────────────────────────────────────────────┘
```

### Responsive

- Desktop: Max width 768px (3xl), centered
- Mobile: Full width, scrollable content
- Progress steps: Icons only on mobile, labels on desktop

## 🔧 Integration Points

### Modified Files

#### 1. `src/pages/Agents.tsx`

**Changes**:
- Imported `InstagramSetupWizard`
- Added `showInstagramSetup` state
- Updated `handleDeploy` to check for Instagram agent:
  ```typescript
  if (agentId === "instagram" && (status === "draft" || "configured")) {
    setShowInstagramSetup(true);
    return;
  }
  ```
- Added `handleInstagramSetupComplete` to update agent status to "deployed"
- Changed button text: "Deploy" → "Enable" for Instagram
- Rendered `InstagramSetupWizard` dialog

#### 2. `src/pages/AgentDetail.tsx`

**Changes**:
- Imported `InstagramSetupWizard`
- Added `showInstagramSetup` state
- Updated `handleDeploy` with same Instagram check
- Added `handleInstagramSetupComplete` handler
- Changed button text: "Deploy" → "Enable" for Instagram
- Rendered `InstagramSetupWizard` dialog

#### 3. `src/components/InstagramSetupWizard.tsx`

**New file** - Complete setup wizard component (600+ lines)

## 📊 User Flow

### First-Time Setup (Draft/Configured Agent)

```
User at /agents page
  ↓
Sees Instagram agent card
  ↓
Clicks "Configure" (optional - sets goal)
  ↓
Agent status → "configured"
  ↓
Clicks "Enable" button
  ↓
Setup wizard opens
  ↓
Step 1: Click "Connect Instagram Account"
  ↓
(2 second loading animation)
  ↓
Account connected: @fashionstore.in
  ↓
Clicks "Next"
  ↓
Step 2: Reviews greeting message
  ↓
Edits greeting if desired
  ↓
Sees quick reply previews
  ↓
Clicks "Next"
  ↓
Step 3: Reviews automation toggles
  ↓
All enabled by default
  ↓
Optionally adds product catalog URL
  ↓
Clicks "Next"
  ↓
Step 4: Reviews configuration summary
  ↓
Sees:
  - Connected account: @fashionstore.in (12.5K followers)
  - Enabled: Auto-reply, Comment conversion, Cart reminders
  - Greeting: "Hi! 👋 Thanks for reaching out..."
  ↓
Clicks "Enable Instagram Agent"
  ↓
Wizard closes
  ↓
Agent status → "deployed"
  ↓
User sees success (agent card shows "Deployed" badge)
```

### Already Deployed Agent

```
User at /agents page
  ↓
Sees Instagram agent with "Deployed" badge
  ↓
Button shows "Pause"
  ↓
Clicks "Pause"
  ↓
Agent status → "paused"
  ↓
(No wizard shown - standard pause behavior)
```

## 🧪 Testing Checklist

### Setup Wizard Flow

- [ ] Open `/agents` page
- [ ] See Instagram agent with "Enable" button (not "Deploy")
- [ ] Click "Enable" on Instagram agent (draft/configured status)
- [ ] Setup wizard opens with 4-step progress bar
- [ ] Step 1:
  - [ ] See Instagram branding
  - [ ] See requirements list
  - [ ] Click "Connect Instagram Account"
  - [ ] See loading animation for 2 seconds
  - [ ] Account connects: @fashionstore.in with profile pic
  - [ ] "Next" button becomes enabled
- [ ] Click "Next" to Step 2
- [ ] Step 2:
  - [ ] See greeting message textarea with default text
  - [ ] Edit greeting message
  - [ ] Character count updates (x/500)
  - [ ] See 3 quick reply preview cards
  - [ ] "Next" button is enabled
- [ ] Click "Next" to Step 3
- [ ] Step 3:
  - [ ] See 3 automation toggle cards
  - [ ] All toggles ON by default
  - [ ] Toggle each automation on/off
  - [ ] See product catalog URL input (optional)
  - [ ] Enter a URL
  - [ ] "Next" button is enabled
- [ ] Click "Next" to Step 4
- [ ] Step 4:
  - [ ] See summary: Connected account card
  - [ ] See enabled automations list with checkmarks
  - [ ] See greeting message preview
  - [ ] See "What happens next?" info box
  - [ ] See green "Enable Instagram Agent" button
- [ ] Click "Enable Instagram Agent"
- [ ] Wizard closes
- [ ] Agent status changes to "Deployed"
- [ ] Button changes to "Pause"

### Navigation & Validation

- [ ] "Back" button disabled on Step 1
- [ ] "Back" button works on Steps 2-4
- [ ] "Next" disabled until Step 1 account connected
- [ ] "Next" disabled on Step 2 if greeting message empty
- [ ] "Next" always enabled on Step 3 (automations optional)
- [ ] Can't proceed past Step 1 without connecting account
- [ ] Progress bar updates correctly on each step
- [ ] Completed steps show checkmark icon
- [ ] Active step highlighted with ring

### Button Terminology

- [ ] Instagram agent shows "Enable" (not "Deploy")
- [ ] Other agents (Sales, Marketing, Support, Feedback) still show "Deploy"
- [ ] After enabled, Instagram shows "Pause"
- [ ] Other agents also show "Pause" when deployed

### Agent Detail Page

- [ ] Navigate to `/agents/instagram`
- [ ] See "Enable" button (not "Deploy")
- [ ] Click "Enable"
- [ ] Setup wizard opens
- [ ] Complete wizard
- [ ] Agent status updates to "Deployed"
- [ ] Button changes to "Pause"

### Mobile Responsiveness

- [ ] Wizard opens full-screen on mobile
- [ ] Progress steps show icons only (labels hidden)
- [ ] Content area scrolls properly
- [ ] Buttons remain fixed at bottom
- [ ] Touch targets are large enough
- [ ] All text remains readable

## 💡 Implementation Details

### Mock Data

**Connected Account** (Step 1):
```typescript
{
  username: "@fashionstore.in",
  profilePic: "https://i.pravatar.cc/150?img=20",
  followers: "12.5K",
  connected: true
}
```

**Default Greeting** (Step 2):
```
"Hi! 👋 Thanks for reaching out. How can I help you today?"
```

**Quick Replies** (Step 2):
```typescript
[
  {
    question: "What are your sizes?",
    reply: "We have sizes S, M, L, and XL available. Check our size chart: [link]"
  },
  {
    question: "How much does shipping cost?",
    reply: "FREE shipping on orders above ₹999. Otherwise ₹99 flat rate."
  },
  {
    question: "What is your return policy?",
    reply: "Easy 7-day returns. No questions asked! Just DM us for a return."
  }
]
```

**Default Automations** (Step 3):
- Auto-Reply to DMs: ✅ ON
- Convert Comments to Sales: ✅ ON
- Cart Abandonment Reminders: ✅ ON

### OAuth Simulation

```typescript
const handleConnectInstagram = async () => {
  setIsConnecting(true);
  // Simulate Instagram OAuth flow
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock connected account
  setAccount({
    username: "@fashionstore.in",
    profilePic: "https://i.pravatar.cc/150?img=20",
    followers: "12.5K",
    connected: true,
  });
  setIsConnecting(false);
};
```

**Production**: Replace with actual Instagram Graph API OAuth flow.

## 🚀 Next Steps (Future Enhancements)

### Phase 2: Real Instagram Integration
- [ ] Implement actual Instagram Graph API OAuth
- [ ] Fetch real account data (profile pic, username, followers)
- [ ] Store OAuth tokens securely
- [ ] Handle token refresh

### Phase 3: Advanced Configuration
- [ ] Editable quick reply templates
- [ ] Custom automation rules builder
- [ ] Response time configuration
- [ ] Business hours settings
- [ ] Multiple greeting messages based on time of day

### Phase 4: Testing & Verification
- [ ] Instagram DM test mode
- [ ] Send test message to verify auto-reply
- [ ] Preview mode showing how customers see responses
- [ ] Analytics preview (expected response time, coverage)

### Phase 5: Ongoing Management
- [ ] Edit configuration after initial setup
- [ ] Pause/resume specific automations
- [ ] Update quick replies without re-setup
- [ ] Re-authenticate if OAuth expires

## 📚 Related Documentation

- `INSTAGRAM_AGENT_IMPLEMENTATION.md` - Initial Instagram agent implementation
- `AGENT_ONBOARDING_UX_IMPROVEMENTS.md` - Chat UX improvements
- `UX_IMPROVEMENTS_VISUAL_GUIDE.md` - Visual design guide

## 🎯 Strategic Alignment

**FY27 E-commerce Strategy** (Q2 Roadmap):
- Targets social commerce merchants (30.5% of No-Code MTU)
- Addresses manual payment link generation pain point
- Part of ₹2-3 Cr/mo revenue opportunity
- Demonstrates automation missing from competitors (Interakt, Manychat)

**User Pain Point Solved**:
- Before: Merchants manually respond to 50-80% of Instagram DMs
- After: Automated responses within 2 minutes, 24/7
- Impact: 3-5 hours/day saved on manual DM management

---

**Status**: ✅ Complete
**Build**: ✅ Passing
**Demo**: http://localhost:8081/agents → Instagram agent → Click "Enable"
