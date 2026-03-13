# Session Communications Feature

## Overview

Automated communication system for 1:1 sessions that allows merchants to configure:
- **Booking confirmations** — Instant notifications when sessions are booked
- **Pre-session reminders** — Flexible timing (X hours/days before OR specific time like "7 PM 1 day before")
- **Post-session follow-ups** — Thank you messages, feedback surveys, and recordings

## Features

### 📧 Multi-Channel Support
- **Email** — Professional, detailed communications
- **SMS** — Quick text message alerts
- **WhatsApp** — Most popular channel in India

### ⏰ Flexible Timing Options

#### 1. Relative Timing (Before Session)
Send reminders X hours/days before the session:
- **Examples:**
  - 1 day before
  - 2 hours before
  - 30 minutes before

#### 2. Absolute Timing (Specific Time)
Send reminders at a specific time before the session:
- **Examples:**
  - 7 PM, 1 day before
  - 9 AM on the session day
  - 6 PM, 2 days before

### 📝 Message Customization

**Available Template Variables:**
- `{{customerName}}` — Customer's name
- `{{merchantName}}` — Merchant's business name
- `{{sessionDate}}` — Session date (e.g., "March 15, 2026")
- `{{sessionTime}}` — Session time (e.g., "3:00 PM")
- `{{meetingLink}}` — Zoom/Google Meet link
- `{{surveyUrl}}` — Feedback survey URL
- `{{recordingLink}}` — Session recording URL

## File Structure

```
src/
├── types/
│   └── communications.ts                          # Type definitions
│
├── components/
│   └── communications/
│       ├── SessionCommunicationConfig.tsx         # Main configuration component
│       └── index.ts                               # Exports
│
├── pages/
│   └── SessionCommunications.tsx                  # Full-page communication manager
│
└── components/products/
    └── SessionDetailsForm.tsx                     # Integration point in product form
```

## Usage

### For Merchants

1. **Navigate to Product Settings**
   - Go to your session product (e.g., "1:1 Career Counseling")
   - Scroll to "Session Details" section
   - Find "Automated Communications" card

2. **Configure Booking Confirmation**
   - Enable "Send booking confirmation immediately"
   - Choose channels: Email, SMS, WhatsApp

3. **Add Pre-Session Reminders**
   - Click "Add Reminder"
   - Choose timing:
     - **Relative:** "1 day before" or "2 hours before"
     - **Absolute:** "7 PM, 1 day before session"
   - Select channels
   - Customize message

4. **Add Post-Session Follow-ups**
   - Click "Add Follow-up"
   - Set delay (e.g., "2 hours after session")
   - Enable feedback survey
   - Enable session recording link (if applicable)

### For Developers

#### Import Types
```typescript
import {
  SessionCommunicationConfig,
  SessionReminder,
  PostSessionCommunication,
  ReminderTiming
} from '@/types/communications';
```

#### Create Communication Config
```typescript
const config: SessionCommunicationConfig = {
  sessionProductId: 'product-123',
  enabled: true,
  sendBookingConfirmation: true,
  bookingConfirmationChannels: ['email', 'whatsapp'],
  reminders: [
    {
      id: 'reminder-1',
      name: '24 Hour Reminder',
      enabled: true,
      timing: {
        type: 'relative',
        value: 1,
        unit: 'days',
        before: true
      },
      channels: ['email', 'whatsapp'],
      subject: 'Your session is tomorrow!',
      message: 'Hi {{customerName}}, reminder that your session with {{merchantName}} is tomorrow at {{sessionTime}}.',
      useTemplate: true
    }
  ],
  postSessionCommunications: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

#### Use Component
```tsx
import { SessionCommunicationConfig } from '@/components/communications';

function MyPage() {
  const [config, setConfig] = useState<SessionCommunicationConfigType | null>(null);

  return (
    <SessionCommunicationConfig
      config={config}
      onChange={setConfig}
      sessionProductId="product-123"
    />
  );
}
```

## Best Practices

### Timing Recommendations

| Reminder | Timing | Channel | Purpose |
|----------|--------|---------|---------|
| **Booking Confirmation** | Immediate | Email + WhatsApp | Confirm booking, provide details |
| **First Reminder** | 24 hours before | Email | Detailed info, preparation instructions |
| **Second Reminder** | 1 hour before | WhatsApp + SMS | Quick alert, meeting link |
| **Follow-up** | 2-4 hours after | Email | Thank you, feedback survey |

### Message Best Practices

1. **Keep it concise** — People scan messages, especially on mobile
2. **Always include meeting link** — Make it easy to join
3. **Use personalization** — Address customer by name
4. **Add value** — Preparation tips, agenda, next steps
5. **Clear CTA** — One primary action per message

### Example Message Templates

#### 24-Hour Reminder (Email)
```
Subject: Tomorrow: Your {{sessionTime}} session with {{merchantName}}

Hi {{customerName}},

This is a friendly reminder about your session tomorrow!

📅 Date: {{sessionDate}}
⏰ Time: {{sessionTime}}
🔗 Join here: {{meetingLink}}

**What to prepare:**
- Have your questions ready
- Test your camera/mic beforehand
- Join 5 minutes early

Looking forward to connecting!

Best,
{{merchantName}}
```

#### 1-Hour Reminder (WhatsApp)
```
Hi {{customerName}}! ⏰

Your session starts in 1 hour at {{sessionTime}}.

🔗 Join here: {{meetingLink}}

See you soon! 👋
```

#### Post-Session Follow-up (Email)
```
Subject: Thank you for attending!

Hi {{customerName}},

Thank you for the session today! We hope you found it valuable.

**Your feedback matters:**
Please take 2 minutes to share your thoughts: {{surveyUrl}}

{{#if recordingLink}}
**Session Recording:**
{{recordingLink}}
{{/if}}

Have questions? Just reply to this email.

Best,
{{merchantName}}
```

## Technical Implementation

### Storage
Currently uses `localStorage` with key: `sessionCommunicationConfigs`

```typescript
// Save
const configs = {
  [productId]: config
};
localStorage.setItem('sessionCommunicationConfigs', JSON.stringify(configs));

// Load
const stored = localStorage.getItem('sessionCommunicationConfigs');
const configs = stored ? JSON.parse(stored) : {};
const config = configs[productId];
```

### Future Enhancements

1. **API Integration**
   - Replace localStorage with backend API
   - Store in database for persistence

2. **Email Service Integration**
   - SendGrid / AWS SES for email delivery
   - Track opens, clicks, bounces

3. **SMS Integration**
   - Twilio / MSG91 for SMS
   - Delivery reports

4. **WhatsApp Business API**
   - Meta WhatsApp Business API
   - Template message approvals
   - Interactive buttons

5. **Analytics**
   - Communication delivery rates
   - Open/click tracking
   - No-show correlation with reminders

6. **A/B Testing**
   - Test different message templates
   - Test different timing
   - Optimize for attendance

7. **Advanced Features**
   - Conditional logic (send WhatsApp if email not opened)
   - Timezone-aware scheduling
   - Reschedule/cancellation communications
   - Waitlist notifications

## Data Models

### SessionCommunicationConfig
```typescript
{
  sessionProductId: string;
  enabled: boolean;
  sendBookingConfirmation: boolean;
  bookingConfirmationChannels: CommunicationChannel[];
  bookingConfirmationMessage?: string;
  reminders: SessionReminder[];
  postSessionCommunications: PostSessionCommunication[];
  timezone?: string;
  defaultSenderName?: string;
  defaultSenderEmail?: string;
  defaultSenderPhone?: string;
  createdAt: string;
  updatedAt: string;
}
```

### SessionReminder
```typescript
{
  id: string;
  name: string;
  enabled: boolean;
  timing: ReminderTiming;
  channels: CommunicationChannel[];
  subject?: string;
  message: string;
  useTemplate: boolean;
  templateId?: string;
  metadata?: Record<string, any>;
}
```

### ReminderTiming
```typescript
// Relative timing
{
  type: 'relative';
  value: number;
  unit: 'minutes' | 'hours' | 'days';
  before: true;
}

// Absolute timing
{
  type: 'absolute';
  daysBeforeSession: number;
  timeOfDay: string; // "19:00"
}
```

### PostSessionCommunication
```typescript
{
  id: string;
  name: string;
  enabled: boolean;
  delayAfterSession: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  channels: CommunicationChannel[];
  subject?: string;
  message: string;
  includeSurvey?: boolean;
  surveyUrl?: string;
  includeRecording?: boolean;
  metadata?: Record<string, any>;
}
```

### SessionCommunicationLog
```typescript
{
  id: string;
  sessionBookingId: string;
  sessionProductId: string;
  type: 'booking_confirmation' | 'reminder' | 'post_session' | 'cancellation' | 'reschedule';
  reminderId?: string;
  channel: CommunicationChannel;
  recipient: {
    name: string;
    email?: string;
    phone?: string;
  };
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked';
  scheduledAt: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  content: {
    subject?: string;
    message: string;
  };
  error?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
```

## Routes

- `/communications/:productId` — Full-page communication manager

## Integration Points

1. **ProductForm.tsx** → Session Details section
2. **SessionDetailsForm.tsx** → New "Automated Communications" card
3. **App.tsx** → Route configuration
4. **DashboardSidebar.tsx** → Navigation (future)

## Testing

### Manual Testing Checklist

- [ ] Can create booking confirmation
- [ ] Can add multiple reminders
- [ ] Can configure relative timing (hours/days before)
- [ ] Can configure absolute timing (specific time)
- [ ] Can select multiple channels per reminder
- [ ] Can customize message content
- [ ] Can use template variables
- [ ] Can add post-session follow-ups
- [ ] Can enable/disable individual reminders
- [ ] Can delete reminders
- [ ] Configuration persists on page reload
- [ ] Can navigate from product form to communications page
- [ ] Preview timeline shows correct order

### Test Scenarios

**Scenario 1: Standard 1:1 Coaching**
- Booking confirmation: Email + WhatsApp
- Reminder 1: 24 hours before via Email
- Reminder 2: 1 hour before via WhatsApp
- Follow-up: 2 hours after with survey

**Scenario 2: Evening Sessions**
- Reminder at 7 PM, 1 day before (absolute timing)
- Reminder 30 minutes before via SMS

**Scenario 3: Multi-day Workshop**
- Reminder at 9 AM on session day (absolute timing)
- Reminder 15 minutes before via WhatsApp
- Post-session recording shared after 1 day

## Support

For questions or issues:
1. Check this README
2. Review code comments in `communications.ts`
3. Check example implementations in `SessionCommunications.tsx`

---

**Created:** March 2026
**Version:** 1.0.0
**Author:** Razorpay No-Code Team
