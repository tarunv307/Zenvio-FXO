import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildPromptForTool,
  executeAIRequest,
  checkRateLimit,
  getAIStatus,
} from '../server/aiHandler';

describe('AI Tools — Server-Side Prompt Generation for 15 AI Tools', () => {
  it('builds tailored prompts for text summarization and rewriting', () => {
    const summaryPrompt = buildPromptForTool('ai-summarizer', 'Test document content', {
      length: 'short',
      format: 'bullets',
    });
    expect(summaryPrompt).toContain('executive summarizer');
    expect(summaryPrompt).toContain('short');
    expect(summaryPrompt).toContain('Test document content');

    const rewritePrompt = buildPromptForTool('ai-rewriter', 'Draft sentence', {
      goal: 'make concise',
      tone: 'formal',
    });
    expect(rewritePrompt).toContain('writing assistant');
    expect(rewritePrompt).toContain('make concise');
    expect(rewritePrompt).toContain('formal');
  });

  it('builds tailored prompts for grammar checking and paraphrasing', () => {
    const grammarPrompt = buildPromptForTool('ai-grammar-checker', 'Their are errors', {
      style: 'standard British English',
    });
    expect(grammarPrompt).toContain('proofreader');
    expect(grammarPrompt).toContain('standard British English');

    const paraphrasePrompt = buildPromptForTool('ai-paraphraser', 'Idea to rephrase', {
      mode: 'creative',
    });
    expect(paraphrasePrompt).toContain('paraphraser');
    expect(paraphrasePrompt).toContain('creative');
  });

  it('builds prompts for tone changer, simplifier, and bullet generator', () => {
    const tonePrompt = buildPromptForTool('ai-tone-changer', 'Hey team', {
      targetTone: 'diplomatic',
    });
    expect(tonePrompt).toContain('diplomatic');

    const simplifierPrompt = buildPromptForTool('ai-text-simplifier', 'Complex legal terminology', {
      level: '5th grade reading level',
    });
    expect(simplifierPrompt).toContain('5th grade reading level');

    const bulletsPrompt = buildPromptForTool('ai-bullet-points', 'Long paragraph', {
      style: 'action-oriented',
    });
    expect(bulletsPrompt).toContain('bullet points');
  });

  it('builds prompts for email, blog outline, and notes summarizer', () => {
    const emailPrompt = buildPromptForTool('ai-email-generator', 'Need follow-up with client', {
      purpose: 'client proposal',
      tone: 'formal',
    });
    expect(emailPrompt).toContain('Subject Line');
    expect(emailPrompt).toContain('client proposal');

    const blogPrompt = buildPromptForTool('ai-blog-outline', 'Next-gen web development', {
      audience: 'software engineers',
    });
    expect(blogPrompt).toContain('H2 and H3');

    const notesPrompt = buildPromptForTool('ai-notes-summarizer', 'Meeting discussion', {
      noteType: 'board meeting notes',
    });
    expect(notesPrompt).toContain('Action Items');
    expect(notesPrompt).toContain('board meeting notes');
  });

  it('builds prompts for flashcards, quiz generator, code explainer, error explainer, and README', () => {
    const flashcardPrompt = buildPromptForTool('ai-flashcard-generator', 'Biology chapter', {
      count: 10,
    });
    expect(flashcardPrompt).toContain('10 high-yield study flashcards');

    const quizPrompt = buildPromptForTool('ai-quiz-generator', 'History lesson', {
      count: 5,
      type: 'multiple-choice',
    });
    expect(quizPrompt).toContain('multiple-choice');

    const codePrompt = buildPromptForTool('ai-code-explainer', 'const x = 1;', {
      depth: 'line-by-line',
    });
    expect(codePrompt).toContain('Time & Space Complexity');

    const errorPrompt = buildPromptForTool('ai-error-explainer', 'TypeError: undefined is not a function');
    expect(errorPrompt).toContain('Root Cause');
    expect(errorPrompt).toContain('Step-by-Step Fix');

    const readmePrompt = buildPromptForTool('ai-readme-generator', 'Project repo info', {
      projectType: 'Frontend App',
    });
    expect(readmePrompt).toContain('README.md');
  });
});

describe('AI Tools — Server-Side Validation, Security & Rate Limiting', () => {
  it('enforces rate limits per client IP', () => {
    const testIp = '192.168.1.100';
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(testIp)).toBe(true);
    }
    // 21st request in same window must be rejected
    expect(checkRateLimit(testIp)).toBe(false);
  });

  it('rejects empty input text gracefully', async () => {
    const result = await executeAIRequest({
      tool: 'ai-summarizer',
      input: '   ',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Input text is required');
  });

  it('rejects oversized inputs (>8,000 characters)', async () => {
    const longInput = 'A'.repeat(8005);
    const result = await executeAIRequest({
      tool: 'ai-summarizer',
      input: longInput,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('exceeds the maximum allowed length of 8,000 characters');
  });

  it('returns unconfigured status when no API key is present in environment', async () => {
    // Ensure test environment does not have keys set
    delete process.env.GEMINI_API_KEY;
    delete process.env.VITE_GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;

    const status = getAIStatus();
    expect(status.configured).toBe(false);

    const result = await executeAIRequest({
      tool: 'ai-summarizer',
      input: 'Short valid test text',
    });
    expect(result.ok).toBe(false);
    expect(result.configured).toBe(false);
    expect(result.error).toContain('AI backend provider is not configured');
  });
});
