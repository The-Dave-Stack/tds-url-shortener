
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import URLShortenerForm from './URLShortenerForm';
import { createShortUrl, checkAnonymousQuota } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

// Mock the modules and hooks
vi.mock('@/utils/api', () => ({
  createShortUrl: vi.fn(),
  checkAnonymousQuota: vi.fn(),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('URLShortenerForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://short.url' },
      writable: true
    });

    // Default mocks
    (useAuth as any).mockReturnValue({ user: null });
    (checkAnonymousQuota as any).mockResolvedValue({ used: 10, limit: 50, remaining: 40 });
    (createShortUrl as any).mockResolvedValue({ 
      shortCode: 'abc123', 
      originalUrl: 'https://example.com'
    });
  });

  it('renders the form correctly for anonymous users', async () => {
    render(<URLShortenerForm />);
    
    // Check that the form fields are rendered
    await waitFor(() => {
      expect(screen.getByText(/Shorten Your URL/i)).toBeTruthy();
      expect(screen.getByLabelText(/URL to shorten/i)).toBeTruthy();
      expect(screen.getByLabelText(/Custom alias/i)).toBeTruthy();
      
      // Check that quota information is displayed for anonymous users
      expect(screen.getByText(/Daily anonymous limit/i)).toBeTruthy();
    });
  });

  // More test cases would be added here
});
