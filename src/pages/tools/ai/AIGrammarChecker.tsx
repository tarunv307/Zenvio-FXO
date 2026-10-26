import { AIToolView } from '../../../components/ai/AIToolView';

export function AIGrammarChecker() {
  return (
    <AIToolView
      toolId="ai-grammar-checker"
      title="Grammar Checker"
      description="Detect and correct grammatical errors, awkward syntax, spelling slip-ups, and punctuation mistakes."
      inputLabel="Text to Proofread"
      inputPlaceholder="Paste text to scan for spelling, syntax, punctuation, and grammatical mistakes..."
      examplePrompt={`Their going to submit they're report yesterday but neither the manager or the assistants was available to sign off on the doccument.`}
      optionsConfig={[
        {
          id: 'style',
          label: 'Editorial Style',
          type: 'select',
          options: [
            { value: 'standard American English', label: 'Standard American (US)' },
            { value: 'standard British English', label: 'Standard British (UK)' },
            { value: 'formal academic', label: 'Formal Academic' },
            { value: 'business professional', label: 'Business Professional' },
          ],
          defaultValue: 'standard American English',
        },
      ]}
    />
  );
}
