import { AIToolView } from '../../../components/ai/AIToolView';

export function AIEmailGenerator() {
  return (
    <AIToolView
      toolId="ai-email-generator"
      title="Email Draft Generator"
      description="Draft professional, persuasive, and context-aware emails from rough bullet points."
      inputLabel="Key Points & Context"
      inputPlaceholder="List who you're emailing, what you need, and any relevant deadlines or details..."
      examplePrompt={`- Recipient: Alex Chen (Engineering Lead)
- Context: Need to reschedule tomorrow's architecture review meeting
- Reason: Urgent customer outage investigation in the morning
- Proposed new time: Thursday at 2:00 PM EST or Friday at 10:00 AM EST
- Apologize for short notice`}
      optionsConfig={[
        {
          id: 'purpose',
          label: 'Email Purpose',
          type: 'select',
          options: [
            { value: 'meeting reschedule / scheduling', label: 'Meeting Reschedule / Scheduling' },
            { value: 'formal project update', label: 'Project Status Update' },
            { value: 'client proposal / inquiry', label: 'Client Inquiry / Proposal' },
            { value: 'polite follow-up', label: 'Polite Follow-up' },
            { value: 'cold outreach', label: 'Cold Outreach / Networking' },
            { value: 'formal apology', label: 'Apology / Error Notice' },
          ],
          defaultValue: 'meeting reschedule / scheduling',
        },
        {
          id: 'tone',
          label: 'Tone',
          type: 'select',
          options: [
            { value: 'professional and courteous', label: 'Professional & Courteous' },
            { value: 'warm and casual', label: 'Warm & Casual' },
            { value: 'urgent and direct', label: 'Urgent & Direct' },
            { value: 'formal executive', label: 'Formal Executive' },
          ],
          defaultValue: 'professional and courteous',
        },
      ]}
    />
  );
}
