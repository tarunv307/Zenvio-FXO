export interface AIClientOptions {
  tool: string;
  input: string;
  options?: Record<string, any>;
  signal?: AbortSignal;
}

export interface AIClientResult {
  ok: boolean;
  output?: string;
  error?: string;
  configured?: boolean;
}

/**
 * Execute an AI request through the secure server-side endpoint (/api/ai)
 */
export async function requestAI({
  tool,
  input,
  options = {},
  signal,
}: AIClientOptions): Promise<AIClientResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: 'Please provide some input text to process.' };
  }

  if (trimmed.length > 8000) {
    return {
      ok: false,
      error: `Input is too long (${trimmed.length} characters). Maximum length is 8,000 characters.`,
    };
  }

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool,
        input: trimmed,
        options,
      }),
      signal,
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 429) {
      return {
        ok: false,
        error: data.error || 'Rate limit exceeded. Please wait a moment before trying again.',
      };
    }

    if (res.status === 503 || data.configured === false) {
      return {
        ok: false,
        configured: false,
        error:
          data.error ||
          'AI provider is not configured. Add OPENAI_API_KEY or GEMINI_API_KEY in your server environment variables.',
      };
    }

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || `AI processing failed with status ${res.status}.`,
      };
    }

    return {
      ok: true,
      output: data.output,
      configured: true,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { ok: false, error: 'Request was cancelled.' };
    }
    return {
      ok: false,
      error: `Network error connecting to AI service: ${err.message || 'Please check your connection.'}`,
    };
  }
}

/**
 * Fetch server AI provider configuration status
 */
export async function checkAIBackendStatus(): Promise<{ configured: boolean; provider: string | null }> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) return { configured: false, provider: null };
    const data = await res.json();
    return { configured: !!data.configured, provider: data.provider || null };
  } catch {
    return { configured: false, provider: null };
  }
}
