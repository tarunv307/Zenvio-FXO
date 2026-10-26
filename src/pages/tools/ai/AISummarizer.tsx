import { AIToolView } from '../../../components/ai/AIToolView';

export function AISummarizer() {
  return (
    <AIToolView
      toolId="ai-summarizer"
      title="AI Summarizer"
      description="Distill long articles, essays, research papers, and documents into clear, actionable summaries."
      inputLabel="Article or Document Text"
      inputPlaceholder="Paste your text, report, or article here to summarize..."
      examplePrompt={`Artificial Intelligence has evolved rapidly over the past decade, driven by advances in deep learning, massive compute clusters, and abundant training data. Modern foundation models can process natural language, generate functional code, synthesize realistic imagery, and perform multi-modal reasoning. While these breakthroughs unlock immense productivity gains across software engineering, healthcare diagnostics, legal review, and creative industries, they also present profound societal challenges. Issues surrounding copyright infringement, algorithmic bias, systemic hallucination, automated disinformation, and workforce displacement require rigorous governance, technical alignment research, and international policy cooperation.`}
      optionsConfig={[
        {
          id: 'length',
          label: 'Summary Length',
          type: 'select',
          options: [
            { value: 'short', label: 'Short (2–3 sentences)' },
            { value: 'medium', label: 'Medium (1–2 paragraphs)' },
            { value: 'comprehensive', label: 'Comprehensive (Detailed breakdown)' },
          ],
          defaultValue: 'medium',
        },
        {
          id: 'format',
          label: 'Output Format',
          type: 'select',
          options: [
            { value: 'paragraphs', label: 'Fluid Paragraphs' },
            { value: 'bullets', label: 'Key Bullet Points' },
          ],
          defaultValue: 'paragraphs',
        },
      ]}
    />
  );
}
