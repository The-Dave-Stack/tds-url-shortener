/**
 * RedirectHandler Component
 * Handles URL redirection based on short codes and logs analytics
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Base URL of the API (edge function)
const SUPABASE_URL = "https://zzzrllcoaqtszrskzxrg.supabase.co";

/**
 * RedirectHandler component
 * This component:
 * 1. Extracts the shortCode from the URL parameters
 * 2. Calls the redirection edge function
 * 3. Redirects the user to the original URL
 */
const RedirectHandler = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Processes the redirection
     * Calls the redirection edge function and redirects the user
     */
    const handleRedirect = async () => {
      if (!shortCode) {
        navigate('/');
        return;
      }

      try {
        // Calls the redirection edge function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/redirect/${shortCode}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error("URL not found");
        }

        const data = await response.json();
        
        // Redirect the user to the original URL
        window.location.href = data.originalUrl;
      } catch (error) {
        console.error("Redirection error:", error);
        setError("The requested URL does not exist or has been deleted.");
        
        // Redirect to the homepage after a delay
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
          <h1 className="text-2xl font-bold mb-2">Link not found</h1>
          <p className="text-petrol-blue/80 dark:text-fog-gray/80 mb-4">{error}</p>
          <p className="text-petrol-blue/60 dark:text-fog-gray/60">Redirecting to the homepage...</p>
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
