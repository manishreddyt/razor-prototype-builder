/**
 * Session Communication Types
 * Handles automated reminders and follow-ups for 1:1 sessions
 */

export type CommunicationChannel = 'email' | 'sms' | 'whatsapp';

export type ReminderTimingType = 'relative' | 'absolute';

export interface RelativeTiming {
  type: 'relative';
  value: number;
  unit: 'minutes' | 'hours' | 'days';
  before: true; // Always before session
}

export interface AbsoluteTiming {
  type: 'absolute';
  daysBeforeSession: number;
  timeOfDay: string; // 24-hour format "HH:mm" e.g., "19:00" for 7 PM
}

export type ReminderTiming = RelativeTiming | AbsoluteTiming;

export interface SessionReminder {
  id: string;
  name: string;
  enabled: boolean;

  // When to send
  timing: ReminderTiming;

  // How to send
  channels: CommunicationChannel[];

  // What to send
  subject?: string; // For email
  message: string;

  // Template variables available: {{merchantName}}, {{sessionDate}}, {{sessionTime}}, {{meetingLink}}, {{customerName}}
  useTemplate: boolean;
  templateId?: string;

  metadata?: Record<string, any>;
}

export interface PostSessionCommunication {
  id: string;
  name: string;
  enabled: boolean;

  // When to send (after session ends)
  delayAfterSession: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };

  // How to send
  channels: CommunicationChannel[];

  // What to send
  subject?: string;
  message: string;

  // Optional: Include survey/feedback link
  includeSurvey?: boolean;
  surveyUrl?: string;

  // Optional: Include recording link (if session was recorded)
  includeRecording?: boolean;

  metadata?: Record<string, any>;
}

export interface SessionCommunicationConfig {
  sessionProductId: string;
  enabled: boolean;

  // Booking confirmation
  sendBookingConfirmation: boolean;
  bookingConfirmationChannels: CommunicationChannel[];
  bookingConfirmationMessage?: string;

  // Pre-session reminders
  reminders: SessionReminder[];

  // Post-session follow-ups
  postSessionCommunications: PostSessionCommunication[];

  // Global settings
  timezone?: string; // For absolute timing
  defaultSenderName?: string;
  defaultSenderEmail?: string;
  defaultSenderPhone?: string;

  createdAt: string;
  updatedAt: string;
}

export interface SessionCommunicationLog {
  id: string;
  sessionBookingId: string;
  sessionProductId: string;

  type: 'booking_confirmation' | 'reminder' | 'post_session' | 'cancellation' | 'reschedule';
  reminderId?: string; // Reference to SessionReminder if type is 'reminder'

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

export interface SessionBooking {
  id: string;
  sessionProductId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  sessionDate: string; // ISO 8601
  sessionTime: string; // "HH:mm"
  duration: number; // minutes
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  communicationLogs: SessionCommunicationLog[];
  createdAt: string;
  updatedAt: string;
}

// Default templates
export const DEFAULT_REMINDER_TEMPLATES = {
  email: {
    '1day': {
      subject: 'Reminder: Your session with {{merchantName}} is tomorrow',
      message: `Hi {{customerName}},

This is a friendly reminder that you have a session scheduled with {{merchantName}} tomorrow.

📅 Date: {{sessionDate}}
⏰ Time: {{sessionTime}}
🔗 Meeting Link: {{meetingLink}}

Looking forward to connecting with you!

Best regards,
{{merchantName}}`
    },
    '1hour': {
      subject: 'Starting Soon: Your session with {{merchantName}} in 1 hour',
      message: `Hi {{customerName}},

Your session with {{merchantName}} starts in 1 hour!

⏰ Time: {{sessionTime}}
🔗 Join here: {{meetingLink}}

See you soon!

Best regards,
{{merchantName}}`
    }
  },
  whatsapp: {
    '1day': `Hi {{customerName}}! 👋

Reminder: Your session with {{merchantName}} is tomorrow at {{sessionTime}}.

📅 {{sessionDate}}
🔗 Meeting Link: {{meetingLink}}

Looking forward to it!`,
    '1hour': `Hi {{customerName}}! ⏰

Your session starts in 1 hour at {{sessionTime}}.

🔗 Join here: {{meetingLink}}

See you soon!`
  },
  sms: {
    '1day': 'Reminder: Your session with {{merchantName}} is tomorrow at {{sessionTime}}. Meeting link: {{meetingLink}}',
    '1hour': 'Your session with {{merchantName}} starts in 1 hour at {{sessionTime}}. Join: {{meetingLink}}'
  }
};

export const DEFAULT_POST_SESSION_TEMPLATE = {
  email: {
    subject: 'Thank you for attending our session!',
    message: `Hi {{customerName}},

Thank you for attending the session with {{merchantName}}!

We hope you found it valuable. We'd love to hear your feedback.

📝 Share your feedback: {{surveyUrl}}

{{#if recordingLink}}
📹 Session Recording: {{recordingLink}}
{{/if}}

Best regards,
{{merchantName}}`
  },
  whatsapp: `Hi {{customerName}}! 🙏

Thank you for attending the session with {{merchantName}}!

We'd love to hear your feedback: {{surveyUrl}}

{{#if recordingLink}}
📹 Recording: {{recordingLink}}
{{/if}}`,
  sms: 'Thank you for attending the session with {{merchantName}}! Share your feedback: {{surveyUrl}}'
};
