
/**
 * RedirectHandler Component
 * Handles URL redirection based on short codes and records analytics
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * RedirectHandler component
 * This component:
 * 1. Extracts shortCode from URL params
 * 2. Looks up the original URL in the database
 * 3. Records analytics for the click
 * 4. Redirects user to the original URL
 */
const RedirectHandler = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Process the redirect
     * Looks up URL by short code and redirects user
     */
    const handleRedirect = async () => {
      if (!shortCode) {
        navigate('/');
        return;
      }

      try {
        // Find URL by short code
        const { data: url, error: urlError } = await supabase
          .from('urls')
          .select('id, original_url')
          .eq('short_code', shortCode)
          .single();

        if (urlError || !url) {
          throw new Error("URL not found");
        }

        // Record analytics for this visit
        await supabase.from('analytics').insert([
          { 
            url_id: url.id,
            user_agent: navigator.userAgent,
            // Note: IP cannot be obtained on client, would need an edge function
          }
        ]);

        // Increment click counter
        await supabase.rpc('increment_clicks', { url_id: url.id });

        // Redirect user to the original URL
        window.location.href = url.original_url;
      } catch (error) {
        console.error("Redirect error:", error);
        setError("The requested URL does not exist or has been removed.");
        
        // Redirect to home page after delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleRedirect();
  }, [shortCode, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-fog-gray dark:bg-night-blue text-petrol-blue dark:text-fog-gray">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
          <p className="text-petrol-blue/80 dark:text-fog-gray/80 mb-4">{error}</p>
          <p className="text-petrol-blue/60 dark:text-fog-gray/60">Redirecting to home page...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-deep mx-auto mb-4" />
          <p className="text-lg">Redirecting...</p>
        </div>
      )}
    </div>
  );
};

export default RedirectHandler;
