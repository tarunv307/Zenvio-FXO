import { AIToolView } from '../../../components/ai/AIToolView';

export function AIBulletPoints() {
  return (
    <AIToolView
      toolId="ai-bullet-points"
      title="Bullet Point Generator"
      description="Transform walls of unformatted prose into clean, scannable, high-impact bullet points."
      inputLabel="Unformatted Text or Notes"
      inputPlaceholder="Paste paragraphs, meeting takeaways, or transcripts to convert into bullet points..."
      examplePrompt={`During our Q3 planning session, Sarah mentioned that customer churn dropped by 4.2% following the release of the streamlined checkout page. Michael emphasized that we still have latency spikes during peak hours around 12 PM UTC, which requires optimizing our Redis cache keys and database indexing. For Q4, our primary OKRs will focus on shipping mobile push notifications, launching the European localized payment methods, and achieving SOC2 Type II compliance.`}
      optionsConfig={[
        {
          id: 'style',
          label: 'Bullet Style',
          type: 'select',
          options: [
            { value: 'action-oriented and categorized', label: 'Categorized & Action-Oriented' },
            { value: 'short and punchy takeaways', label: 'Short & Punchy Key Takeaways' },
            { value: 'executive briefing bullets', label: 'Executive Briefing' },
          ],
          defaultValue: 'action-oriented and categorized',
        },
      ]}
    />
  );
}
