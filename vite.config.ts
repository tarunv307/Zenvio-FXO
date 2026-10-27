import { defineConfig, type Plugin } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function aiDevServerPlugin(): Plugin {
  return {
    name: 'ai-dev-server-middleware',
    configureServer(server) {
      const env = loadEnv(server.config.mode || 'development', process.cwd(), '');
      for (const [key, value] of Object.entries(env)) {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }

      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const pathname = rawUrl.split('?')[0];

        if (pathname === '/api/ai/status' && req.method === 'GET') {
          const { getAIStatus } = await import('./src/server/aiHandler');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(getAIStatus()));
          return;
        }

        if (pathname === '/api/ai' && req.method === 'POST') {
          const { executeAIRequest, checkRateLimit } = await import('./src/server/aiHandler');
          const clientIp = req.socket?.remoteAddress || '127.0.0.1';

          if (!checkRateLimit(clientIp)) {
            res.statusCode = 429;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: false,
                error: 'Rate limit exceeded. Maximum 20 requests per minute allowed.',
              })
            );
            return;
          }

          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const result = await executeAIRequest(body);
              res.statusCode =
                !result.ok && result.configured === false ? 503 : result.ok ? 200 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err.message || 'Internal server error.' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), aiDevServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          pdfLib: ['pdf-lib'],
          lucide: ['lucide-react'],
          qrcode: ['qrcode'],
        },
      },
    },
  },
});
