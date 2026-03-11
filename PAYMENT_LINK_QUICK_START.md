# Payment Link Checkout - Quick Start Guide

**Ready to test the complete payment link journey? Follow this guide.**

---

## 🚀 Start the App

```bash
npm run dev
```

Open: `http://localhost:5173`

---

## 📋 Test Flow 1: View Existing Payment Links

### Step 1: Navigate to Payment Links
- Click "Payment Links" in sidebar
- See 5 sample payment links in table

### Step 2: Test Clickable Links
Pick any link and try:

**Option A: Click the blue link text**
```
http://localhost:5173/pay/plink_ABcDeFgHiJkL01
```
→ Navigate to checkout page

**Option B: Click Copy icon** (📋)
→ URL copied to clipboard
→ Paste in new tab

**Option C: Click External link icon** (🔗)
→ Opens checkout in new tab

---

## 💳 Test Flow 2: Customer Checkout Experience

### Recommended Test Link
Click this link (or any from the table):
```
http://localhost:5173/pay/plink_ABcDeFgHiJkL01
```

**What you'll see:**

1. **Beautiful checkout page** with gradient background
2. **Course title**: "Course Fee - Full Stack Bootcamp"
3. **Order summary** on right with course image
4. **Payment form** on left

### Fill the Form

**Required Fields:**
- Name: `Test User`
- Email: `test@example.com`
- Phone: `+91 98765 43210`

**Payment Method:**
- Click **UPI** card (or Card/NetBanking/Wallet)

**WhatsApp Consent:**
- Leave toggle ON (green)

### Submit Payment

- Click **"🔒 Pay ₹12,999"**
- See processing spinner
- See success toast: **"Payment Successful! 🎉"**
- Auto-redirect after 2 seconds

---

## ✨ Test Flow 3: Create New Payment Link

### Step 1: Create Link

- Click **"+ Create Payment Link"**
- Fill form:
  ```
  Title: "Test Course Payment"
  Amount: 9999
  Description: "Payment for advanced web development course"
  Customer Name: "Rahul Sharma"
  Mobile: "+91 98765 43210"
  Email: "rahul@example.com"
  Reference ID: "TEST-001"
  ```

### Step 2: Enable Address Collection

- Toggle ON: **"Collect Address"**
- (Customer will be asked for address, city, pincode)

### Step 3: Configure Advanced Settings

Click **"Advanced Settings"** accordion:

**A. Enable Shiprocket**
- Toggle ON: **"Shiprocket Integration"**
- See confirmation: "Order details will be sent to Shiprocket"

**B. Tag Products**
- Type in search: **"Full Stack"**
- Click on **"Full Stack Dev Bootcamp - ₹12,999"**
- See chip appear: `[Full Stack Dev Bootcamp ₹12,999 ×]`
- Search again: **"UI"**
- Click **"UI/UX Design Masterclass"**
- See second chip appear

**C. Enable WhatsApp**
- Toggle ON: **"WhatsApp Order Confirmation"**
- See confirmation: "Customer will receive order confirmation"

### Step 4: Create Link

- Click **"Create Payment Link"**
- See success modal with:
  - Full URL: `http://localhost:5173/pay/plink_xxxxx`
  - Enabled integrations badges (Shiprocket, WhatsApp)

### Step 5: Test New Link

**Option A: Copy Link**
- Click **"Copy Link"**
- See toast: "Link copied to clipboard!"
- Paste in new tab

**Option B: Preview**
- Click **"Preview"**
- Opens checkout in new tab

### Step 6: Verify in Table

- Click **"Done"** in modal
- See new link at **top of table**
- Click the link → Opens checkout
- Verify:
  - ✅ Title shows: "Test Course Payment"
  - ✅ Description shows
  - ✅ Tagged products appear in order summary (2 products with images)
  - ✅ Total = ₹9,999 + ₹12,999 + ₹8,499 = ₹31,397
  - ✅ Address fields appear (Address, City, Pincode)
  - ✅ WhatsApp toggle visible and ON
  - ✅ Shiprocket badge shows in order summary

---

## 🔥 Test Flow 4: Partial Payment

Use this existing link:
```
http://localhost:5173/pay/plink_YzAbCdEfGhIj03
```

**What's different:**
- Amount field is **editable** (not fixed)
- See label: "Amount (Min: ₹5,000)"
- Total: ₹15,999

### Test Cases

**A. Try paying less than minimum**
- Enter: `3000`
- Click **"Pay ₹3,000"**
- See error toast: **"Invalid amount - Minimum is ₹5,000"**

**B. Pay minimum amount**
- Enter: `5000`
- Fill name, email, phone
- Click **"Pay ₹5,000"**
- See success toast
- Notice order summary shows:
  - Subtotal: ₹15,999
  - Paying Now: ₹5,000 (green)
  - Remaining: ₹10,999 (orange)
  - Total: ₹5,000

**C. Pay full amount**
- Enter: `15999`
- Submit
- See success

---

## 🚨 Test Flow 5: Error States

### A. Link Not Found
Navigate to:
```
http://localhost:5173/pay/invalid_link_id
```

**Expected:**
- See error page: **"Payment Link Not Found"**
- Message: "This payment link doesn't exist or has been removed"
- Button: **"← Go Back"**

### B. Missing Required Fields
- Open any payment link
- Click **"Pay"** without filling name
- See toast: **"Name required - Please enter your name"**

- Fill name only
- If email is required, see: **"Email required"**

- Fill name + email
- If phone is required, see: **"Phone required"**

- If address enabled:
  - Fill name, email, phone
  - Leave address blank
  - See: **"Address required - Please fill in all address fields"**

---

## 📱 Test Flow 6: Mobile View

### Option A: Browser DevTools
- Open DevTools (F12)
- Click device toolbar icon (Ctrl+Shift+M)
- Select: **iPhone 12 Pro** or **Pixel 5**

### Option B: Resize Window
- Resize browser to ~375px width

### What to Verify
- ✅ Single column layout (form stacks on top of summary)
- ✅ Payment method cards are touch-friendly
- ✅ All fields visible and accessible
- ✅ Pay button reaches full width
- ✅ Scrolling works smoothly
- ✅ Header is sticky

---

## 🎯 Quick Test Scenarios

### Scenario 1: Social Commerce Merchant
**Story:** Instagram seller receives DM order for 2 products

1. Create payment link
2. Tag products: T-Shirt (₹799), Jeans (₹1,299)
3. Enable address collection (for shipping)
4. Enable Shiprocket
5. Enable WhatsApp confirmation
6. Share link via WhatsApp
7. Customer opens, fills form, pays
8. Merchant receives Shiprocket order + WhatsApp confirmation

**Test:**
- Create link with 2 products tagged
- Enable all integrations
- Open checkout
- Verify products show in summary
- Verify address fields present
- Verify Shiprocket badge shows
- Verify WhatsApp toggle present

### Scenario 2: Education Merchant
**Story:** Course instructor sells bootcamp with installment option

1. Create payment link: ₹15,999
2. Enable partial payment: Min ₹5,000
3. Tag product: "Full Stack Bootcamp"
4. Enable email/phone collection
5. Customer pays ₹5,000 first installment

**Test:**
- Create link with partial payment
- Open checkout
- Verify amount field is editable
- Pay ₹5,000
- Verify order summary shows:
  - Paying Now: ₹5,000
  - Remaining: ₹10,999

### Scenario 3: Service Provider
**Story:** Consultant sends invoice for consulting fee

1. Create link: ₹25,000
2. Title: "Website Design Consultation"
3. Customer: "Acme Corp"
4. Reference ID: "INV-2026-001"
5. No products, no address

**Test:**
- Create simple link (no extras)
- Open checkout
- Verify clean, simple form
- Only name, email, phone
- No address fields
- No products in summary

---

## 🛠 Troubleshooting

### Payment Links Not Showing
**Fix:** Clear localStorage and refresh
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Checkout Page Shows "Loading..."
**Issue:** Link ID doesn't exist in localStorage

**Fix:** Go back to Payment Links page to see available IDs

### Products Not Showing in Checkout
**Issue:** Products not in localStorage

**Fix:** Check browser console for errors, or clear and reload

### Chips Not Appearing When Creating Link
**Issue:** Search query doesn't match product names

**Try:** Type "Full", "UI", "Data", or "Digital"

---

## 🎨 UI Highlights to Notice

### Checkout Page
- **Gradient background** (blue → white → purple)
- **Sticky header** with Razorpay logo
- **Two-column layout** (60/40 split)
- **Trust badges** (SSL, PCI DSS)
- **Payment method icons** (UPI, Card, NetBanking, Wallet)
- **Product thumbnails** (12x12 rounded images)
- **Shiprocket badge** (blue with truck icon)
- **WhatsApp toggle** (green with message icon)
- **Security card** (gradient background)
- **Processing state** (spinner on button)
- **Success toast** (with payment details)

### Payment Links Table
- **Clickable link text** (blue, underline on hover)
- **Copy icon** (gray, turns primary on hover)
- **External link icon** (opens in new tab)
- **Status badges** (color-coded: green=Paid, blue=Created, orange=Partial)
- **Currency formatting** (₹12,999 with commas)

### Create Link Form
- **Chips UI** for products (blue background, rounded, with X)
- **Search input** with magnifying glass icon
- **Advanced Settings accordion** (expands/collapses)
- **Integration toggles** (Shiprocket, WhatsApp)
- **Confirmation messages** (green checkmark)

---

## ✅ Success Criteria

After testing, you should have:

- [ ] Created at least 1 new payment link
- [ ] Opened checkout for at least 2 different links
- [ ] Completed at least 1 payment successfully
- [ ] Tested partial payment flow
- [ ] Seen error page for invalid link
- [ ] Tested on mobile viewport
- [ ] Copied link to clipboard
- [ ] Opened link in new tab
- [ ] Tagged at least 1 product
- [ ] Enabled Shiprocket integration
- [ ] Enabled WhatsApp confirmation
- [ ] Enabled address collection

---

## 🚀 What's Working

✅ **End-to-end payment link journey**
✅ **localStorage persistence** (data survives refresh)
✅ **Functional URLs** (click and navigate)
✅ **Dynamic form rendering** (based on merchant settings)
✅ **Product tagging** (chips UI)
✅ **Partial payments** (with validation)
✅ **Integration flags** (Shiprocket, WhatsApp)
✅ **Mobile responsive** (single column on small screens)
✅ **Error handling** (validation + error pages)
✅ **Success feedback** (toasts + redirects)

---

## 📝 Feedback

If you find any issues or have suggestions:
- Note them down for discussion
- Check browser console for errors
- Try clearing localStorage and retrying

---

**Happy Testing! 🎉**

*Built by Manish Reddy Tirumala Reddy*
*Razorpay Payment Links - No-Code Offerings POD*
*Date: 2026-03-11*
