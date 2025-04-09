
/**
 * URLList Component
 * Displays a list of user's shortened URLs
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import URLCard from "./URLCard";
import { getUserUrls, UrlData } from "@/utils/api";
import { Loader2 } from "lucide-react";

/**
 * URLList component shows all shortened URLs created by the user
 * with loading and empty states
 */
const URLList = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user's URLs on component mount
   */
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const userUrls = await getUserUrls();
        setUrls(userUrls);
      } catch (error) {
        console.error("Error fetching URLs:", error);
        toast.error("Could not load your shortened URLs");
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-deep" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-petrol-blue dark:text-fog-gray">My Shortened URLs</h2>
      
      {urls.length === 0 ? (
        <div className="text-center py-10 border rounded border-soft-gray dark:border-dark-blue-gray bg-fog-gray dark:bg-night-blue">
          <p className="text-petrol-blue/70 dark:text-fog-gray/70">You don't have any shortened URLs yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {urls.map(url => (
            <URLCard key={url.id} {...url} />
          ))}
        </div>
      )}
    </div>
  );
};

export default URLList;
