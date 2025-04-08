
import Layout from "@/components/Layout";
import URLShortenerForm from "@/components/URLShortenerForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Link as LinkIcon } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-brand-100 rounded-full flex items-center justify-center">
              <LinkIcon className="h-8 w-8 text-brand-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ShortLink <span className="text-brand-500">Insight</span> Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Acorta tus URLs y obtén análisis detallados de su rendimiento. 
            Descubre quién, cuándo y desde dónde acceden a tus enlaces.
          </p>
        </div>
        
        <div className="mb-16">
          <URLShortenerForm />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center mb-4">
              <LinkIcon className="h-6 w-6 text-brand-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Enlaces acortados</h3>
            <p className="text-gray-600 mb-4">
              Convierte URLs largas en enlaces cortos y fáciles de compartir en cualquier plataforma.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-brand-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Analítica detallada</h3>
            <p className="text-gray-600 mb-4">
              Accede a estadísticas en tiempo real sobre quién visita tus enlaces y desde dónde.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">URLs personalizadas</h3>
            <p className="text-gray-600 mb-4">
              Crea enlaces personalizados y memorables para tu marca o campañas.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">¿Listo para gestionar tus enlaces acortados?</p>
          <Button 
            asChild
            className="bg-brand-500 hover:bg-brand-600"
            size="lg"
          >
            <Link to="/dashboard">
              <BarChart className="h-5 w-5 mr-2" />
              Ir al Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
