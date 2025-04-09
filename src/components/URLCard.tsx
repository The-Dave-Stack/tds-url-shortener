
/**
 * URLCard Component
 * Displays individual shortened URL info with copy functionality and analytics link
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Copy, ExternalLink, Trash } from "lucide-react";
import { deleteUrl, UrlData } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";

/**
 * URLCard displays a shortened URL with its statistics and controls
 */
const URLCard = ({ id, original_url, short_code, created_at, clicks, custom_alias }: UrlData) => {
  const [isCopied, setIsCopied] = useState(false);
  const baseUrl = window.location.origin;
  const shortUrl = `${baseUrl}/${custom_alias || short_code}`;
  
  // Format the creation date as relative time
  const createdTimeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true });
  
  /**
   * Copy the shortened URL to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      toast.success("URL copied to clipboard");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };
  
  /**
   * Handle URL deletion
   */
  const handleDelete = async () => {
    try {
      await deleteUrl(id);
      toast.success("URL deleted successfully");
      
      // Force reload of the page to update the list
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete URL");
    }
  };

  return (
    <Card className="bg-white dark:bg-petrol-blue border border-soft-gray dark:border-dark-blue-gray shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="truncate">{custom_alias || short_code}</span>
          <span className="text-xs bg-fog-gray dark:bg-night-blue text-petrol-blue dark:text-fog-gray rounded-full px-2 py-1">
            {clicks} clicks
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="mb-2">
          <a 
            href={original_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-petrol-blue dark:text-fog-gray flex items-center hover:text-teal-deep dark:hover:text-mint-green truncate"
          >
            <span className="truncate">{original_url}</span>
            <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
          </a>
        </div>
        
        <div className="flex items-center justify-between text-xs text-petrol-blue/80 dark:text-fog-gray/80">
          <span>Created {createdTimeAgo}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={copyToClipboard}
            className="text-xs border-teal-deep text-teal-deep hover:bg-mint-green/10 hover:text-mint-green hover:border-mint-green"
          >
            <Copy className={`h-3 w-3 mr-1 ${isCopied ? "text-mint-green" : ""}`} />
            {isCopied ? "Copied" : "Copy"}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            className="text-xs border-alert-red text-alert-red hover:bg-alert-red/10"
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
        
        <Button 
          size="sm" 
          asChild
          className="text-xs bg-teal-deep hover:bg-mint-green text-white"
        >
          <Link to={`/dashboard/${id}`}>
            <BarChart className="h-3 w-3 mr-1" />
            Stats
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default URLCard;
