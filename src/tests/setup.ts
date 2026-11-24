import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill Blob.prototype.arrayBuffer in JSDOM if missing
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

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
