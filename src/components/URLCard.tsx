
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
import { useTranslation } from "react-i18next";

/**
 * URLCard displays a shortened URL with its statistics and controls
 */
const URLCard = ({ id, originalUrl, shortCode, createdAt, clicks, customAlias }: UrlData) => {
  const [isCopied, setIsCopied] = useState(false);
  const baseUrl = window.location.origin;
  const shortUrl = `${baseUrl}/${customAlias || shortCode}`;
  const { t } = useTranslation();
  
  // Format the creation date as relative time
  const createdTimeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  /**
   * Copy the shortened URL to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      toast.success(t("common.copied"));
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error(t("common.error"));
    }
  };
  
  /**
   * Handle URL deletion
   */
  const handleDelete = async () => {
    try {
      await deleteUrl(id);
      toast.success(t("urls.urlDeleted"));
      
      // Force reload of the page to update the list
      window.location.reload();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  return (
    <Card className="bg-white dark:bg-petrol-blue border border-soft-gray dark:border-dark-blue-gray shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span className="truncate">{customAlias || shortCode}</span>
          <span className="text-xs bg-fog-gray dark:bg-night-blue text-petrol-blue dark:text-fog-gray rounded-full px-2 py-1">
            {clicks} {t("urls.clicks")}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="mb-2">
          <a 
            href={originalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-petrol-blue dark:text-fog-gray flex items-center hover:text-teal-deep dark:hover:text-mint-green truncate"
          >
            <span className="truncate">{originalUrl}</span>
            <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
          </a>
        </div>
        
        <div className="flex items-center justify-between text-xs text-petrol-blue/80 dark:text-fog-gray/80">
          <span>{t("urls.createdOn")} {createdTimeAgo}</span>
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
            {isCopied ? t("common.copied") : t("common.copy")}
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
            {t("common.stats")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default URLCard;
