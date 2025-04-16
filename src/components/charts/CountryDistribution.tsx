import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
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
  // We don't use mock data anymore - we always use the data provided from props
  const countryData = data && data.length > 0 ? data : [];
  const colors = generateColors(countryData.length);
  const [activeView, setActiveView] = useState<"chart" | "map">("chart");
  
  // Filtrar países que tienen coordenadas
  const countriesWithCoordinates = countryData.filter(country => 
    country.name !== "Otros" && countryCoordinates[country.name]
  );
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-6 pb-2">
        <h4 className="text-sm font-medium">Country Distribution</h4>
      </div>
      <div className="flex-1">
        <Tabs value={activeView} onValueChange={(val) => setActiveView(val as "chart" | "map")} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>
          
          <div className="flex-1">
            <TabsContent value="chart" className="h-full m-0 p-0">
              {countryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={countryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
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
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No country data available
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="map" className="h-full m-0 p-0">
              <div className="h-full w-full">
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
                    No countries with coordinates available
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CountryDistribution;
