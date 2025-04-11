
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://zzzrllcoaqtszrskzxrg.supabase.co";

// Tipos exportados desde el archivo original api.ts
export type { UrlData, UrlAnalytics, Visit } from '@/utils/api';

/**
 * Función auxiliar para las llamadas API a nuestras Edge Functions
 */
const callEdgeFunction = async <T>(
  functionName: string, 
  options: {
    method?: string;
    path?: string;
    body?: any;
  } = {}
): Promise<T> => {
  const { method = 'GET', path = '', body = null } = options;
  
  // Obtener el token de autenticación del usuario actual
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Usuario no autenticado');
  }
  
  // Construir la URL completa
  const url = `${SUPABASE_URL}/functions/v1/${functionName}${path ? `/${path}` : ''}`;
  
  // Configurar opciones de la solicitud
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    }
  };
  
  // Agregar cuerpo a la solicitud si es necesario
  if (body && (method === 'POST' || method === 'PUT')) {
    requestOptions.body = JSON.stringify(body);
  }
  
  // Realizar la solicitud
  const response = await fetch(url, requestOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error en la solicitud: ${response.status}`);
  }
  
  // Para métodos como DELETE que pueden devolver 204 No Content
  if (response.status === 204) {
    return null as T;
  }
  
  return response.json();
};

/**
 * Crear una URL corta
 */
export const createShortUrl = async (
  originalUrl: string,
  customAlias?: string
) => {
  return callEdgeFunction('urls', {
    method: 'POST',
    body: { originalUrl, customAlias }
  });
};

/**
 * Obtener todas las URLs del usuario
 */
export const getUserUrls = async () => {
  return callEdgeFunction('urls');
};

/**
 * Eliminar una URL por ID
 */
export const deleteUrl = async (id: string): Promise<void> => {
  await callEdgeFunction('urls', {
    method: 'DELETE',
    path: id
  });
};

/**
 * Obtener análisis para una URL específica
 */
export const getUrlAnalytics = async (id: string) => {
  return callEdgeFunction('analytics', {
    path: id
  });
};
