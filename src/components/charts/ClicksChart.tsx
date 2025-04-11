
import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface ClicksChartProps {
  data: { date: string; clicks: number; }[];
}

const ClicksChart = ({ data }: ClicksChartProps) => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  
  // Filter data based on selected time range
  const filteredData = () => {
    if (!data || data.length === 0) {
      return [];
    }

    const today = new Date();
    const dateLimit = new Date();
    
    if (timeRange === "7d") {
      dateLimit.setDate(today.getDate() - 7);
    } else {
      dateLimit.setDate(today.getDate() - 30);
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= dateLimit && itemDate <= today;
    });
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-6 pb-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">
            Clics a lo largo del tiempo
          </h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1 text-xs rounded-full ${
                timeRange === "7d" 
                ? "bg-brand-100 text-brand-800 font-medium" 
                : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              7 días
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1 text-xs rounded-full ${
                timeRange === "30d" 
                ? "bg-brand-100 text-brand-800 font-medium" 
                : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              30 días
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData()} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value}
            />
            <Tooltip 
              formatter={(value) => [`${value} clics`, 'Clics']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString();
              }}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e5e7eb'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="#00b6e1" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "#00b6e1", stroke: "white", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClicksChart;
