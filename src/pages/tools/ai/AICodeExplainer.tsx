import { AIToolView } from '../../../components/ai/AIToolView';

export function AICodeExplainer() {
  return (
    <AIToolView
      toolId="ai-code-explainer"
      title="Code Explainer"
      description="Break down complex algorithms, functions, and architecture into understandable step-by-step logic."
      inputLabel="Code Snippet"
      inputPlaceholder="Paste code (TypeScript, Python, Rust, Go, SQL, etc.) to explain..."
      examplePrompt={`function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`}
      optionsConfig={[
        {
          id: 'depth',
          label: 'Explanation Depth',
          type: 'select',
          options: [
            { value: 'line-by-line detailed walkthrough', label: 'Detailed Line-by-Line' },
            { value: 'high-level conceptual overview', label: 'High-Level Conceptual' },
            { value: 'complexity analysis and edge cases', label: 'Complexity & Edge Cases' },
          ],
          defaultValue: 'line-by-line detailed walkthrough',
        },
      ]}
    />
  );
}
