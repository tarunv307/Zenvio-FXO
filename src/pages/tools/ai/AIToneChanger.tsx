import { AIToolView } from '../../../components/ai/AIToolView';

export function AIToneChanger() {
  return (
    <AIToolView
      toolId="ai-tone-changer"
      title="Tone Changer"
      description="Shift the emotional tone, register, and style of any message to fit your audience."
      inputLabel="Message or Content"
      inputPlaceholder="Paste an email, message, or paragraph to re-voice..."
      examplePrompt={`Hey team, we need to talk about the deadline. People are taking way too long on pull requests and it's making the whole sprint look bad. Please hurry up and review each other's code.`}
      optionsConfig={[
        {
          id: 'targetTone',
          label: 'Target Tone',
          type: 'select',
          options: [
            { value: 'professional and diplomatic', label: 'Professional & Diplomatic' },
            { value: 'warm and empathetic', label: 'Warm & Empathetic' },
            { value: 'casual and friendly', label: 'Casual & Friendly' },
            { value: 'persuasive and confident', label: 'Persuasive & Confident' },
            { value: 'concise and direct', label: 'Concise & Direct' },
            { value: 'academic and objective', label: 'Academic & Objective' },
          ],
          defaultValue: 'professional and diplomatic',
        },
      ]}
    />
  );
}
