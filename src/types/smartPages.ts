export type PageType = "course" | "webinar" | "coaching" | "workshop" | "membership";

export interface EventConfig {
  date: string; // ISO date
  time: string; // HH:mm
  duration: number; // minutes
  timezone: string;
  platform: "zoom" | "gmeet" | "custom";
  meetingLink: string;
  eventName: string;
}

export interface RegistrationField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "textarea";
  required: boolean;
  placeholder: string;
  options?: string[];
}

export interface WorkflowTrigger {
  id: string;
  type: "on_registration" | "post_event" | "payment_success" | "payment_failed";
  label: string;
}

export interface WorkflowAction {
  id: string;
  type: "send_email" | "send_whatsapp" | "send_sms" | "enroll_course";
  label: string;
  config: Record<string, any>;
  enabled: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  enabled: boolean;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  registeredAt: string;
  attended: boolean;
  duration?: string; // time spent in meeting
  source: "zoom" | "csv" | "manual";
}

export interface WebinarData {
  name: string;
  description: string;
  bannerImage: string;
  isPaid: boolean;
  amount: number;
  eventConfig: EventConfig;
  registrationFields: RegistrationField[];
  workflows: Workflow[];
  attendees: Attendee[];
  speakers: { name: string; title: string; avatar: string; bio: string }[];
}

export const defaultRegistrationFields: RegistrationField[] = [
  { id: "rf_name", label: "Full Name", type: "text", required: true, placeholder: "Enter your name" },
  { id: "rf_email", label: "Email Address", type: "email", required: true, placeholder: "Enter your email" },
  { id: "rf_phone", label: "Phone Number", type: "phone", required: false, placeholder: "Enter your phone" },
];

export const defaultWorkflows: Workflow[] = [
  {
    id: "wf_1",
    name: "Welcome on Registration",
    trigger: { id: "t1", type: "on_registration", label: "On Registration" },
    actions: [
      { id: "a1", type: "send_email", label: "Send Welcome Email", config: { subject: "Welcome! You're registered", body: "Thank you for registering..." }, enabled: true },
    ],
    enabled: true,
  },
  {
    id: "wf_2",
    name: "Post-Event Follow Up",
    trigger: { id: "t2", type: "post_event", label: "Post Event" },
    actions: [
      { id: "a2", type: "send_email", label: "Send Recording Link", config: { subject: "Here's the recording", body: "Thanks for attending..." }, enabled: true },
      { id: "a3", type: "send_whatsapp", label: "Send WhatsApp Follow-up", config: { message: "Thanks for attending! Check out our courses." }, enabled: false },
    ],
    enabled: true,
  },
  {
    id: "wf_3",
    name: "Payment Confirmation",
    trigger: { id: "t3", type: "payment_success", label: "Payment Success" },
    actions: [
      { id: "a4", type: "send_email", label: "Send Receipt", config: { subject: "Payment confirmed", body: "Your payment has been received." }, enabled: true },
    ],
    enabled: false,
  },
];

export const pageTypeLabels: Record<PageType, string> = {
  course: "Online Course",
  webinar: "Webinar",
  coaching: "1:1 Coaching",
  workshop: "Workshop",
  membership: "Membership",
};

export const pageTypeColors: Record<PageType, string> = {
  course: "bg-blue-100 text-blue-700",
  webinar: "bg-purple-100 text-purple-700",
  coaching: "bg-amber-100 text-amber-700",
  workshop: "bg-emerald-100 text-emerald-700",
  membership: "bg-rose-100 text-rose-700",
};
