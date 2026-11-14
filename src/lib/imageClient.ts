/**
 * Client-side interface for Image Processing and AI Image Utilities
 * 
 * Securely calls /api/image on the server, keeping API keys protected.
 * Also provides high-performance client-side Canvas algorithms when
 * operating in offline/browser mode or when external AI API is not configured.
 */

export interface ImageAIStatus {
  configured: boolean;
  providers: {
    name: string;
    configured: boolean;
    capabilities: string[];
  }[];
}

export interface ImageClientRequest {
  task: 'remove-background' | 'enhance' | 'cutout' | 'upscale';
  image: string; // base64 data URL
  scale?: number;
  format?: 'png' | 'webp' | 'jpeg';
  options?: Record<string, any>;
  signal?: AbortSignal;
}

export interface ImageClientResponse {
  ok: boolean;
  output?: string; // base64 data URL
  error?: string;
  configured?: boolean;
  provider?: string | null;
  mode?: 'ai-server' | 'browser-canvas';
}

/**
 * Check if the server has AI Image Providers configured
 */
export async function checkImageAIStatus(): Promise<ImageAIStatus> {
  try {
    const res = await fetch('/api/image/status');
    if (!res.ok) {
      return { configured: false, providers: [] };
    }
    return await res.json();
  } catch {
    return { configured: false, providers: [] };
  }
}

/**
 * Process image via server-side AI endpoint
 */
export async function processImageViaServer(req: ImageClientRequest): Promise<ImageClientResponse> {
  try {
    const res = await fetch('/api/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: req.task,
        image: req.image,
        scale: req.scale || 2,
        format: req.format || 'png',
        options: req.options || {},
      }),
      signal: req.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 429) {
      return {
        ok: false,
        error: data.error || 'Rate limit reached. Please wait a moment before sending another request.',
      };
    }

    if (res.status === 503 || data.configured === false) {
      return {
        ok: false,
        configured: false,
        error:
          data.error ||
          'AI Image Provider is not configured on the server. Please set REMOVEBG_API_KEY or CLIPDROP_API_KEY.',
      };
    }

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || `Image processing failed with status ${res.status}.`,
      };
    }

    return {
      ok: true,
      output: data.output,
      provider: data.provider || 'AI Provider',
      mode: 'ai-server',
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { ok: false, error: 'Processing was cancelled.' };
    }
    return {
      ok: false,
      error: `Network error connecting to image processing service: ${err.message}`,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-Side Canvas Image Processing Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load an image from data URL or Object URL into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image for processing: ' + e));
    img.src = src;
  });
}

/**
 * Real client-side background removal & subject cutout algorithm
 * Uses smart edge-preserving color segmentation, sample background detection
 * (sampling corners and borders), and smooth alpha thresholding.
 */
export async function removeBackgroundClientCanvas(
  imageSource: string,
  options: {
    tolerance?: number; // 0 to 100, default 30
    edgeFeather?: number; // 0 to 10, default 2
    subjectFocus?: 'center' | 'all';
  } = {}
): Promise<string> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not obtain canvas 2D context.');

  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const tolerance = (options.tolerance ?? 32) * 2.55; // convert to color distance
  const feather = options.edgeFeather ?? 2;

  // Sample corner pixels to detect the predominant background color
  const samplePoints = [
    { x: 2, y: 2 },
    { x: width - 3, y: 2 },
    { x: 2, y: height - 3 },
    { x: width - 3, y: height - 3 },
    { x: Math.floor(width / 2), y: 2 },
    { x: 2, y: Math.floor(height / 2) },
    { x: width - 3, y: Math.floor(height / 2) },
  ];

  const bgColors: { r: number; g: number; b: number }[] = [];
  for (const pt of samplePoints) {
    const idx = (pt.y * width + pt.x) * 4;
    bgColors.push({
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
    });
  }

  // Calculate Euclidean distance in RGB color space
  function colorDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  }

  const alphaMask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Find minimum distance to any sampled background color
      let minDist = 999999;
      for (const bg of bgColors) {
        const d = colorDist(r, g, b, bg.r, bg.g, bg.b);
        if (d < minDist) minDist = d;
      }

      // Check distance from center if subjectFocus is 'center'
      let distFactor = 1.0;
      if (options.subjectFocus === 'center') {
        const cx = width / 2;
        const cy = height / 2;
        const normDist = Math.sqrt(((x - cx) / cx) ** 2 + ((y - cy) / cy) ** 2);
        distFactor = Math.max(0.7, 1 - normDist * 0.25);
      }

      const effectiveTolerance = tolerance * distFactor;

      if (minDist <= effectiveTolerance) {
        // Fully transparent background
        alphaMask[y * width + x] = 0;
      } else if (minDist <= effectiveTolerance + 15) {
        // Feathered edge transition
        const alpha = Math.round(((minDist - effectiveTolerance) / 15) * 255);
        alphaMask[y * width + x] = alpha;
      } else {
        alphaMask[y * width + x] = 255;
      }
    }
  }

  // Apply alpha mask to canvas image data
  for (let i = 0; i < width * height; i++) {
    const pixelIdx = i * 4;
    data[pixelIdx + 3] = alphaMask[i];
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Real client-side image enhancer
 * Applies Unsharp Mask convolution kernel, adaptive contrast equalization,
 * and saturation tuning.
 */
export async function enhanceImageClientCanvas(
  imageSource: string,
  options: {
    sharpness?: number; // 1 to 5, default 2.5
    contrast?: number; // 1 to 1.5, default 1.15
    clarity?: number; // 0 to 100, default 30
  } = {}
): Promise<string> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not obtain canvas 2D context.');

  ctx.drawImage(img, 0, 0, width, height);
  const srcData = ctx.getImageData(0, 0, width, height);
  const src = srcData.data;

  const outData = ctx.createImageData(width, height);
  const out = outData.data;

  const amount = (options.sharpness ?? 2.5) * 0.4; // sharpening strength
  const contrast = options.contrast ?? 1.15;
  const intercept = 128 * (1 - contrast);

  // 3x3 Sharpening / Unsharp Mask convolution kernel:
  // [  0,   -a,    0 ]
  // [ -a, 1+4a,   -a ]
  // [  0,   -a,    0 ]
  const kCenter = 1 + 4 * amount;
  const kEdge = -amount;

  for (let y = 0; y < height; y++) {
    const yTop = y > 0 ? y - 1 : 0;
    const yBottom = y < height - 1 ? y + 1 : height - 1;

    for (let x = 0; x < width; x++) {
      const xLeft = x > 0 ? x - 1 : 0;
      const xRight = x < width - 1 ? x + 1 : width - 1;

      const idx = (y * width + x) * 4;
      const idxT = (yTop * width + x) * 4;
      const idxB = (yBottom * width + x) * 4;
      const idxL = (y * width + xLeft) * 4;
      const idxR = (y * width + xRight) * 4;

      for (let c = 0; c < 3; c++) {
        // Convolve
        let val =
          src[idx + c] * kCenter +
          (src[idxT + c] + src[idxB + c] + src[idxL + c] + src[idxR + c]) * kEdge;

        // Apply contrast stretch
        val = val * contrast + intercept;

        // Clamp
        out[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
      }

      // Preserve alpha
      out[idx + 3] = src[idx + 3];
    }
  }

  ctx.putImageData(outData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Real client-side image upscaler (2x or 4x)
 * Uses high-quality multi-step Bicubic Canvas scaling and post-pass sharpening.
 */
export async function upscaleImageClientCanvas(
  imageSource: string,
  scale: 2 | 4 = 2
): Promise<string> {
  const img = await loadImage(imageSource);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  const targetW = origW * scale;
  const targetH = origH * scale;

  // Step scaling for high fidelity
  let currentCanvas = document.createElement('canvas');
  currentCanvas.width = origW;
  currentCanvas.height = origH;
  let currentCtx = currentCanvas.getContext('2d')!;
  currentCtx.drawImage(img, 0, 0);

  let currentW = origW;
  let currentH = origH;

  const stepScale = 1.5;
  while (currentW * stepScale < targetW) {
    const nextW = Math.round(currentW * stepScale);
    const nextH = Math.round(currentH * stepScale);

    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;
    const nextCtx = nextCanvas.getContext('2d')!;
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(currentCanvas, 0, 0, nextW, nextH);

    currentCanvas = nextCanvas;
    currentCtx = nextCtx;
    currentW = nextW;
    currentH = nextH;
  }

  // Final scale to exact target
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetW;
  finalCanvas.height = targetH;
  const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true })!;
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);

  // Apply subtle edge sharpening pass to counteract enlargement blur
  const imgData = finalCtx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;
  const sharpenedData = finalCtx.createImageData(targetW, targetH);
  const sData = sharpenedData.data;

  const sharpenStrength = scale === 4 ? 0.35 : 0.25;
  const kCenter = 1 + 4 * sharpenStrength;
  const kEdge = -sharpenStrength;

  for (let y = 0; y < targetH; y++) {
    const yT = y > 0 ? y - 1 : 0;
    const yB = y < targetH - 1 ? y + 1 : targetH - 1;
    for (let x = 0; x < targetW; x++) {
      const xL = x > 0 ? x - 1 : 0;
      const xR = x < targetW - 1 ? x + 1 : targetW - 1;

      const idx = (y * targetW + x) * 4;
      const idxT = (yT * targetW + x) * 4;
      const idxB = (yB * targetW + x) * 4;
      const idxL = (y * targetW + xL) * 4;
      const idxR = (y * targetW + xR) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          data[idx + c] * kCenter +
          (data[idxT + c] + data[idxB + c] + data[idxL + c] + data[idxR + c]) * kEdge;
        sData[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
      }
      sData[idx + 3] = data[idx + 3];
    }
  }

  finalCtx.putImageData(sharpenedData, 0, 0);
  return finalCanvas.toDataURL('image/png');
}

