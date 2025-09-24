"use client";
import { useEffect, useState } from "react";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function BrandDashboard() {
  const [stats, setStats] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/brand/dashboard/insights", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data.data);
      } catch (err) {
        console.error("❌ Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, []);

  if (!stats) {
    return (
      <BrandLayout>
        <p className="text-center text-gray-500 py-20">Loading dashboard...</p>
      </BrandLayout>
    );
  }

  return (
    <BrandLayout>
      <div className="max-w-7xl mx-auto py-10 px-4 space-y-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">📊 Brand Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Campaigns" value={stats.totalCampaigns} />
          <StatCard label="Active Campaigns" value={stats.activeCampaigns} />
          <StatCard label="Closed Campaigns" value={stats.closedCampaigns} />
          <StatCard label="Deliverables" value={stats.deliverables} />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Reach" value={stats.reach} />
          <StatCard label="Impressions" value={stats.impressions} />
          <StatCard label="Views" value={stats.views} />
          <StatCard label="Likes" value={stats.likes} />
          <StatCard label="Comments" value={stats.comments} />
          <StatCard
            label="Engagements"
            value={stats.likes + stats.comments + stats.saves + stats.shares}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Reach Bar Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">📈 Reach by Campaign</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.campaigns}>
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reach" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Split Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">❤️ Engagement Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Likes", value: stats.likes },
                    { name: "Comments", value: stats.comments },
                    { name: "Saves", value: stats.saves },
                    { name: "Shares", value: stats.shares },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                  dataKey="value"
                >
                  {["#6366F1", "#F59E0B", "#10B981", "#EF4444"].map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </BrandLayout>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value?.toLocaleString?.() ?? 0}
      </p>
    </div>
  );
}
