
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// Mock data for the chart
const generateLastWeekData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      clicks: Math.floor(Math.random() * 50) + 1, // Random number between 1-50
    });
  }
  
  return data;
};

const generateLastMonthData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      clicks: Math.floor(Math.random() * 50) + 1, // Random number between 1-50
    });
  }
  
  return data;
};

const dataMap = {
  "7d": generateLastWeekData(),
  "30d": generateLastMonthData()
};

const ClicksChart = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            Clics a lo largo del tiempo
          </CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataMap[timeRange]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
      </CardContent>
    </Card>
  );
};

export default ClicksChart;
