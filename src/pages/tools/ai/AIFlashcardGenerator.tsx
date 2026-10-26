import { AIToolView } from '../../../components/ai/AIToolView';

export function AIFlashcardGenerator() {
  return (
    <AIToolView
      toolId="ai-flashcard-generator"
      title="Flashcard Generator"
      description="Convert study materials, textbooks, and documentation into active-recall question-and-answer flashcards."
      inputLabel="Study Material or Chapter Text"
      inputPlaceholder="Paste study notes, vocabulary lists, or textbook excerpts..."
      examplePrompt={`Mitochondria are membrane-bound cell organelles that generate most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP). Mitochondria contain their own small chromosomes. Generally, mitochondria, and therefore mitochondrial DNA, are inherited exclusively from the mother.`}
      optionsConfig={[
        {
          id: 'count',
          label: 'Number of Cards',
          type: 'select',
          options: [
            { value: '3', label: '3 Flashcards' },
            { value: '5', label: '5 Flashcards' },
            { value: '10', label: '10 Flashcards' },
          ],
          defaultValue: '5',
        },
      ]}
    />
  );
}
