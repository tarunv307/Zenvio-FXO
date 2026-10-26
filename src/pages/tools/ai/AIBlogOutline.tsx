import { AIToolView } from '../../../components/ai/AIToolView';

export function AIBlogOutline() {
  return (
    <AIToolView
      toolId="ai-blog-outline"
      title="Blog Outline Generator"
      description="Create comprehensive, SEO-optimized content structures, H2/H3 headings, and talking points."
      inputLabel="Blog Topic or Target Keyword"
      inputPlaceholder="Enter a blog title, topic idea, or SEO primary keyword..."
      examplePrompt={`Why browser-based local utility tools are replacing heavy desktop software for privacy-conscious developers`}
      optionsConfig={[
        {
          id: 'format',
          label: 'Article Format',
          type: 'select',
          options: [
            { value: 'comprehensive SEO thought leadership', label: 'In-Depth Thought Leadership' },
            { value: 'step-by-step how-to guide', label: 'Step-by-Step How-To Guide' },
            { value: 'listicle with practical examples', label: 'Listicle (Top 10 / Best Practices)' },
            { value: 'case study breakdown', label: 'Case Study & Analysis' },
          ],
          defaultValue: 'comprehensive SEO thought leadership',
        },
        {
          id: 'audience',
          label: 'Target Audience',
          type: 'select',
          options: [
            { value: 'software engineers and tech professionals', label: 'Software Engineers & Tech Pros' },
            { value: 'business decision-makers and founders', label: 'Founders & Business Leads' },
            { value: 'general consumers and students', label: 'Students & Everyday Users' },
          ],
          defaultValue: 'software engineers and tech professionals',
        },
      ]}
    />
  );
}
