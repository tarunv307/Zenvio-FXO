import { executeAIRequest, getAIStatus, checkRateLimit } from '../src/server/aiHandler.js';
import { extractBearerToken, verifyFirebaseIdToken } from '../src/server/authVerifier.js';

/**
 * Standard Serverless Function Handler (Node.js / Vercel / Netlify / Express)
 */
export default async function handler(req: any, res: any) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Optional Authentication Verification
  const bearerToken = extractBearerToken(req.headers['authorization']);
  let authenticatedUser = null;

  if (bearerToken) {
    const expectedProject = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const verification = await verifyFirebaseIdToken(bearerToken, expectedProject);
    if (!verification.valid) {
      return res.status(401).json({
        ok: false,
        error: `Authentication failed: ${verification.error}`,
      });
    }
    authenticatedUser = verification.user;
  }

  // Rate Limiting (Authenticated users keyed by UID, guests by IP)
  const clientIdentifier = authenticatedUser
    ? `user:${authenticatedUser.uid}`
    : req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

  if (!checkRateLimit(clientIdentifier)) {
    return res.status(429).json({
      ok: false,
      error: 'Rate limit exceeded. Maximum 20 requests per minute allowed.',
    });
  }

  // GET /api/ai/status
  if (req.method === 'GET') {
    const status = getAIStatus();
    return res.status(200).json(status);
  }

  // POST /api/ai
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const result = await executeAIRequest(body);

      if (!result.ok && result.configured === false) {
        return res.status(503).json(result);
      }

      if (!result.ok) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err.message || 'Internal server error.' });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed.' });
}
