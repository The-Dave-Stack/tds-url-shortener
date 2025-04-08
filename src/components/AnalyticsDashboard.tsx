import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUrlAnalytics, UrlAnalytics } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, BarChart3, Loader2 } from "lucide-react";

const AnalyticsDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<UrlAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      try {
        const data = await getUrlAnalytics(id);
        setAnalytics(data);
      } catch (error) {
        console.error("Error obteniendo analíticas:", error);
        toast.error("No se pudieron cargar las estadísticas de esta URL");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const shortUrl = `${window.location.origin}/${analytics.shortCode}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Analíticas de URL</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Información de la URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">URL Original:</p>
              <a 
                href={analytics.originalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-brand-600 flex items-center gap-1 truncate hover:underline"
              >
                {analytics.originalUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">URL Acortada:</p>
              <a 
                href={shortUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-brand-600 flex items-center gap-1 hover:underline"
              >
                {shortUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de Creación:</p>
              <p className="text-sm">
                {new Date(analytics.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Clics:</p>
              <p className="text-sm font-bold text-brand-600">{analytics.clicks}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-500" />
              Clics por día
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.dailyClicks.length > 0 ? (
              <div className="h-64">
                {/* Aquí iría un componente de gráfico para mostrar los clics diarios */}
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(analytics.dailyClicks, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No hay datos suficientes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Distribución por país</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.countries.length > 0 ? (
              <div className="h-64">
                {/* Aquí iría un componente de gráfico para mostrar la distribución por países */}
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(analytics.countries, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No hay datos suficientes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {analytics.recentVisits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Visitas recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Fecha</th>
                    <th className="py-2 px-4 text-left">País</th>
                    <th className="py-2 px-4 text-left">Navegador</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentVisits.map((visit) => {
                    // Extraer información básica del navegador del user agent
                    const browserInfo = visit.userAgent.split(' ')[0];
                    
                    return (
                      <tr key={visit.id} className="border-b">
                        <td className="py-2 px-4">
                          {new Date(visit.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 px-4">{visit.country}</td>
                        <td className="py-2 px-4">{browserInfo}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
