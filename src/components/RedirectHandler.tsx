
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const RedirectHandler = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        navigate('/');
        return;
      }

      try {
        // Buscar la URL por su código corto
        const { data: url, error: urlError } = await supabase
          .from('urls')
          .select('id, original_url')
          .eq('short_code', shortCode)
          .single();

        if (urlError || !url) {
          throw new Error("URL no encontrada");
        }

        // Registrar la visita
        await supabase.from('analytics').insert([
          { 
            url_id: url.id,
            user_agent: navigator.userAgent,
            // Nota: no podemos obtener IP en el cliente, sería necesario un edge function
          }
        ]);

        // Incrementar contador de clics
        await supabase.rpc('increment_clicks', { url_id: url.id });

        // Redirigir al usuario
        window.location.href = url.original_url;
      } catch (error) {
        console.error("Error en redirección:", error);
        setError("La URL solicitada no existe o ha sido eliminada.");
        
        // Redirigir a página principal después de 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleRedirect();
  }, [shortCode, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace no encontrado</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-500">Redirigiendo a la página principal...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Redirigiendo...</p>
        </div>
      )}
    </div>
  );
};

export default RedirectHandler;
