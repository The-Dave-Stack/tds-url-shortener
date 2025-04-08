
import { useState } from "react";
import URLCard from "./URLCard";

// Mock data that would come from the backend API
const mockData = [
  {
    id: "1",
    originalUrl: "https://ejemplo-de-url-super-larga-que-necesitamos-acortar-para-compartir-facilmente.com/blog/articulo-1",
    shortCode: "abc123",
    createdAt: "2023-04-05T12:00:00Z",
    clicks: 145
  },
  {
    id: "2",
    originalUrl: "https://otra-url-demasiado-larga-para-compartir-en-redes-sociales.com/productos/categoria/subcategoria/producto",
    shortCode: "xyz789",
    createdAt: "2023-04-02T10:30:00Z",
    clicks: 87
  },
  {
    id: "3",
    originalUrl: "https://documentacion-tecnica-con-nombre-muy-extenso.org/manual/capitulo-5/seccion-3.html",
    shortCode: "def456",
    createdAt: "2023-04-01T09:15:00Z",
    clicks: 32
  }
];

const URLList = () => {
  const [urls] = useState(mockData);

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
