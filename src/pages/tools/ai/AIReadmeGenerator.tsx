import { AIToolView } from '../../../components/ai/AIToolView';

export function AIReadmeGenerator() {
  return (
    <AIToolView
      toolId="ai-readme-generator"
      title="README Generator"
      description="Generate comprehensive, formatted GitHub README.md markdown with installation, tech stack, and usage sections."
      inputLabel="Project Overview & Tech Stack"
      inputPlaceholder="Describe your repository: project name, key features, prerequisites, install commands..."
      examplePrompt={`Project: Zenvio FXO
Description: A modern all-in-one browser utility platform featuring image optimization, PDF editing, developer utilities, and AI tools with zero server tracking.
Stack: React 18, TypeScript, Vite, Tailwind CSS
Installation:
1. git clone https://github.com/example/zenvio-fxo.git
2. npm install
3. npm run dev`}
      optionsConfig={[
        {
          id: 'projectType',
          label: 'Project Type',
          type: 'select',
          options: [
            { value: 'Frontend Web Application', label: 'Frontend Web App' },
            { value: 'Full-stack Web App', label: 'Full-Stack Web App' },
            { value: 'Node.js CLI Tool', label: 'Command-Line (CLI) Tool' },
            { value: 'NPM / Library Package', label: 'NPM / Open Source Library' },
            { value: 'Backend REST API Service', label: 'Backend REST API' },
          ],
          defaultValue: 'Frontend Web Application',
        },
      ]}
    />
  );
}
