
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, ExternalLink, Copy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import ClicksChart from "./charts/ClicksChart";
import CountryDistribution from "./charts/CountryDistribution";

// Mock data that would come from the API
const getMockData = (id: string) => ({
  id,
  originalUrl: "https://ejemplo-de-url-super-larga-que-necesitamos-acortar-para-compartir-facilmente.com/blog/articulo-1",
  shortCode: "abc123",
  createdAt: "2023-04-05T12:00:00Z",
  clicks: 324,
  recentVisits: [
    { 
      id: "v1", 
      timestamp: "2023-04-08T11:23:45Z", 
      country: "España",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    },
    { 
      id: "v2", 
      timestamp: "2023-04-08T10:15:22Z", 
      country: "México",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    { 
      id: "v3", 
      timestamp: "2023-04-08T09:45:11Z", 
      country: "Argentina",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"
    },
    { 
      id: "v4", 
      timestamp: "2023-04-08T08:32:05Z", 
      country: "Colombia",
      userAgent: "Mozilla/5.0 (Linux; Android 12; SM-G991B)"
    },
    { 
      id: "v5", 
      timestamp: "2023-04-08T07:22:15Z", 
      country: "Chile",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)"
    },
  ]
});

const AnalyticsDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);
  
  // In a real app, we would fetch the URL data with the id
  const urlData = getMockData(id || "1");
  const shortUrl = `${window.location.origin}/${urlData.shortCode}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success("¡URL copiada al portapapeles!");
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Format timestamp to readable date and time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Extract browser info from user agent
  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Desconocido";
  };

  // Get device type from user agent
  const getDeviceType = (userAgent: string) => {
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac OS")) return "Mac OS";
    return "Desconocido";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="mb-2"
          >
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Analítica para {urlData.shortCode}</h1>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
            asChild
          >
            <a 
              href={urlData.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Visitar URL original
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={copyToClipboard}
            className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copiar URL acortada
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total de Clics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-600">{urlData.clicks}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Fecha de Creación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {new Date(urlData.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">URL Corta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-brand-600">{shortUrl}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">País Principal</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand-500" />
            <p className="text-lg font-medium">España (42%)</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="visits">Visitas recientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClicksChart />
            <CountryDistribution />
          </div>
        </TabsContent>
        
        <TabsContent value="visits">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Visitas recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                      <th scope="col" className="px-6 py-3">País</th>
                      <th scope="col" className="px-6 py-3">Navegador</th>
                      <th scope="col" className="px-6 py-3">Dispositivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urlData.recentVisits.map((visit) => (
                      <tr key={visit.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {formatTimestamp(visit.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          {visit.country}
                        </td>
                        <td className="px-6 py-4">
                          {getBrowserInfo(visit.userAgent)}
                        </td>
                        <td className="px-6 py-4">
                          {getDeviceType(visit.userAgent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
