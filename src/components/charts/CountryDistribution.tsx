
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// Mock data for countries
const data = [
  { name: "España", value: 135, color: "#00b6e1" },
  { name: "México", value: 87, color: "#33c5e7" },
  { name: "Argentina", value: 45, color: "#66d3ed" },
  { name: "Colombia", value: 32, color: "#99e2f3" },
  { name: "Chile", value: 28, color: "#ccf0f9" },
  { name: "Otros", value: 15, color: "#e6f8fc" }
];

const CountryDistribution = () => {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Distribución por país</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CountryDistribution;
