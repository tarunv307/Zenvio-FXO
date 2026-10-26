import { AIToolView } from '../../../components/ai/AIToolView';

export function AIRewriter() {
  return (
    <AIToolView
      toolId="ai-rewriter"
      title="Natural Writing Assistant / AI Text Rewriter"
      description="Refine sentence structure, elevate vocabulary, and make your writing sound polished and natural."
      inputLabel="Original Draft Text"
      inputPlaceholder="Paste draft paragraphs that need rewriting for better flow and impact..."
      examplePrompt={`The project was not able to be finished on time by our team because we had a lot of issues that happened with our database connection and also the requirements kept changing from the client constantly.`}
      optionsConfig={[
        {
          id: 'goal',
          label: 'Primary Goal',
          type: 'select',
          options: [
            { value: 'improve flow', label: 'Improve Flow & Cadence' },
            { value: 'make more concise', label: 'Make More Concise' },
            { value: 'elevate vocabulary', label: 'Elevate Vocabulary' },
            { value: 'increase persuasiveness', label: 'Increase Persuasiveness' },
          ],
          defaultValue: 'improve flow',
        },
        {
          id: 'tone',
          label: 'Desired Tone',
          type: 'select',
          options: [
            { value: 'natural and clear', label: 'Natural & Clear' },
            { value: 'executive business', label: 'Executive Business' },
            { value: 'casual and friendly', label: 'Casual & Friendly' },
            { value: 'academic', label: 'Academic / Formal' },
          ],
          defaultValue: 'natural and clear',
        },
      ]}
    />
  );
}
