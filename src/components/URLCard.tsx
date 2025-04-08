
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, ExternalLink, BarChart3 } from "lucide-react";

interface URLCardProps {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
}

const URLCard = ({ id, originalUrl, shortCode, createdAt, clicks }: URLCardProps) => {
  const [copied, setCopied] = useState(false);
  const shortUrl = `${window.location.origin}/${shortCode}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success("¡URL copiada al portapapeles!");
    
    setTimeout(() => setCopied(false), 2000);
  };

  // Truncate long URLs
  const truncatedOriginalUrl = originalUrl.length > 50 
    ? `${originalUrl.substring(0, 50)}...` 
    : originalUrl;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">
            {shortCode}
          </CardTitle>
          <span className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">URL Original:</p>
            <a 
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:text-brand-600 flex items-center gap-1 truncate"
            >
              {truncatedOriginalUrl}
              <ExternalLink className="h-3 w-3 inline flex-shrink-0" />
            </a>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">URL Acortada:</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-brand-600 truncate">
                {shortUrl}
              </span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Estadísticas:</p>
            <p className="text-sm">
              <span className="font-medium text-gray-900">{clicks}</span> clics totales
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-xs text-gray-600 hover:text-brand-600"
          asChild
        >
          <Link to={`/dashboard/${id}`}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Ver Analítica
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default URLCard;
