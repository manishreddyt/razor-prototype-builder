# 🎯 How to See the Slot Booking Flow

## ✅ Demo Coaching Page Auto-Created!

A demo coaching page has been automatically created in your app with the complete slot booking flow.

---

## 🚀 Quick Access (3 Steps)

### Step 1: Open the App
Go to: **http://localhost:8083/**

### Step 2: Navigate to Smart Pages
From the dashboard, click on **"Smart Pages"** or **"Website Builder"** in the navigation menu.

### Step 3: Open the Demo Coaching Page
Look for the page titled:
**"Career Coaching with Priya Sharma"**

Click on it to see the management view, then click **"Preview"** or **"Visit Site"** to see the public booking flow.

---

## 🎬 Alternative: Direct Public Link

Once you're on the Smart Pages list, click the **"Visit Site"** or **preview icon** next to the coaching page.

The public URL format is:
```
http://localhost:8083/s:career-coaching-priya
```

---

## 🔍 What to Look For

### 1. **Calendar Selection** (Booking Section)
- Scroll down to the "Schedule Your Session" section
- See an interactive calendar
- Available days: Monday-Friday (9 AM - 5 PM)
- Weekends disabled

### 2. **Time Slot Selection**
After selecting a date, you'll see:

```
┌─────────────────────────────────────┐
│ Available Times (Mon, 15 Mar)       │
│                        [5 slots ✓]  │
├─────────────────────────────────────┤
│  [✓ 09:00]  [✓ 10:15]  [✓ 11:30]   │
│  [✓ 12:45]  [✓ 14:00]  [✓ 15:15]   │
│  [✓ 16:30]                          │
└─────────────────────────────────────┘
```

**Try selecting these dates to see booked slots filtered out:**
- **March 15, 2026:** 10:00 and 14:00 are BOOKED (won't show)
- **March 16, 2026:** 11:00 is BOOKED
- **March 17, 2026:** 09:00 and 15:00 are BOOKED

### 3. **Visual States**
- **Available slot:** Green border with ✓ checkmark
- **Selected slot:** Solid teal background with shadow
- **Booked slots:** Not shown (filtered out)

### 4. **Customer Details Form**
Fill in:
- Full Name (required)
- Email (required)
- Phone Number (required)
- Years of Experience (optional)

### 5. **Review/Confirmation Card**
Once you select a slot and fill details, you'll see:

```
┌─────────────────────────────────────┐
│ Review Your Booking      [Ready ✓]  │
├─────────────────────────────────────┤
│ 📅 Monday, March 15, 2026           │
│ ⏰ 10:15 (60 minutes)                │
│ 👤 John Doe                          │
│    john@example.com                  │
│                                      │
│ ────────────────────────────────     │
│ Total Amount          ₹3,999         │
├─────────────────────────────────────┤
│     [Confirm & Pay ₹3,999 →]        │
└─────────────────────────────────────┘
```

### 6. **Payment Flow**
Click "Confirm & Pay" to see:
- Razorpay payment modal opens
- Test payment options available
- Success/cancel handling

---

## 📍 Navigation Path

```
Home Dashboard
  └─> Smart Pages / Website Builder
       └─> "Career Coaching with Priya Sharma"
            └─> Click "Preview" or "Visit Site"
                 └─> Scroll to "Schedule Your Session"
                      └─> SELECT THE BOOKING FLOW! 🎉
```

---

## 🧪 Test Scenarios

### Test 1: See Available Slots
1. Select **March 14, 2026** (or any future date that's NOT 15, 16, 17)
2. Should show ALL time slots available
3. Count should show "7-8 slots available" (depending on buffer config)

### Test 2: See Booked Slots Filtered
1. Select **March 15, 2026**
2. Should NOT show: 10:00, 14:00 (these are booked)
3. All other slots should be available

### Test 3: Slot Selection
1. Click any available slot
2. Should see solid teal highlight with shadow
3. Selected time appears in the review card

### Test 4: Validation
1. Try clicking "Confirm & Pay" without selecting slot
   → Error: "Please select a date and time"
2. Select slot but don't fill name
   → Error: "Please fill: Full Name, Email, Phone Number"

### Test 5: Complete Booking
1. Select date and time
2. Fill all required fields
3. Review card appears with all details
4. Click "Confirm & Pay ₹3,999"
5. Razorpay modal opens
6. Complete or cancel payment
7. See success/cancel message

---

## 🛠️ Merchant Configuration View

To see the merchant's session configuration:

1. From the coaching page detail view
2. Click **"Edit"** or **"Settings"**
3. Look for **"Session Details"** section

You'll see configuration options for:
- ✅ Session Duration (60 minutes)
- ✅ Buffer Between Sessions (15 minutes)
- ✅ Max Sessions Per Day (8 sessions)
- ✅ Weekly Availability (Mon-Fri, 9 AM - 5 PM)

---

## 🎯 Key Features to Demonstrate

### ✨ For Customer Experience:
1. **Visual slot availability** - No more guessing if a time is free
2. **Real-time filtering** - Booked slots automatically hidden
3. **Review before payment** - See exactly what you're booking
4. **Clear pricing** - No surprises at checkout
5. **Mobile responsive** - Works on all devices

### 🎨 For Merchant Value:
1. **Session buffer control** - Prevent back-to-back burnout
2. **Daily booking limits** - Control workload
3. **Flexible availability** - Set different hours per day
4. **Professional experience** - Builds trust with customers
5. **Zero manual work** - Slots auto-calculated and displayed

---

## ❓ Troubleshooting

**Don't see the coaching page?**
- Refresh the browser (the seed runs on first load)
- Check browser console for "Demo coaching page created" message
- Try navigating to: http://localhost:8083/website-builder

**Slots not showing?**
- Make sure you selected a date that's enabled (Mon-Fri)
- Check that it's a future date (past dates disabled)
- Try March 14, 2026 for a date with no booked slots

**Payment modal not opening?**
- Check browser console for errors
- Make sure Razorpay script is loaded
- This is normal in demo mode - payment is optional for testing

---

## 📸 Screenshots to Capture

1. Calendar with date selected
2. Available time slots with count badge
3. Slot selection (green highlight)
4. Review/confirmation card
5. Payment modal

---

## 🚀 Next Steps

After testing the demo:
1. Try creating your own coaching page
2. Configure different session durations
3. Test different availability schedules
4. Customize the booking fields

**The slot booking flow is fully functional on the frontend!**

Backend APIs are documented in `SLOT_BOOKING_IMPLEMENTATION.md` for when you're ready to integrate.

---

**Server URL:** http://localhost:8083/
**Demo Page:** Career Coaching with Priya Sharma
**Status:** ✅ Ready to test!
