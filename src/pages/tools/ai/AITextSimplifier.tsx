import { AIToolView } from '../../../components/ai/AIToolView';

export function AITextSimplifier() {
  return (
    <AIToolView
      toolId="ai-text-simplifier"
      title="Text Simplifier"
      description="Translate complex academic, medical, or legal jargon into everyday plain English."
      inputLabel="Complex or Jargon-Dense Text"
      inputPlaceholder="Paste legal terms, scientific abstracts, or bureaucratic text to simplify..."
      examplePrompt={`The party of the first part hereby indemnifies, defends, and holds harmless the party of the second part from any and all liabilities, claims, damages, and operational losses arising pursuant to contractual non-performance or incidental third-party indemnification events.`}
      optionsConfig={[
        {
          id: 'level',
          label: 'Target Simplification Level',
          type: 'select',
          options: [
            { value: 'plain English (general audience)', label: 'Plain English (General Audience)' },
            { value: '5th grade reading level', label: '5th Grade Reading Level (Simplest)' },
            { value: 'executive summary for non-experts', label: 'Executive Summary for Non-Experts' },
          ],
          defaultValue: 'plain English (general audience)',
        },
      ]}
    />
  );
}
