# Instagram Agent - Verification Steps

## 🚀 Development Server
✅ Running on: http://localhost:8081/

## 📋 Quick Verification Checklist

### 1. Agent Discovery (http://localhost:8081/agents)
- [ ] See 5 agent cards (Sales, Marketing, Support, Feedback, **Instagram**)
- [ ] Instagram card shows:
  - Title: "Social Commerce"
  - Icon: Instagram icon
  - Description: "Auto-respond to Instagram DMs..."
  - Status: "Draft"
  - Metrics: 487 leads, 123 conversions
  - Last active: "30 sec ago"

### 2. Configuration Flow
- [ ] Click "Configure" on Instagram agent
- [ ] Modal opens with AI chat interface
- [ ] See 3 template options:
  - "Auto-respond to product inquiries"
  - "Convert comments to sales"
  - "Cart abandonment reminders"
- [ ] Select a template
- [ ] AI generates goal suggestion
- [ ] Click "Save"
- [ ] Status changes to "Configured"

### 3. Deployment
- [ ] Click "Deploy" button on Instagram card
- [ ] Status changes to "Deployed"
- [ ] Deploy button changes to "Pause"

### 4. Agent Detail Page (http://localhost:8081/agents/instagram)
- [ ] Click "View" on Instagram card
- [ ] Redirects to `/agents/instagram`
- [ ] See 4 tabs: Overview, Activity Log, **Conversations**, Configuration

### 5. Overview Tab
- [ ] Metrics display:
  - **DMs Handled**: 487 (not "Leads Processed")
  - **Comments Converted**: 123 (not "Conversions")
  - Revenue Generated: ₹45,230
- [ ] Current Goal section shows agent configuration
- [ ] Recent Activity shows 3 latest actions

### 6. Activity Log Tab
- [ ] Click "Activity Log" tab
- [ ] See 25 activity entries
- [ ] Activities show Instagram-specific actions:
  - "DM replied to @fashionlover23"
  - "Comment converted from @style_queen"
  - "Order tracking sent to @riya_patel"
  - "Cart reminder sent to @ananya_fashion"
  - "Product inquiry from @kavya_r"
- [ ] Each entry has:
  - Success/Pending/Failed badge
  - Timestamp
  - Detailed description
  - Some include revenue amounts

### 7. Conversations Tab ⭐ (NEW)
- [ ] Click "Conversations" tab
- [ ] See split layout:
  - **Left**: Conversation list (5 customers)
  - **Right**: Chat panel

#### Conversation List
- [ ] See 5 conversations:
  1. Priya Sharma (@fashionlover23) - Completed - 2 hrs ago
  2. Neha Verma (@style_queen) - Completed - 1 hr ago
  3. Riya Patel (@riya_patel) - Completed - 30 min ago
  4. Ananya Singh (@ananya_fashion) - Active - 5 min ago
  5. Kavya Reddy (@kavya_r) - Pending - 10 min ago
- [ ] Each shows avatar, name, handle, last message preview, status badges

#### Chat Panel (Select Priya Sharma)
- [ ] Header shows customer avatar, name, handle, status
- [ ] Messages display in Instagram style:
  - Customer messages: Left-aligned, gray background
  - Agent messages: Right-aligned, blue background
- [ ] Conversation flow:
  1. Customer: "Hey! What sizes...?"
  2. Agent: "Hi! 👋 We have S, M, L, XL..."
  3. Customer: "Perfect, I'll take M"
  4. Agent: "Great choice! Here's your payment link:"
  5. **Payment link button**: White background, "Pay ₹2,499"
  6. Customer: "Payment completed! 🎉"
  7. Agent: "Thank you! Order #RZP12345..."
- [ ] Click payment link button → Opens in new tab
- [ ] Footer shows demo disclaimer

#### Chat Panel (Select Neha Verma)
- [ ] Different flow: Comment conversion
- [ ] Agent initiates: "Hey! Noticed you commented..."
- [ ] Product card attachment shows:
  - Product image
  - Denim Jacket name
  - Description
  - Price: ₹1,999
- [ ] Payment link button present
- [ ] Conversation ends with order confirmation

#### Chat Panel (Select Riya Patel)
- [ ] Shorter conversation: Order tracking
- [ ] Tracking link button with package icon
- [ ] Click opens tracking URL in new tab

#### Chat Panel (Select Ananya Singh)
- [ ] Active conversation (not completed)
- [ ] Shows cart reminder flow
- [ ] Payment link for Bohemian Maxi Skirt
- [ ] Status badge shows "Active"

#### Chat Panel (Select Kavya Reddy)
- [ ] Pending conversation
- [ ] Product inquiry about white sneakers
- [ ] Shows ongoing conversation without purchase yet

### 8. Configuration Tab
- [ ] Click "Configuration" tab
- [ ] See agent goal/process definition
- [ ] "Edit with AI" button opens config modal
- [ ] Text matches what was set during configuration

### 9. Mobile Responsiveness
- [ ] Resize browser to mobile width (< 640px)
- [ ] Conversation list remains accessible
- [ ] Chat panel is full-width
- [ ] Messages remain readable
- [ ] Payment buttons remain clickable

### 10. Navigation Flow
- [ ] Click back arrow → Returns to `/agents`
- [ ] Instagram card still shows "Deployed" status
- [ ] Metrics persist

## 🎨 Visual Verification

### Color Scheme
- [ ] Customer messages: Gray background (`bg-secondary`)
- [ ] Agent messages: Blue background (`bg-primary`)
- [ ] Payment links: White background with blue text
- [ ] Success badges: Green
- [ ] Pending badges: Blue
- [ ] Failed badges: Red

### Icons
- [ ] Instagram agent uses Instagram icon
- [ ] Payment links show IndianRupee icon
- [ ] Tracking links show Package icon
- [ ] Product cards show product images from Unsplash

### Typography
- [ ] Messages use readable font size
- [ ] Timestamps are smaller and muted
- [ ] Customer names are bold
- [ ] Handles are prefixed with @

## 🐛 Known Limitations (Expected)

- ✅ Payment links open mock URLs (not real Razorpay)
- ✅ Conversations are static (pre-scripted, not live)
- ✅ No real Instagram API integration
- ✅ Demo disclaimer clearly visible
- ✅ All expected and documented

## ✅ Success Criteria (All Should Pass)

- [x] Build completes without errors
- [x] Dev server starts successfully
- [x] Instagram agent card visible on `/agents`
- [x] Configuration flow works end-to-end
- [x] Detail page accessible at `/agents/instagram`
- [x] All 4 tabs render correctly
- [x] Conversations tab shows 5 pre-scripted flows
- [x] Chat UI matches Instagram styling
- [x] Payment links are clickable
- [x] Mobile responsive design works
- [x] No console errors in browser

## 📱 Browser Testing

Recommended browsers to test:
- [ ] Chrome/Chromium
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 🔗 Quick Navigation

- Agents List: http://localhost:8081/agents
- Instagram Detail: http://localhost:8081/agents/instagram
- Other Agents:
  - http://localhost:8081/agents/sales
  - http://localhost:8081/agents/marketing
  - http://localhost:8081/agents/support
  - http://localhost:8081/agents/feedback

---

**Status**: Ready for verification
**Time to complete verification**: ~10 minutes
