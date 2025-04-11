
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Arreglar problema de iconos de Leaflet
// Esto es necesario porque Webpack/Vite maneja las rutas de assets de manera diferente
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define the type for country data
interface CountryData {
  name: string;
  value: number;
  color?: string;  // Make color optional since it's not always provided
}

interface CountryDistributionProps {
  data: CountryData[];
}

// Map de países a coordenadas
const countryCoordinates: Record<string, [number, number]> = {
  "España": [40.4168, -3.7038],
  "México": [23.6345, -102.5528],
  "Argentina": [-34.6037, -58.3816],
  "Colombia": [4.7110, -74.0721],
  "Chile": [-33.4489, -70.6693],
  "Estados Unidos": [37.7749, -122.4194],
  "Perú": [-12.0464, -77.0428],
  "Brasil": [-15.7801, -47.9292],
  "Venezuela": [10.4806, -66.9036],
  "Ecuador": [-0.1807, -78.4678],
  "Uruguay": [-34.9011, -56.1915],
  "Paraguay": [-25.2637, -57.5759],
  "Bolivia": [-16.4897, -68.1193],
  "Panamá": [8.9936, -79.5199],
  "Costa Rica": [9.9281, -84.0907],
  "República Dominicana": [18.4861, -69.9312],
  "Guatemala": [14.6349, -90.5069],
  "El Salvador": [13.6929, -89.2182],
  "Honduras": [14.0723, -87.1921],
  "Nicaragua": [12.1149, -86.2362],
  "Puerto Rico": [18.2208, -66.5901],
  "Cuba": [23.1136, -82.3666],
};

// Mock data for countries
const mockData: CountryData[] = [
  { name: "España", value: 135, color: "#00b6e1" },
  { name: "México", value: 87, color: "#33c5e7" },
  { name: "Argentina", value: 45, color: "#66d3ed" },
  { name: "Colombia", value: 32, color: "#99e2f3" },
  { name: "Chile", value: 28, color: "#ccf0f9" },
  { name: "Otros", value: 15, color: "#e6f8fc" }
];

// Generate colors for the chart
const generateColors = (count: number) => {
  const baseColor = "#00b6e1";
  const colors = [];
  
  for (let i = 0; i < count; i++) {
    const opacity = 1 - (i * 0.15);
    colors.push(`rgba(0, 182, 225, ${opacity > 0.2 ? opacity : 0.2})`);
  }
  
  return colors;
};

const CountryDistribution = ({ data }: CountryDistributionProps) => {
  const countryData = data && data.length > 0 ? data : mockData;
  const colors = generateColors(countryData.length);
  const [activeView, setActiveView] = useState<"chart" | "map">("chart");
  
  // Filtrar países que tienen coordenadas
  const countriesWithCoordinates = countryData.filter(country => 
    country.name !== "Otros" && countryCoordinates[country.name]
  );
  
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Distribución por país</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={(val) => setActiveView(val as "chart" | "map")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {countryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || colors[index % colors.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} visitas`, name]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="map">
            <div className="h-64 w-full">
              {countriesWithCoordinates.length > 0 ? (
                <MapContainer 
                  center={[20, 0]} 
                  zoom={2} 
                  scrollWheelZoom={false} 
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {countriesWithCoordinates.map((country) => (
                    countryCoordinates[country.name] && (
                      <Marker 
                        key={country.name}
                        position={countryCoordinates[country.name]}
                      >
                        <Popup>
                          <div className="font-medium">{country.name}</div>
                          <div>{country.value} visitas</div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No hay datos de países con coordenadas disponibles
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CountryDistribution;
