# Zapier Workflow Builder - Post-Payment to Google Sheets

## Overview
This guide demonstrates how to create a Zapier workflow that automatically captures Razorpay payment data and adds it to a Google Sheet for tracking and analysis.

---

## Use Case: Post-Payment Journey Tracking

**Business Scenario:** A merchant wants to automatically log all successful payments to a Google Sheet for reconciliation, customer follow-up, and reporting.

---

## Workflow Configuration

### Step 1: Choose Your Trigger

**Trigger App:** Razorpay
**Trigger Event:** Payment Captured (payment.captured)

#### Available Razorpay Triggers:
- `payment.captured` - When a payment is successfully captured
- `payment.failed` - When a payment fails
- `payment_link.paid` - When a payment link is paid
- `order.paid` - When an order is paid
- `subscription.charged` - When a subscription is charged
- `invoice.paid` - When an invoice is paid

**Selected Trigger:** `payment.captured`

#### Trigger Configuration:
```json
{
  "app": "Razorpay",
  "event": "payment.captured",
  "filters": {
    "amount_min": null,
    "currency": "INR",
    "method": null
  }
}
```

---

### Step 2: Configure Trigger Fields

When a payment is captured, Razorpay sends the following data:

#### Sample Payload:
```json
{
  "payment_id": "pay_MN3kXbMpuQzKc9",
  "order_id": "order_MN3kXbMpuQzKc8",
  "amount": 50000,
  "currency": "INR",
  "status": "captured",
  "method": "card",
  "email": "customer@example.com",
  "contact": "+919876543210",
  "customer_name": "Rahul Sharma",
  "description": "Payment for Premium Course",
  "created_at": 1709734417,
  "captured_at": 1709734420,
  "notes": {
    "course_id": "CS101",
    "enrollment_type": "full_payment"
  },
  "fee": 1150,
  "tax": 207,
  "card_network": "Visa",
  "card_last4": "1234"
}
```

---

### Step 3: Choose Your Action

**Action App:** Google Sheets
**Action Event:** Create Spreadsheet Row

#### Action Configuration:
```json
{
  "app": "Google Sheets",
  "event": "create_spreadsheet_row",
  "spreadsheet_id": "1AbC123...",
  "worksheet_name": "Payments Log"
}
```

---

### Step 4: Map Fields to Google Sheet

#### Google Sheet Structure:
| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I | Column J | Column K |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| Payment ID | Order ID | Date | Time | Customer Name | Email | Phone | Amount (₹) | Method | Status | Notes |

#### Field Mapping:
```json
{
  "Payment ID": "{{payment_id}}",
  "Order ID": "{{order_id}}",
  "Date": "{{created_at | date: 'DD/MM/YYYY'}}",
  "Time": "{{created_at | date: 'HH:mm:ss'}}",
  "Customer Name": "{{customer_name}}",
  "Email": "{{email}}",
  "Phone": "{{contact}}",
  "Amount (₹)": "{{amount / 100}}",
  "Method": "{{method | capitalize}}",
  "Status": "{{status | uppercase}}",
  "Notes": "{{description}} - Course: {{notes.course_id}}"
}
```

---

## Complete Workflow Example

### Workflow Name: "Payment Tracking - Auto-Log to Google Sheets"

```yaml
workflow:
  name: "Payment Tracking - Auto-Log to Google Sheets"
  description: "Automatically log all captured payments to Google Sheets for reconciliation"

  trigger:
    app: "Razorpay"
    event: "payment.captured"
    account: "Razorpay Production Account"

  actions:
    - step: 1
      app: "Google Sheets"
      action: "Create Spreadsheet Row"
      account: "merchant@example.com"

      configuration:
        spreadsheet: "Payment Tracking 2026"
        worksheet: "All Payments"

        row_data:
          - column: "Payment ID"
            value: "{{trigger.payment_id}}"

          - column: "Order ID"
            value: "{{trigger.order_id}}"

          - column: "Transaction Date"
            value: "{{trigger.created_at | date: 'DD/MM/YYYY'}}"

          - column: "Transaction Time"
            value: "{{trigger.created_at | date: 'HH:mm:ss'}}"

          - column: "Customer Name"
            value: "{{trigger.customer_name}}"

          - column: "Email"
            value: "{{trigger.email}}"

          - column: "Phone"
            value: "{{trigger.contact}}"

          - column: "Amount (₹)"
            value: "{{trigger.amount | divided_by: 100}}"

          - column: "Payment Method"
            value: "{{trigger.method}}"

          - column: "Status"
            value: "{{trigger.status}}"

          - column: "Card Network"
            value: "{{trigger.card_network | default: 'N/A'}}"

          - column: "Last 4 Digits"
            value: "{{trigger.card_last4 | default: 'N/A'}}"

          - column: "Description"
            value: "{{trigger.description}}"

          - column: "Course ID"
            value: "{{trigger.notes.course_id}}"

          - column: "Enrollment Type"
            value: "{{trigger.notes.enrollment_type}}"
```

---

## Advanced Example: Multi-Action Workflow

### Workflow: "Post-Payment Customer Onboarding"

This workflow demonstrates multiple actions after payment capture:

```yaml
workflow:
  name: "Post-Payment Customer Onboarding"
  description: "Log payment, send receipt, and enroll customer in course"

  trigger:
    app: "Razorpay"
    event: "payment.captured"

  actions:
    # Action 1: Log to Google Sheets
    - step: 1
      name: "Log Payment"
      app: "Google Sheets"
      action: "Create Spreadsheet Row"
      spreadsheet: "Payment Tracking"
      worksheet: "Payments"
      row_data:
        Payment ID: "{{trigger.payment_id}}"
        Amount: "{{trigger.amount / 100}}"
        Customer: "{{trigger.customer_name}}"
        Email: "{{trigger.email}}"
        Date: "{{trigger.created_at | date: 'DD/MM/YYYY'}}"

    # Action 2: Send confirmation email
    - step: 2
      name: "Send Receipt Email"
      app: "Gmail"
      action: "Send Email"
      to: "{{trigger.email}}"
      subject: "Payment Confirmation - Order #{{trigger.order_id}}"
      body: |
        Hi {{trigger.customer_name}},

        Your payment of ₹{{trigger.amount / 100}} has been successfully received!

        Payment ID: {{trigger.payment_id}}
        Order ID: {{trigger.order_id}}
        Date: {{trigger.created_at | date: 'DD MMM YYYY'}}

        Thank you for your purchase!

    # Action 3: Add to CRM (optional)
    - step: 3
      name: "Add to CRM"
      app: "Google Contacts"
      action: "Create Contact"
      name: "{{trigger.customer_name}}"
      email: "{{trigger.email}}"
      phone: "{{trigger.contact}}"
      notes: "Customer since {{trigger.created_at | date: 'DD/MM/YYYY'}}"
```

---

## Filters & Conditions

### Example 1: Only log high-value payments (>₹10,000)

```yaml
trigger:
  app: "Razorpay"
  event: "payment.captured"

filter:
  condition: "AND"
  rules:
    - field: "{{amount}}"
      operator: "greater_than"
      value: "1000000"  # ₹10,000 in paise
```

### Example 2: Different sheets for different payment methods

```yaml
actions:
  - step: 1
    app: "Google Sheets"
    action: "Create Spreadsheet Row"

    # Dynamic worksheet based on payment method
    spreadsheet: "Payment Tracking"
    worksheet: "{{trigger.method | capitalize}} Payments"

    row_data:
      Payment ID: "{{trigger.payment_id}}"
      Amount: "{{trigger.amount / 100}}"
      Customer: "{{trigger.customer_name}}"
```

---

## Testing Your Workflow

### Test Data:
```json
{
  "payment_id": "pay_TEST123456789",
  "order_id": "order_TEST987654321",
  "amount": 50000,
  "currency": "INR",
  "status": "captured",
  "method": "upi",
  "email": "test@example.com",
  "contact": "+919876543210",
  "customer_name": "Test Customer",
  "description": "Test Payment",
  "created_at": 1709734417,
  "notes": {
    "course_id": "TEST101"
  }
}
```

### Expected Google Sheet Entry:
| Payment ID | Order ID | Date | Time | Customer Name | Email | Amount (₹) | Method | Status |
|------------|----------|------|------|---------------|-------|------------|--------|--------|
| pay_TEST123456789 | order_TEST987654321 | 06/03/2026 | 18:13:37 | Test Customer | test@example.com | 500.00 | UPI | CAPTURED |

---

## Common Use Cases

### 1. **Education Sector**
- **Trigger:** `payment.captured`
- **Actions:**
  - Log to "Fee Payments" sheet
  - Send course access email
  - Add to student database
  - Generate receipt PDF

### 2. **E-commerce**
- **Trigger:** `order.paid`
- **Actions:**
  - Log to "Orders" sheet
  - Send order confirmation
  - Trigger shipping workflow
  - Update inventory

### 3. **Subscription Services**
- **Trigger:** `subscription.charged`
- **Actions:**
  - Log to "Recurring Revenue" sheet
  - Send subscription renewal confirmation
  - Update customer subscription status
  - Generate invoice

### 4. **Service Providers**
- **Trigger:** `payment_link.paid`
- **Actions:**
  - Log to "Client Payments" sheet
  - Send service confirmation
  - Schedule service appointment
  - Add to client management system

---

## Best Practices

1. **Always include timestamp fields** for accurate tracking
2. **Convert amount from paise to rupees** for readability (`{{amount / 100}}`)
3. **Use default values** for optional fields (`{{card_network | default: 'N/A'}}`)
4. **Add error handling** with failure notifications
5. **Test with sample data** before going live
6. **Use descriptive workflow names** for easy management
7. **Keep Google Sheet headers consistent** across workflows
8. **Archive old data** periodically to maintain performance

---

## Troubleshooting

### Issue 1: Workflow not triggering
- **Check:** Zapier integration is active in Razorpay dashboard
- **Check:** Webhook URL is correctly configured
- **Check:** Test mode vs live mode settings

### Issue 2: Missing data in Google Sheets
- **Check:** Field mappings are correct
- **Check:** Google Sheet permissions (write access)
- **Check:** Column headers match exactly

### Issue 3: Duplicate entries
- **Check:** Workflow isn't triggered multiple times
- **Check:** Use unique identifiers (payment_id) to deduplicate
- **Solution:** Add a filter to check if payment_id already exists

---

## Next Steps

1. **Create your Google Sheet** with the headers mentioned above
2. **Install Zapier** from Razorpay App Store
3. **Configure the workflow** using the examples provided
4. **Test with a sample payment**
5. **Monitor the workflow** for the first few days
6. **Expand** with additional actions as needed

---

## Sample Google Sheet Template

```
Sheet Name: "Payment Tracking - 2026"

Headers Row (Row 1):
Payment ID | Order ID | Date | Time | Customer Name | Email | Phone | Amount (₹) | Method | Status | Card Network | Last 4 | Description | Course/Product | Notes

Sample Data Row (Row 2):
pay_MN3kXbMpuQzKc9 | order_MN3k... | 06/03/2026 | 18:13:37 | Rahul Sharma | rahul@example.com | +919876543210 | 500.00 | Card | CAPTURED | Visa | 1234 | Premium Course | CS101 | Full Payment
```

---

## API Reference

### Razorpay Event Payload Structure
```typescript
interface PaymentCapturedEvent {
  payment_id: string;
  order_id: string;
  amount: number;        // Amount in paise
  currency: string;      // "INR"
  status: string;        // "captured"
  method: string;        // "card" | "upi" | "netbanking" | "wallet"
  email: string;
  contact: string;
  customer_name: string;
  description: string;
  created_at: number;    // Unix timestamp
  captured_at: number;   // Unix timestamp
  notes: Record<string, any>;
  fee: number;           // Fee in paise
  tax: number;           // Tax in paise
  card_network?: string; // "Visa" | "Mastercard" | "RuPay"
  card_last4?: string;   // Last 4 digits
}
```

---

## Support & Documentation

- **Zapier Integration Docs:** [View Documentation](#)
- **Razorpay Webhook Events:** [API Reference](#)
- **Google Sheets API:** [Google Docs](#)

---

*Last Updated: March 6, 2026*
