import { AIToolView } from '../../../components/ai/AIToolView';

export function AIErrorExplainer() {
  return (
    <AIToolView
      toolId="ai-error-explainer"
      title="Error Message Explainer"
      description="Translate cryptic compiler warnings, runtime exceptions, and stack traces into clear root causes and solutions."
      inputLabel="Error Message or Stack Trace"
      inputPlaceholder="Paste error log, stack trace, or compiler diagnostic message..."
      examplePrompt={`TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (src/components/UserList.tsx:24:18)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:17811:13)`}
      optionsConfig={[]}
    />
  );
}
