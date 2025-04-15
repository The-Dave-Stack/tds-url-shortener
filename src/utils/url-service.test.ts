
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAnonymousQuota } from './url-service';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          count: vi.fn(),
          head: vi.fn(),
        })),
      })),
    })),
  },
}));

describe('URL Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkAnonymousQuota', () => {
    it('should return correct quota information', async () => {
      // Mock the app_settings query
      const mockSettingsData = {
        data: {
          value: { limit: 50 }
        },
        error: null
      };
      
      // Mock the anonymous_urls count query
      const mockCountData = {
        count: 10,
        error: null
      };

      // Set up proper chaining for mocks
      const mockSingle = vi.fn().mockResolvedValue(mockSettingsData);
      const mockEqForSettings = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelectForSettings = vi.fn().mockReturnValue({ eq: mockEqForSettings });
      
      const mockHead = vi.fn().mockResolvedValue(mockCountData);
      const mockEqForCount = vi.fn().mockReturnValue({ head: mockHead });
      const mockSelectForCount = vi.fn().mockReturnValue({ eq: mockEqForCount });
      
      // First call for settings
      (supabase.from as any).mockImplementationOnce(() => ({
        select: mockSelectForSettings
      }));
      
      // Second call for count
      (supabase.from as any).mockImplementationOnce(() => ({
        select: mockSelectForCount
      }));

      const result = await checkAnonymousQuota();
      
      expect(result).toEqual({
        used: 10,
        limit: 50,
        remaining: 40
      });
      
      // Verify supabase was called correctly
      expect(supabase.from).toHaveBeenCalledWith('app_settings');
      expect(supabase.from).toHaveBeenCalledWith('anonymous_urls');
    });

    it('should handle errors gracefully', async () => {
      // Mock an error in the query
      const mockSingle = vi.fn().mockRejectedValue(new Error('Database error'));
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      (supabase.from as any).mockImplementation(() => ({
        select: mockSelect
      }));

      const result = await checkAnonymousQuota();
      
      // Should return default values when an error occurs
      expect(result).toEqual({
        used: 0,
        limit: 50,
        remaining: 50
      });
    });
  });
});
