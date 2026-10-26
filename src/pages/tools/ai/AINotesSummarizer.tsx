import { AIToolView } from '../../../components/ai/AIToolView';

export function AINotesSummarizer() {
  return (
    <AIToolView
      toolId="ai-notes-summarizer"
      title="Notes Summarizer"
      description="Extract key decisions, deliverables, and action items from raw meeting or lecture notes."
      inputLabel="Raw Notes or Meeting Transcript"
      inputPlaceholder="Paste messy brainstorm notes, lecture transcripts, or meeting notes..."
      examplePrompt={`Sync with UX and mobile team on redesign:
- David presented wireframes for the new dashboard navigation
- Everyone liked the simplified bottom bar, but Lisa raised concerns about tablet orientation layout
- Need to decide whether to ship dark mode in V1 or push to V2
- Action: David will export SVG icons by Wednesday
- Action: Carlos to benchmark initial load time with the bundle analyzer before Friday standup
- Next review scheduled for Monday 10am`}
      optionsConfig={[
        {
          id: 'noteType',
          label: 'Type of Notes',
          type: 'select',
          options: [
            { value: 'team meeting notes', label: 'Team / Business Meeting' },
            { value: 'academic lecture notes', label: 'Academic Lecture / Class' },
            { value: 'brainstorming session', label: 'Brainstorming Session' },
            { value: 'customer interview notes', label: 'Customer Interview / Research' },
          ],
          defaultValue: 'team meeting notes',
        },
      ]}
    />
  );
}
