
import { useState, useEffect } from "react";
import { toast } from "sonner";
import URLCard from "./URLCard";
import { getUserUrls, UrlData } from "@/utils/api";
import { Loader2 } from "lucide-react";

const URLList = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const userUrls = await getUserUrls();
        setUrls(userUrls);
      } catch (error) {
        console.error("Error obteniendo URLs:", error);
        toast.error("No se pudieron cargar tus URLs acortadas");
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Mis URLs acortadas</h2>
      
      {urls.length === 0 ? (
        <div className="text-center py-10 border rounded bg-gray-50">
          <p className="text-gray-500">No tienes URLs acortadas aún</p>
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
