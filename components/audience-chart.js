"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

export function AudienceChart({ genderData, countryData }) {
  const { theme } = useTheme();

  const tickColor = theme === "dark" ? "white" : "black";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gender Distribution */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Gender Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, "Percentage"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))", // ✅ ensures text inside tooltip adapts
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))", // ✅ label text adapts too
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {genderData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground capitalize">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Country Distribution */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={countryData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                {/* Grid */}
                <CartesianGrid
                  strokeDasharray="1"
                  stroke="#5c5c5c"
                  vertical={false}
                />

                {/* X Axis */}
                <XAxis
                  dataKey="country"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: tickColor, // ✅ changes based on theme
                    fontSize: 12,
                  }}
                />

                {/* Y Axis */}
                <YAxis
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: tickColor, // ✅ changes based on theme
                    fontSize: 12,
                  }}
                />

                {/* Tooltip */}
                <Tooltip
                  formatter={(value) => [`${value}%`, "Percentage"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    marginLeft: "20px",
                    color: tickColor, // ✅ theme-aware
                  }}
                  itemStyle={{ color: tickColor }}
                  labelStyle={{ color: tickColor }}
                  cursor={false}
                />

                {/* Bars */}
                <Bar
                  dataKey="percentage"
                  fill="green"
                  radius={[6, 6, 0, 0]}
                  barSize={60}
                  activeBar={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
