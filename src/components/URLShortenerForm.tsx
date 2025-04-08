
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { isValidUrl } from "@/utils/validation";

const URLShortenerForm = () => {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidUrl(url)) {
      toast.error("Por favor ingresa una URL válida");
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const shortCode = customAlias || Math.random().toString(36).substring(2, 8);
      const shortUrl = `${window.location.origin}/${shortCode}`;
      
      setShortenedUrl(shortUrl);
      toast.success("¡URL acortada con éxito!");
      
      // In a real app, we would call the API here
      // const response = await createShortUrl(url, customAlias);
      // setShortenedUrl(response.shortUrl);
    } catch (error) {
      toast.error("Ocurrió un error al acortar la URL");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    toast.success("¡URL copiada al portapapeles!");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL a acortar
          </label>
          <Input
            id="url"
            type="url"
            placeholder="https://ejemplo.com/mi-pagina-con-url-muy-larga"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="customAlias" className="block text-sm font-medium text-gray-700 mb-1">
            Alias personalizado (opcional)
          </label>
          <Input
            id="customAlias"
            placeholder="mi-alias-personalizado"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            Deja en blanco para generar un código automáticamente
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-brand-500 hover:bg-brand-600"
          disabled={loading}
        >
          {loading ? "Acortando..." : "Acortar URL"}
        </Button>
      </form>
      
      {shortenedUrl && (
        <div className="mt-6 p-4 gradient-border">
          <p className="text-sm font-medium text-gray-700 mb-2">Tu URL acortada:</p>
          <div className="flex items-center gap-2">
            <Input
              value={shortenedUrl}
              readOnly
              className="font-medium bg-gray-50"
            />
            <Button 
              type="button" 
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default URLShortenerForm;
