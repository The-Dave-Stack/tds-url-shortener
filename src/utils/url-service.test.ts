
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAnonymousQuota } from './url-service';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    count: vi.fn(),
    head: vi.fn(),
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

      (supabase.from().select().eq().single as any).mockResolvedValue(mockSettingsData);
      (supabase.from().select().eq as any).mockResolvedValue(mockCountData);

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
      (supabase.from().select().eq().single as any).mockRejectedValue(new Error('Database error'));

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
