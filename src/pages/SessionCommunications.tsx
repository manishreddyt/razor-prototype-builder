import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MessageCircle, Mail, Smartphone, Clock, Calendar, Plus, Trash2, Settings2 } from 'lucide-react';

interface CommunicationTemplate {
  id: string;
  type: 'booking_confirmation' | 'reminder' | 'follow_up';
  title: string;
  enabled: boolean;
  timing: {
    type: 'immediate' | 'relative' | 'absolute';
    value?: number;
    unit?: 'minutes' | 'hours' | 'days';
    daysBeforeSession?: number;
    timeOfDay?: string; // "19:00"
  };
  channels: {
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
  };
  content: {
    subject?: string;
    message: string;
  };
}

const defaultTemplates: CommunicationTemplate[] = [
  {
    id: 'booking-confirmation',
    type: 'booking_confirmation',
    title: 'Booking Confirmation',
    enabled: true,
    timing: { type: 'immediate' },
    channels: { whatsapp: true, email: true, sms: false },
    content: {
      subject: 'Session Confirmed with {{merchantName}}',
      message: `Hi {{customerName}},

Your session has been confirmed! 🎉

📅 Date: {{sessionDate}}
⏰ Time: {{sessionTime}}
🔗 Meeting Link: {{meetingLink}}

We look forward to connecting with you!

Best regards,
{{merchantName}}`
    }
  },
  {
    id: '1-day-reminder',
    type: 'reminder',
    title: '1 Day Before Reminder',
    enabled: true,
    timing: { type: 'relative', value: 1, unit: 'days' },
    channels: { whatsapp: false, email: true, sms: false },
    content: {
      subject: 'Reminder: Your session with {{merchantName}} is tomorrow',
      message: `Hi {{customerName}},

This is a friendly reminder that your session is tomorrow!

📅 {{sessionDate}}
⏰ {{sessionTime}}
🔗 {{meetingLink}}

What to prepare:
• Have your questions ready
• Test your camera/mic beforehand
• Join 5 minutes early

Looking forward to it!

{{merchantName}}`
    }
  },
  {
    id: '1-hour-reminder',
    type: 'reminder',
    title: '1 Hour Before Reminder',
    enabled: true,
    timing: { type: 'relative', value: 1, unit: 'hours' },
    channels: { whatsapp: true, email: false, sms: false },
    content: {
      message: `Hi {{customerName}}! ⏰

Your session starts in 1 hour at {{sessionTime}}.

🔗 Join here: {{meetingLink}}

See you soon! 👋`
    }
  },
  {
    id: 'post-session-followup',
    type: 'follow_up',
    title: 'Post-Session Follow-up',
    enabled: true,
    timing: { type: 'relative', value: 2, unit: 'hours' },
    channels: { whatsapp: false, email: true, sms: false },
    content: {
      subject: 'Thank you for attending!',
      message: `Hi {{customerName}},

Thank you for attending the session! We hope you found it valuable.

We'd love to hear your feedback to help us improve:
📝 Share feedback: {{surveyUrl}}

Have questions? Just reply to this email.

Best regards,
{{merchantName}}`
    }
  }
];

export default function SessionCommunications() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<CommunicationTemplate[]>(defaultTemplates);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [productId]);

  const loadTemplates = () => {
    const stored = localStorage.getItem(`session-comms-${productId}`);
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
  };

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem(`session-comms-${productId}`, JSON.stringify(templates));
    setTimeout(() => {
      setSaving(false);
      alert('Communication settings saved successfully!');
    }, 500);
  };

  const updateTemplate = (id: string, updates: Partial<CommunicationTemplate>) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addCustomTemplate = () => {
    const newTemplate: CommunicationTemplate = {
      id: `custom-${Date.now()}`,
      type: 'reminder',
      title: 'Custom Reminder',
      enabled: true,
      timing: { type: 'relative', value: 1, unit: 'hours' },
      channels: { whatsapp: true, email: false, sms: false },
      content: { message: '' }
    };
    setTemplates([...templates, newTemplate]);
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this communication?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Communications</h1>
                <p className="text-sm text-gray-600">Configure automated messages for your sessions</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {templates.map((template) => (
            <CommunicationCard
              key={template.id}
              template={template}
              onUpdate={(updates) => updateTemplate(template.id, updates)}
              onDelete={() => deleteTemplate(template.id)}
              isDefault={['booking-confirmation', '1-day-reminder', '1-hour-reminder', 'post-session-followup'].includes(template.id)}
            />
          ))}

          {/* Add Custom Template */}
          <button
            onClick={addCustomTemplate}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Custom Communication</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface CommunicationCardProps {
  template: CommunicationTemplate;
  onUpdate: (updates: Partial<CommunicationTemplate>) => void;
  onDelete: () => void;
  isDefault: boolean;
}

function CommunicationCard({ template, onUpdate, onDelete, isDefault }: CommunicationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const timingLabel = () => {
    if (template.timing.type === 'immediate') return 'Immediately after booking';
    if (template.timing.type === 'relative') {
      if (template.type === 'follow_up') {
        return `${template.timing.value} ${template.timing.unit} after session`;
      }
      return `${template.timing.value} ${template.timing.unit} before session`;
    }
    if (template.timing.type === 'absolute') {
      return `At ${template.timing.timeOfDay}, ${template.timing.daysBeforeSession} day(s) before`;
    }
    return 'Custom timing';
  };

  const activeChannels = Object.entries(template.channels)
    .filter(([_, enabled]) => enabled)
    .map(([channel]) => channel);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={template.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="text-lg font-semibold text-gray-900 border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-0 py-1"
              />
              {!isDefault && (
                <button
                  onClick={onDelete}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{timingLabel()}</span>
              </div>
              <div className="flex items-center gap-2">
                {activeChannels.map(channel => (
                  <div key={channel} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {channel === 'email' && <Mail className="w-3 h-3" />}
                    {channel === 'whatsapp' && <MessageCircle className="w-3 h-3" />}
                    {channel === 'sms' && <Smartphone className="w-3 h-3" />}
                    <span className="text-xs font-medium capitalize">{channel}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {expanded ? 'Hide details' : 'Configure'}
            </button>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={template.enabled}
              onChange={(e) => onUpdate({ enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Enabled</span>
          </label>
        </div>
      </div>

      {/* Expanded Configuration */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 space-y-6 bg-gray-50">
          {/* Timing Configuration */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">When to send</label>

            {template.type !== 'booking_confirmation' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate({ timing: { type: 'relative', value: 1, unit: 'hours' } })}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    template.timing.type === 'relative'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  X hours/days before
                </button>
                <button
                  onClick={() => onUpdate({ timing: { type: 'absolute', daysBeforeSession: 1, timeOfDay: '19:00' } })}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    template.timing.type === 'absolute'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  At specific time
                </button>
              </div>
            )}

            {/* Relative Timing Controls */}
            {template.timing.type === 'relative' && (
              <div className="flex gap-2 items-center bg-white p-4 rounded-lg border border-gray-200">
                <input
                  type="number"
                  min="1"
                  value={template.timing.value || 1}
                  onChange={(e) => onUpdate({
                    timing: { ...template.timing, value: parseInt(e.target.value) || 1 }
                  })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={template.timing.unit || 'hours'}
                  onChange={(e) => onUpdate({
                    timing: { ...template.timing, unit: e.target.value as 'minutes' | 'hours' | 'days' }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {template.type === 'follow_up' ? 'after session' : 'before session'}
                </span>
              </div>
            )}

            {/* Absolute Timing Controls */}
            {template.timing.type === 'absolute' && (
              <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    value={template.timing.daysBeforeSession || 1}
                    onChange={(e) => onUpdate({
                      timing: { ...template.timing, daysBeforeSession: parseInt(e.target.value) || 0 }
                    })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-600">day(s) before session at</span>
                  <input
                    type="time"
                    value={template.timing.timeOfDay || '19:00'}
                    onChange={(e) => onUpdate({
                      timing: { ...template.timing, timeOfDay: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Example: "1 day before at 19:00" sends at 7 PM the day before the session
                </p>
              </div>
            )}
          </div>

          {/* Channel Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">Send via</label>
            <div className="grid grid-cols-3 gap-3">
              {(['whatsapp', 'email', 'sms'] as const).map(channel => (
                <label
                  key={channel}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    template.channels[channel]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={template.channels[channel]}
                    onChange={(e) => onUpdate({
                      channels: { ...template.channels, [channel]: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    {channel === 'email' && <Mail className="w-5 h-5 text-gray-700" />}
                    {channel === 'whatsapp' && <MessageCircle className="w-5 h-5 text-green-600" />}
                    {channel === 'sms' && <Smartphone className="w-5 h-5 text-blue-600" />}
                    <span className="text-sm font-medium capitalize text-gray-900">{channel}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">Message content</label>

            {template.channels.email && (
              <input
                type="text"
                value={template.content.subject || ''}
                onChange={(e) => onUpdate({
                  content: { ...template.content, subject: e.target.value }
                })}
                placeholder="Email subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}

            <textarea
              value={template.content.message}
              onChange={(e) => onUpdate({
                content: { ...template.content, message: e.target.value }
              })}
              placeholder="Type your message... Use {{customerName}}, {{sessionDate}}, {{sessionTime}}, {{meetingLink}}"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Available: {'{{customerName}}, {{merchantName}}, {{sessionDate}}, {{sessionTime}}, {{meetingLink}}, {{surveyUrl}}'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
