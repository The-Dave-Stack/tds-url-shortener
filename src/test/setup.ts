
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Extended matchers are now properly imported
expect.extend({});

// Clean up after each test
afterEach(() => {
  cleanup();
});
