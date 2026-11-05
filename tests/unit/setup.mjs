import { afterEach, beforeEach, vi } from 'vitest';

// Unit tests must install their own response. Unexpected external calls fail closed.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Llamada de red no autorizada: usa un mock de fetch.')));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
