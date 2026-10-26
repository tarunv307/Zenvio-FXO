import { AIToolView } from '../../../components/ai/AIToolView';

export function AIParaphraser() {
  return (
    <AIToolView
      toolId="ai-paraphraser"
      title="AI Paraphraser"
      description="Restructure sentences and rephrase ideas while keeping the core meaning completely intact."
      inputLabel="Input Text to Paraphrase"
      inputPlaceholder="Enter sentences or paragraphs to rephrase in a fresh voice..."
      examplePrompt={`Regular physical exercise has been proven to significantly enhance cognitive flexibility, reduce chronic stress, and elevate cardiovascular health across adult populations.`}
      optionsConfig={[
        {
          id: 'mode',
          label: 'Paraphrase Mode',
          type: 'select',
          options: [
            { value: 'standard', label: 'Standard (Balanced)' },
            { value: 'fluent', label: 'Fluency & Flow' },
            { value: 'creative', label: 'Creative Rephrase' },
            { value: 'concise', label: 'Short & Punchy' },
            { value: 'formal', label: 'Formal & Academic' },
          ],
          defaultValue: 'standard',
        },
      ]}
    />
  );
}
