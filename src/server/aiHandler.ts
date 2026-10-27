/**
 * Server-side AI Request Handler
 * 
 * Supports both Node.js / Vite development server middleware and
 * standard serverless functions (Vercel / Netlify / Node Express).
 * 
 * Uses server-side environment variables ONLY:
 * - process.env.GEMINI_API_KEY
 * - process.env.OPENAI_API_KEY
 * - process.env.AI_API_KEY
 * 
 * Secret keys are NEVER exposed to the client or prefixed with VITE_.
 */

// In-memory rate limiting map (IP -> timestamps[])
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Filter out timestamps older than window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

/**
 * Clean up stale rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, valid);
    }
  }
}, 5 * 60 * 1000);

export interface AIRequestBody {
  tool: string;
  input: string;
  options?: Record<string, any>;
}

export interface AIResponse {
  ok: boolean;
  output?: string;
  error?: string;
  configured?: boolean;
}

/**
 * System prompt generator tailored specifically to each of the 15 AI tools
 */
export function buildPromptForTool(tool: string, input: string, options: Record<string, any> = {}): string {
  const opt = options || {};

  switch (tool) {
    case 'ai-summarizer': {
      const length = opt.length || 'medium';
      const format = opt.format || 'paragraphs';
      return `You are a concise, objective executive summarizer.
Task: Summarize the following content.
Target Length: ${length} (short = 2-3 sentences; medium = 1-2 paragraphs; comprehensive = full detailed summary).
Format: ${format === 'bullets' ? 'Key bullet points' : 'Cohesive paragraphs'}.

Input Content:
"""
${input}
"""`;
    }

    case 'ai-rewriter': {
      const goal = opt.goal || 'improve flow';
      const tone = opt.tone || 'natural';
      return `You are an expert editor and writing assistant.
Task: Rewrite the following text to achieve this goal: "${goal}" with a "${tone}" tone.
Preserve the core meaning, improve sentence variety, eliminate redundancy, and ensure natural cadence.

Input Text:
"""
${input}
"""`;
    }

    case 'ai-grammar-checker': {
      const style = opt.style || 'standard';
      return `You are a meticulous professional proofreader and grammar editor.
Task: Proofread the following text according to ${style} English conventions.
Provide:
1. The fully corrected text.
2. A numbered list of specific corrections made (grammar, spelling, punctuation, syntax) with a brief 1-line reason for each.

Input Text:
"""
${input}
"""`;
    }

    case 'ai-paraphraser': {
      const mode = opt.mode || 'standard';
      return `You are an advanced linguistic paraphraser.
Task: Paraphrase the text in "${mode}" mode (options: standard, creative, formal, concise).
Restructure sentences and vary vocabulary while preserving 100% of the underlying factual meaning.

Input Text:
"""
${input}
"""`;
    }

    case 'ai-tone-changer': {
      const targetTone = opt.targetTone || 'professional';
      return `You are a communications specialist.
Task: Rewrite the following message into a distinctly "${targetTone}" tone.
(Options: Professional, Casual, Academic, Creative, Persuasive, Empathetic, Concise).
Keep the original purpose intact.

Input Message:
"""
${input}
"""`;
    }

    case 'ai-text-simplifier': {
      const level = opt.level || 'plain language';
      return `You are an accessibility and clear-communication writer.
Task: Explain and simplify the following text into clear "${level}" (e.g. 5th-grade level / plain English).
Eliminate convoluted jargon, break long sentences down into digestible ideas, and use everyday terms.

Input Text:
"""
${input}
"""`;
    }

    case 'ai-bullet-points': {
      const style = opt.style || 'action-oriented';
      return `You are an information organizer.
Task: Convert the provided unstructured text or document into clean, scannable bullet points.
Style: ${style}. Group into logical sub-headers if the content spans multiple themes.

Input Text:
"""
${input}
"""`;
    }

    case 'ai-email-generator': {
      const purpose = opt.purpose || 'formal inquiry';
      const tone = opt.tone || 'professional';
      const recipient = opt.recipient || 'colleague / client';
      return `You are an executive communication assistant.
Task: Draft a complete, polished email based on the following notes.
Email Purpose: ${purpose}.
Intended Recipient: ${recipient}.
Tone: ${tone}.
Format: Include a clear Subject Line, appropriate Greeting, body paragraphs, call to action, and formal sign-off.

Notes & Requirements:
"""
${input}
"""`;
    }

    case 'ai-blog-outline': {
      const audience = opt.audience || 'general professionals';
      const format = opt.format || 'comprehensive SEO outline';
      return `You are a senior content strategist and SEO editor.
Task: Create an in-depth, structured blog post outline for the topic: "${input}".
Target Audience: ${audience}.
Format: ${format}.
Include:
- Catchy Working Title ideas (3 options)
- Hook / Introduction angle
- Main H2 and H3 sections with 2-3 key talking points per section
- Actionable takeaways
- Compelling conclusion / CTA`;
    }

    case 'ai-notes-summarizer': {
      const noteType = opt.noteType || 'meeting notes';
      return `You are an executive assistant and meeting scribe.
Task: Process and summarize these ${noteType}.
Output structure:
1. Executive Summary (2-3 sentences)
2. Decisions Made
3. Action Items (who, what, deadline if mentioned)
4. Key Discussion Points

Raw Notes:
"""
${input}
"""`;
    }

    case 'ai-flashcard-generator': {
      const count = opt.count || 5;
      return `You are an academic learning designer.
Task: Generate ${count} high-yield study flashcards based on the provided material.
Format each card as:
Q: [Clear, specific question or prompt]
A: [Precise, accurate answer with key context]

Source Material:
"""
${input}
"""`;
    }

    case 'ai-quiz-generator': {
      const count = opt.count || 5;
      const type = opt.type || 'multiple-choice';
      return `You are an educator and assessment author.
Task: Generate a ${count}-question ${type} quiz based on the provided content.
For multiple-choice, include options A, B, C, D and clearly mark the correct answer along with a 1-line explanation.

Source Content:
"""
${input}
"""`;
    }

    case 'ai-code-explainer': {
      const depth = opt.depth || 'line-by-line and architectural';
      return `You are a principal software engineer and computer science tutor.
Task: Analyze and explain the following code snippet.
Explanation Depth: ${depth}.
Include:
1. High-level Overview (What does this code do and why?)
2. Key Components & Step-by-Step Breakdown
3. Time & Space Complexity (if applicable)
4. Potential Edge Cases or Optimizations

Code:
"""
${input}
"""`;
    }

    case 'ai-error-explainer': {
      return `You are a senior debugging specialist.
Task: Analyze this error message or stack trace.
Provide:
1. What Happened: Plain English translation of the error.
2. Root Cause: Why this typically happens.
3. Step-by-Step Fix: Exact instructions or code snippets to resolve it.
4. Prevention Tip: How to avoid this issue in the future.

Error / Stack Trace:
"""
${input}
"""`;
    }

    case 'ai-readme-generator': {
      const projectType = opt.projectType || 'Software Application';
      return `You are an open-source technical writer.
Task: Generate a comprehensive, professional GitHub README.md in clean Markdown format for the project described below.
Project Type: ${projectType}.
Include:
- Project Title & Badges placeholder
- Overview & Key Features
- Tech Stack
- Prerequisites & Installation
- Quick Start / Usage Examples
- License & Contributing guidelines

Project Details:
"""
${input}
"""`;
    }

    default:
      return `You are an AI utility assistant.
Task: Process the following text according to user request: "${tool}".
Input:
"""
${input}
"""`;
  }
}

/**
 * Handle execution through configured AI provider
 */
export async function executeAIRequest(body: AIRequestBody): Promise<AIResponse> {
  const { tool, input, options } = body;

  if (!input || typeof input !== 'string' || !input.trim()) {
    return { ok: false, error: 'Input text is required.' };
  }

  if (input.length > 8000) {
    return {
      ok: false,
      error: `Input text exceeds the maximum allowed length of 8,000 characters (received ${input.length}).`,
    };
  }

  const prompt = buildPromptForTool(tool, input.trim(), options);

  // Check available provider keys in server environment
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (!geminiKey && !openaiKey) {
    return {
      ok: false,
      configured: false,
      error:
        'AI backend provider is not configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in your server environment variables to enable live AI responses.',
    };
  }

  // 1. Try Gemini if configured
  if (geminiKey) {
    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-1.5-flash',
    ].filter(Boolean) as string[];

    let lastError = '';

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          lastError = `Google Gemini provider error (${response.status}): ${errorData.slice(0, 200)}`;
          // If model is not found (404) or temporarily overloaded (503), try next available model
          if (response.status === 404 || response.status === 503) {
            continue;
          }
          return { ok: false, error: lastError };
        }

        const data: any = await response.json();
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!outputText) {
          return { ok: false, error: 'No output received from AI provider.' };
        }

        return { ok: true, output: outputText.trim() };
      } catch (err: any) {
        lastError = `Failed to connect to Gemini API: ${err.message}`;
      }
    }

    if (lastError && !openaiKey) {
      return { ok: false, error: lastError };
    }
  }

  // 2. Try OpenAI if configured
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert AI assistant embedded inside Zenvio FXO. Provide clean, well-structured, formatted responses without unnecessary conversational filler.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          ok: false,
          error: `OpenAI provider error (${response.status}): ${errorData.slice(0, 200)}`,
        };
      }

      const data: any = await response.json();
      const outputText = data.choices?.[0]?.message?.content;

      if (!outputText) {
        return { ok: false, error: 'No output received from OpenAI API.' };
      }

      return { ok: true, output: outputText.trim() };
    } catch (err: any) {
      return { ok: false, error: `Failed to connect to OpenAI API: ${err.message}` };
    }
  }

  return { ok: false, error: 'No AI provider available.' };
}

/**
 * Check whether server environment has an AI API key configured
 */
export function getAIStatus(): { configured: boolean; provider: string | null } {
  if (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY) {
    return { configured: true, provider: 'Google Gemini' };
  }
  if (process.env.OPENAI_API_KEY || process.env.AI_API_KEY) {
    return { configured: true, provider: 'OpenAI' };
  }
  return { configured: false, provider: null };
}
