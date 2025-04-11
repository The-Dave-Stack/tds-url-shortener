
/**
 * RedirectHandler Component
 * Maneja la redirección de URL basada en códigos cortos y registra analíticas
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// URL base de la API (edge function)
const SUPABASE_URL = "https://zzzrllcoaqtszrskzxrg.supabase.co";

/**
 * RedirectHandler component
 * Este componente:
 * 1. Extrae el shortCode de los parámetros URL
 * 2. Llama a la edge function de redirección
 * 3. Redirige al usuario a la URL original
 */
const RedirectHandler = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Procesa la redirección
     * Llama a la edge function de redirección y redirige al usuario
     */
    const handleRedirect = async () => {
      if (!shortCode) {
        navigate('/');
        return;
      }

      try {
        // Llamar a la edge function de redirección
        const response = await fetch(`${SUPABASE_URL}/functions/v1/redirect/${shortCode}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error("URL no encontrada");
        }

        const data = await response.json();
        
        // Redirigir al usuario a la URL original
        window.location.href = data.originalUrl;
      } catch (error) {
        console.error("Error de redirección:", error);
        setError("La URL solicitada no existe o ha sido eliminada.");
        
        // Redirigir a la página de inicio después de un retraso
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
          <h1 className="text-2xl font-bold mb-2">Enlace no encontrado</h1>
          <p className="text-petrol-blue/80 dark:text-fog-gray/80 mb-4">{error}</p>
          <p className="text-petrol-blue/60 dark:text-fog-gray/60">Redirigiendo a la página de inicio...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-deep mx-auto mb-4" />
          <p className="text-lg">Redirigiendo...</p>
        </div>
      )}
    </div>
  );
};

export default RedirectHandler;
