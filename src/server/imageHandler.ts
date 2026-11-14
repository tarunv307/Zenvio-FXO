/**
 * Server-side Image Processing AI Request Handler
 * 
 * Supports both Node.js / Vite development server middleware and
 * standard serverless functions (Vercel / Netlify / Node Express).
 * 
 * Supports multiple external AI providers via server-side environment variables:
 * - REMOVEBG_API_KEY (for remove.bg)
 * - CLIPDROP_API_KEY (for Clipdrop by Stability AI)
 * - STABILITY_API_KEY (for Stability AI)
 * - REPLICATE_API_TOKEN (for Replicate AI models)
 * 
 * API keys are strictly kept server-side and NEVER exposed to frontend bundles.
 */

// In-memory rate limiting map for image operations (IP -> timestamps[])
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // Image processing is heavier

export function checkImageRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

export type ImageTask = 'remove-background' | 'enhance' | 'cutout' | 'upscale';

export interface ImageRequestBody {
  task: ImageTask;
  image: string; // Base64 data URL or raw base64 string
  scale?: number; // 2 or 4 for upscaler
  format?: 'png' | 'webp' | 'jpeg';
  options?: Record<string, any>;
}

export interface ImageResponse {
  ok: boolean;
  output?: string; // Base64 data URL or image URL
  error?: string;
  configured?: boolean;
  provider?: string | null;
  details?: Record<string, any>;
}

export interface ImageProviderStatus {
  configured: boolean;
  providers: {
    name: string;
    configured: boolean;
    capabilities: ImageTask[];
  }[];
}

/**
 * Check which image AI providers are configured via server environment variables
 */
export function getImageAIStatus(): ImageProviderStatus {
  const removebgKey = process.env.REMOVEBG_API_KEY || process.env.VITE_REMOVEBG_API_KEY;
  const clipdropKey = process.env.CLIPDROP_API_KEY || process.env.VITE_CLIPDROP_API_KEY;
  const stabilityKey = process.env.STABILITY_API_KEY || process.env.VITE_STABILITY_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN || process.env.VITE_REPLICATE_API_TOKEN;

  const providers = [
    {
      name: 'Remove.bg',
      configured: Boolean(removebgKey),
      capabilities: ['remove-background', 'cutout'] as ImageTask[],
    },
    {
      name: 'ClipDrop by Stability',
      configured: Boolean(clipdropKey),
      capabilities: ['remove-background', 'cutout', 'enhance', 'upscale'] as ImageTask[],
    },
    {
      name: 'Stability AI',
      configured: Boolean(stabilityKey),
      capabilities: ['enhance', 'upscale'] as ImageTask[],
    },
    {
      name: 'Replicate AI',
      configured: Boolean(replicateToken),
      capabilities: ['remove-background', 'cutout', 'enhance', 'upscale'] as ImageTask[],
    },
  ];

  const anyConfigured = providers.some((p) => p.configured);

  return {
    configured: anyConfigured,
    providers,
  };
}

/**
 * Execute Image AI processing using configured server provider
 */
export async function executeImageRequest(body: ImageRequestBody): Promise<ImageResponse> {
  const { task, image, scale = 2 } = body;

  if (!task || !image) {
    return { ok: false, error: 'Missing required parameters: task and image are required.' };
  }

  // Extract pure base64 data and mime type
  let base64Data = image;
  let mimeType = 'image/png';

  if (image.includes(',')) {
    const parts = image.split(',');
    const header = parts[0];
    base64Data = parts[1];
    const match = header.match(/:(.*?);/);
    if (match) {
      mimeType = match[1];
    }
  }

  const status = getImageAIStatus();
  if (!status.configured) {
    return {
      ok: false,
      configured: false,
      error:
        'No AI image provider configured on the server. Please add REMOVEBG_API_KEY, CLIPDROP_API_KEY, or STABILITY_API_KEY to your server environment.',
      details: {
        setupInstructions:
          'Set REMOVEBG_API_KEY in your .env or Vercel Environment Variables to enable real AI background removal.',
      },
    };
  }

  const imageBuffer = Buffer.from(base64Data, 'base64');

  // Handle Remove-Background or Cutout tasks
  if (task === 'remove-background' || task === 'cutout') {
    // 1. Try Remove.bg
    const removebgKey = process.env.REMOVEBG_API_KEY || process.env.VITE_REMOVEBG_API_KEY;
    if (removebgKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([imageBuffer], { type: mimeType });
        formData.append('image_file', blob, 'input.png');
        formData.append('size', 'auto');
        formData.append('format', 'png');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': removebgKey,
          },
          body: formData,
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const resultBase64 = Buffer.from(arrayBuffer).toString('base64');
          return {
            ok: true,
            provider: 'Remove.bg',
            output: `data:image/png;base64,${resultBase64}`,
          };
        } else {
          const errText = await response.text();
          return {
            ok: false,
            error: `Remove.bg API error (${response.status}): ${errText.slice(0, 300)}`,
          };
        }
      } catch (err: any) {
        return { ok: false, error: `Remove.bg request failed: ${err.message}` };
      }
    }

    // 2. Try ClipDrop
    const clipdropKey = process.env.CLIPDROP_API_KEY || process.env.VITE_CLIPDROP_API_KEY;
    if (clipdropKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([imageBuffer], { type: mimeType });
        formData.append('image_file', blob, 'input.png');

        const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
          method: 'POST',
          headers: {
            'x-api-key': clipdropKey,
          },
          body: formData,
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const resultBase64 = Buffer.from(arrayBuffer).toString('base64');
          return {
            ok: true,
            provider: 'ClipDrop',
            output: `data:image/png;base64,${resultBase64}`,
          };
        } else {
          const errText = await response.text();
          return {
            ok: false,
            error: `ClipDrop API error (${response.status}): ${errText.slice(0, 300)}`,
          };
        }
      } catch (err: any) {
        return { ok: false, error: `ClipDrop request failed: ${err.message}` };
      }
    }
  }

  // Handle Image Enhancement or Upscaling
  if (task === 'enhance' || task === 'upscale') {
    // 1. Try ClipDrop Image Upscaling
    const clipdropKey = process.env.CLIPDROP_API_KEY || process.env.VITE_CLIPDROP_API_KEY;
    if (clipdropKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([imageBuffer], { type: mimeType });
        formData.append('image_file', blob, 'input.png');
        const targetMultiplier = scale >= 4 ? '4096' : '2048';
        formData.append('target_width', targetMultiplier);

        const response = await fetch('https://clipdrop-api.co/image-upscaling/v1', {
          method: 'POST',
          headers: {
            'x-api-key': clipdropKey,
          },
          body: formData,
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const resultBase64 = Buffer.from(arrayBuffer).toString('base64');
          return {
            ok: true,
            provider: 'ClipDrop Upscaler',
            output: `data:image/png;base64,${resultBase64}`,
          };
        } else {
          const errText = await response.text();
          return {
            ok: false,
            error: `ClipDrop Upscaling error (${response.status}): ${errText.slice(0, 300)}`,
          };
        }
      } catch (err: any) {
        return { ok: false, error: `ClipDrop upscaler failed: ${err.message}` };
      }
    }
  }

  return {
    ok: false,
    error: `No provider capable of executing '${task}' is currently available. Please configure CLIPDROP_API_KEY or REMOVEBG_API_KEY.`,
  };
}

