# Zapier Workflow Builder - UI Flow

## User Interface Flow for Post-Payment → Google Sheets Workflow

---

## Page 1: Workflow Builder Landing

```
┌─────────────────────────────────────────────────────────────┐
│  Zapier — Workflow Builder                      [Installed] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Connect 6,000+ apps to build powerful automated workflows   │
│                                                               │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │ Active      │ Events      │ Total       │ Status       │ │
│  │ Users       │ Today       │ Actions     │              │ │
│  ├─────────────┼─────────────┼─────────────┼──────────────┤ │
│  │     0       │      0      │      0      │   Active ●   │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
│                                                               │
│  [+ Create New Workflow]              [Configure Settings]   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Popular Workflow Templates                            │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  📊 Log Payments to Google Sheets                      │  │
│  │  📧 Send Receipt Emails                                │  │
│  │  📱 WhatsApp Payment Notifications                     │  │
│  │  💳 Add Customers to CRM                               │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 2: Create Workflow - Step 1 (Choose Trigger)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Workflows                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Create New Workflow                                         │
│                                                               │
│  Step 1 of 3: Choose a Trigger                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│  ●━━━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━━○                    │
│  Trigger          Configure             Action                │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Select Trigger Event                                  │  │
│  │                                                        │  │
│  │  [Search for an app or event...]                      │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  ✓ Razorpay                        [Connected]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  Choose when this workflow should trigger:            │  │
│  │                                                        │  │
│  │  ○ Payment Captured                                   │  │
│  │    Triggers when a payment is successfully captured   │  │
│  │                                                        │  │
│  │  ○ Payment Failed                                     │  │
│  │    Triggers when a payment fails                      │  │
│  │                                                        │  │
│  │  ○ Payment Link Paid                                  │  │
│  │    Triggers when a payment link is paid              │  │
│  │                                                        │  │
│  │  ○ Order Paid                                         │  │
│  │    Triggers when an order is paid                     │  │
│  │                                                        │  │
│  │  ○ Subscription Charged                               │  │
│  │    Triggers when a subscription is charged            │  │
│  │                                                        │  │
│  │  ○ Invoice Paid                                       │  │
│  │    Triggers when an invoice is paid                   │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│                                      [Cancel]  [Continue →]  │
└─────────────────────────────────────────────────────────────┘
```

**User selects:** ✓ Payment Captured

---

## Page 3: Configure Trigger - Step 2

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Workflows                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Create New Workflow                                         │
│                                                               │
│  Step 2 of 3: Configure Trigger                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│  ●━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━○                    │
│  Trigger          Configure             Action                │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Razorpay → Payment Captured                          │  │
│  │                                                        │  │
│  │  Configure when this workflow should trigger          │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Filter by Amount (Optional)                     │ │  │
│  │  │  ┌─────────────┐  ┌────────────────────────────┐ │ │  │
│  │  │  │ Minimum ₹   │  │ Maximum ₹                  │ │ │  │
│  │  │  └─────────────┘  └────────────────────────────┘ │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Filter by Payment Method (Optional)             │ │  │
│  │  │  ☐ Card    ☐ UPI    ☐ Net Banking    ☐ Wallet   │ │  │
│  │  │  ☐ All Methods                                   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Sample Trigger Data (Latest Payment)            │ │  │
│  │  │  ┌────────────────────────────────────────────┐  │ │  │
│  │  │  │ Payment ID:    pay_MN3kXbMpuQzKc9          │  │ │  │
│  │  │  │ Order ID:      order_MN3kXbMpuQzKc8        │  │ │  │
│  │  │  │ Amount:        ₹500.00                     │  │ │  │
│  │  │  │ Customer:      Rahul Sharma                │  │ │  │
│  │  │  │ Email:         rahul@example.com           │  │ │  │
│  │  │  │ Phone:         +919876543210               │  │ │  │
│  │  │  │ Method:        Card                        │  │ │  │
│  │  │  │ Status:        Captured                    │  │ │  │
│  │  │  │ Date:          06/03/2026 18:13:37        │  │ │  │
│  │  │  └────────────────────────────────────────────┘  │ │  │
│  │  │  [Refresh Sample Data]                           │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│                                [← Back]  [Continue →]        │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 4: Choose Action - Step 3

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Workflows                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Create New Workflow                                         │
│                                                               │
│  Step 3 of 3: Add Actions                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│  ●━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━●                    │
│  Trigger          Configure             Action                │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Select Action App                                     │  │
│  │                                                        │  │
│  │  [Search for an app...]                               │  │
│  │                                                        │  │
│  │  Popular Apps:                                         │  │
│  │                                                        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │  │
│  │  │  📊     │ │  📧     │ │  📱     │ │  💬     │    │  │
│  │  │ Google  │ │  Gmail  │ │ WhatsApp│ │  Slack  │    │  │
│  │  │ Sheets  │ │         │ │         │ │         │    │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │  │
│  │                                                        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │  │
│  │  │  📋     │ │  📊     │ │  🎯     │ │  💼     │    │  │
│  │  │ Notion  │ │  Airtable│ │ Hubspot │ │Salesforce│  │  │
│  │  │         │ │          │ │         │ │         │    │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│                                [← Back]  [Continue →]        │
└─────────────────────────────────────────────────────────────┘
```

**User selects:** Google Sheets

---

## Page 5: Configure Google Sheets Action

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Workflows                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Create New Workflow: Post-Payment to Google Sheets          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Workflow Summary                                      │  │
│  │  ┌──────────────┐         ┌──────────────┐            │  │
│  │  │  🔔 TRIGGER  │    →    │  ⚡ ACTION   │            │  │
│  │  │  Razorpay    │         │ Google Sheets│            │  │
│  │  │  Payment     │         │  Add Row     │            │  │
│  │  │  Captured    │         │              │            │  │
│  │  └──────────────┘         └──────────────┘            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Configure Google Sheets                               │  │
│  │                                                        │  │
│  │  Account:                                              │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ merchant@example.com               [Connected ✓] │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  Select Spreadsheet:                                   │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ Payment Tracking - 2026                    [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  Select Worksheet:                                     │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ All Payments                               [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Sheet Preview                                   │ │  │
│  │  │  ┌────┬──────────┬──────────┬──────┬─────────┐  │ │  │
│  │  │  │ A  │    B     │    C     │  D   │    E    │  │ │  │
│  │  │  ├────┼──────────┼──────────┼──────┼─────────┤  │ │  │
│  │  │  │ 1  │Payment ID│ Order ID │ Date │Customer │  │ │  │
│  │  │  ├────┼──────────┼──────────┼──────┼─────────┤  │ │  │
│  │  │  │ 2  │          │          │      │         │  │ │  │
│  │  │  └────┴──────────┴──────────┴──────┴─────────┘  │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│                                [← Back]  [Continue →]        │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 6: Map Fields to Google Sheets

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Workflows                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Map Payment Data to Google Sheets                           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Field Mapping                                         │  │
│  │                                                        │  │
│  │  Column A: Payment ID                                  │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ payment_id                                 [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  Sample: pay_MN3kXbMpuQzKc9                           │  │
│  │                                                        │  │
│  │  Column B: Order ID                                    │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ order_id                                   [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  Sample: order_MN3kXbMpuQzKc8                         │  │
│  │                                                        │  │
│  │  Column C: Date                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ created_at (formatted as DD/MM/YYYY)       [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  Sample: 06/03/2026                                   │  │
│  │                                                        │  │
│  │  Column D: Time                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ created_at (formatted as HH:mm:ss)         [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  Sample: 18:13:37                                     │  │
│  │                                                        │  │
│  │  Column E: Customer Name                               │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ customer_name                              [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  Sample: Rahul Sharma                                 │  │
│  │                                                        │  │
│  │  Column F: Email                                       │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ email                                      [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  Sample: rahul@example.com                            │  │
│  │                                                        │  │
│  │  Column G: Phone                                       │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ contact                                    [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  Sample: +919876543210                                │  │
│  │                                                        │  │
│  │  Column H: Amount (₹)                                  │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ amount (divided by 100)                    [▾]   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │  Sample: 500.00                                       │  │
│  │                                                        │  │
│  │  [+ Add More Fields]                                   │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Available Fields from Razorpay:                       │  │
│  │                                                        │  │
│  │  • payment_id          • method                        │  │
│  │  • order_id            • card_network                  │  │
│  │  • amount              • card_last4                    │  │
│  │  • currency            • description                   │  │
│  │  • status              • notes.{custom_field}          │  │
│  │  • customer_name       • fee                           │  │
│  │  • email               • tax                           │  │
│  │  • contact             • created_at                    │  │
│  │                        • captured_at                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│                          [← Back]  [Test & Finish →]         │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 7: Test Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Workflows                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Test Your Workflow                                          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Workflow: Post-Payment to Google Sheets               │  │
│  │                                                        │  │
│  │  ┌──────────────┐         ┌──────────────┐            │  │
│  │  │  🔔 TRIGGER  │    →    │  ⚡ ACTION   │            │  │
│  │  │  Razorpay    │         │ Google Sheets│            │  │
│  │  │  Payment     │         │  Add Row     │            │  │
│  │  │  Captured    │         │              │            │  │
│  │  └──────────────┘         └──────────────┘            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Test with Sample Data                                 │  │
│  │                                                        │  │
│  │  We'll use your latest payment to test this workflow. │  │
│  │                                                        │  │
│  │  [Run Test]                                            │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  ✅ Test Successful!                             │ │  │
│  │  │                                                  │ │  │
│  │  │  ✓ Trigger received payment data                │ │  │
│  │  │  ✓ Connected to Google Sheets                   │ │  │
│  │  │  ✓ Row added successfully                       │ │  │
│  │  │                                                  │ │  │
│  │  │  Check your Google Sheet:                       │ │  │
│  │  │  [View in Google Sheets →]                      │ │  │
│  │  │                                                  │ │  │
│  │  │  New row added:                                 │ │  │
│  │  │  Payment ID: pay_MN3kXbMpuQzKc9                 │ │  │
│  │  │  Customer: Rahul Sharma                         │ │  │
│  │  │  Amount: ₹500.00                                │ │  │
│  │  │  Date: 06/03/2026 18:13:37                     │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Workflow Settings                                     │  │
│  │                                                        │  │
│  │  Workflow Name:                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ Post-Payment to Google Sheets                    │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  Status:  ○ Active    ○ Paused                        │  │
│  │                                                        │  │
│  │  ☑ Send me email notifications if workflow fails      │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│                          [← Back]  [Save & Activate →]       │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 8: Workflow Activated - Success

```
┌─────────────────────────────────────────────────────────────┐
│  Workflows                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ✅ Workflow Activated Successfully!                   │  │
│  │                                                        │  │
│  │  Your workflow "Post-Payment to Google Sheets" is now │  │
│  │  active and will run automatically for all new        │  │
│  │  payments.                                             │  │
│  │                                                        │  │
│  │  [View Workflow]        [Create Another Workflow]     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Active Workflows (1)                        [+ Create New]  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Post-Payment to Google Sheets              [Active ●] │  │
│  │  ┌──────────────┐         ┌──────────────┐            │  │
│  │  │  🔔          │    →    │  📊          │            │  │
│  │  │  Payment     │         │ Google Sheets│            │  │
│  │  │  Captured    │         │              │            │  │
│  │  └──────────────┘         └──────────────┘            │  │
│  │                                                        │  │
│  │  Created: Today at 6:13 PM                             │  │
│  │  Last triggered: Today at 6:14 PM                      │  │
│  │  Total runs: 1                                         │  │
│  │  Success rate: 100%                                    │  │
│  │                                                        │  │
│  │  [Edit]  [Pause]  [View Activity]  [Delete]           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Workflow Templates                                          │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  📧 Send Receipt │  │  📱 WhatsApp     │                 │
│  │  Email on        │  │  Notification on │                 │
│  │  Payment         │  │  Payment         │                 │
│  │                  │  │                  │                 │
│  │  [Use Template]  │  │  [Use Template]  │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 9: Workflow Activity Log

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Workflows                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Workflow Activity: Post-Payment to Google Sheets            │
│                                                               │
│  ┌────────────┬──────────┬───────────┬──────────┐           │
│  │ Today      │ 7 Days   │ 30 Days   │ All Time │           │
│  └────────────┴──────────┴───────────┴──────────┘           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Performance Metrics (Last 30 Days)                    │  │
│  │                                                        │  │
│  │  ┌─────────────┬─────────────┬─────────────┐          │  │
│  │  │ Total Runs  │  Success    │   Failed    │          │  │
│  │  │             │             │             │          │  │
│  │  │     247     │    247      │      0      │          │  │
│  │  │             │   100%      │     0%      │          │  │
│  │  └─────────────┴─────────────┴─────────────┘          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Recent Activity                                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ✅ Today, 6:14 PM                                     │  │
│  │  Payment ID: pay_MN3kXbMpuQzKc9                        │  │
│  │  Customer: Rahul Sharma                                │  │
│  │  Amount: ₹500.00                                       │  │
│  │  → Added to Google Sheets successfully                 │  │
│  │  [View Details]                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ✅ Today, 5:47 PM                                     │  │
│  │  Payment ID: pay_MN3kWYNmoKzLd8                        │  │
│  │  Customer: Priya Singh                                 │  │
│  │  Amount: ₹1,200.00                                     │  │
│  │  → Added to Google Sheets successfully                 │  │
│  │  [View Details]                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ✅ Today, 4:32 PM                                     │  │
│  │  Payment ID: pay_MN3kTRPqsLmJe2                        │  │
│  │  Customer: Amit Kumar                                  │  │
│  │  Amount: ₹750.00                                       │  │
│  │  → Added to Google Sheets successfully                 │  │
│  │  [View Details]                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│                                [Load More...]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Mobile View (Responsive Design)

```
┌──────────────────────────┐
│  ☰  Zapier Workflows     │
├──────────────────────────┤
│                          │
│  Active Workflows        │
│                          │
│  ┌──────────────────────┐│
│  │ Post-Payment to      ││
│  │ Google Sheets        ││
│  │                      ││
│  │ 🔔 → 📊              ││
│  │                      ││
│  │ Status: Active ●     ││
│  │ Runs Today: 12       ││
│  │ Success: 100%        ││
│  │                      ││
│  │ [View]  [Edit]       ││
│  └──────────────────────┘│
│                          │
│  [+ Create Workflow]     │
│                          │
│  Templates               │
│                          │
│  ┌──────────────────────┐│
│  │ 📧 Receipt Email     ││
│  │ [Use Template]       ││
│  └──────────────────────┘│
│                          │
│  ┌──────────────────────┐│
│  │ 📱 WhatsApp Notify   ││
│  │ [Use Template]       ││
│  └──────────────────────┘│
│                          │
└──────────────────────────┘
```

---

## Key UI Elements & Components

### 1. **Progress Indicator**
```
●━━━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━━○
Trigger          Configure             Action
```

### 2. **Connection Cards**
```
┌──────────────┐         ┌──────────────┐
│  🔔 TRIGGER  │    →    │  ⚡ ACTION   │
│  Razorpay    │         │ Google Sheets│
│  Payment     │         │  Add Row     │
│  Captured    │         │              │
└──────────────┘         └──────────────┘
```

### 3. **Field Mapper**
```
Column A: Payment ID
┌──────────────────────────────────────────────────┐
│ payment_id                                 [▾]   │
└──────────────────────────────────────────────────┘
Sample: pay_MN3kXbMpuQzKc9
```

### 4. **Success Notification**
```
┌──────────────────────────────────────────────────┐
│  ✅ Test Successful!                             │
│                                                  │
│  ✓ Trigger received payment data                │
│  ✓ Connected to Google Sheets                   │
│  ✓ Row added successfully                       │
└──────────────────────────────────────────────────┘
```

---

## Interactive Elements

1. **Dropdown Selectors** - For choosing apps, events, spreadsheets
2. **Field Mappers** - Drag-and-drop or dropdown to map fields
3. **Sample Data Previews** - Live preview of how data will appear
4. **Test Buttons** - One-click testing before activation
5. **Toggle Switches** - Active/Paused status
6. **Activity Logs** - Filterable, searchable execution history

---

*This UI flow ensures a smooth, intuitive experience for merchants to create automated post-payment workflows without any coding.*
