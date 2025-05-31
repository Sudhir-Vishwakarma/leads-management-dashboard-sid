import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { ChartData } from "../../types";

const BAR_COLORS = [
  "#0F52BA",
  "#4CAF50",
  "#FF9800",
  "#E91E63",
  "#9C27B0",
  "#03A9F4",
  "#FF5722",
];

interface AnalyticsChartsProps {
  statusData: ChartData[];
  platformData: ChartData[];
  leadsByDay: ChartData[];
  locationData: ChartData[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  statusData,
  platformData,
  leadsByDay,
  locationData,
}) => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Lead Status Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statusData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  borderColor: "#e5e7eb",
                }}
                formatter={(value) => [`${value} leads`, "Count"]}
              />
              <Legend />
              <Bar dataKey="value" name="Leads">
                {statusData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Lead Source Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  borderColor: "#e5e7eb",
                }}
                formatter={(value) => [`${value} leads`, "Count"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leads by Day */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Leads Over Time
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={leadsByDay}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  borderColor: "#e5e7eb",
                }}
                formatter={(value) => [`${value} leads`, "Count"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0F52BA"
                activeDot={{ r: 8 }}
                name="Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Leads by Location
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={locationData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  borderColor: "#e5e7eb",
                }}
                formatter={(value) => [`${value} leads`, "Count"]}
              />
              <Legend />
              <Bar dataKey="value" fill="#20B2AA" name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
