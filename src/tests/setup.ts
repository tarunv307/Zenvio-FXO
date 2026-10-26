import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock crypto.randomUUID if not present
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () => '12345678-1234-4234-8234-123456789abc',
      getRandomValues: (arr: any) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
      subtle: {
        digest: async (_algo: string, data: BufferSource) => {
          const buffer = new Uint8Array(32);
          for (let i = 0; i < buffer.length; i++) buffer[i] = i + 1;
          return buffer.buffer;
        },
      },
    },
  });
}
