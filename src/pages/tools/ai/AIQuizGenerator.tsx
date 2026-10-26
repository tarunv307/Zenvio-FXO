import { AIToolView } from '../../../components/ai/AIToolView';

export function AIQuizGenerator() {
  return (
    <AIToolView
      toolId="ai-quiz-generator"
      title="Quiz Question Generator"
      description="Create challenging multiple-choice or true/false test questions with verified answer keys."
      inputLabel="Learning Material or Topic"
      inputPlaceholder="Paste material to test comprehension on..."
      examplePrompt={`Photosynthesis is the biological process used by plants, algae, and cyanobacteria to convert light energy into chemical energy. This chemical energy is stored in carbohydrate molecules, such as sugars, which are synthesized from carbon dioxide and water. In most cases, oxygen is also released as a waste product. The light-dependent reactions occur in the thylakoid membranes of chloroplasts.`}
      optionsConfig={[
        {
          id: 'type',
          label: 'Question Type',
          type: 'select',
          options: [
            { value: 'multiple-choice with 4 options (A-D)', label: 'Multiple Choice (4 Options)' },
            { value: 'true or false with explanation', label: 'True / False' },
            { value: 'mixed multiple choice and short answer', label: 'Mixed Format' },
          ],
          defaultValue: 'multiple-choice with 4 options (A-D)',
        },
        {
          id: 'count',
          label: 'Question Count',
          type: 'select',
          options: [
            { value: '3', label: '3 Questions' },
            { value: '5', label: '5 Questions' },
            { value: '10', label: '10 Questions' },
          ],
          defaultValue: '5',
        },
      ]}
    />
  );
}
