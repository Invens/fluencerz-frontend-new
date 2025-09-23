"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Target,
  Download,
  Calendar,
  Eye,
  Heart,
  Share2,
  Star,
} from "lucide-react";
import BrandLayout from "@/components/BrandLayout";
import { useTheme } from "next-themes";

// Dummy data for the dashboard
const performanceData = {
  activeCampaigns: 12,
  completedCampaigns: 45,
  pendingCampaigns: 8,
  totalSpend: 125000,
  totalInteractions: 2400000,
  overallEngagementRate: 4.2,
  reachGrowth: 15.3,
  spendGrowth: -8.2,
};

const campaignTrendData = [
  { month: "Jan", spend: 18000, reach: 450000, engagement: 3.8 },
  { month: "Feb", spend: 22000, reach: 520000, engagement: 4.1 },
  { month: "Mar", spend: 19000, reach: 480000, engagement: 3.9 },
  { month: "Apr", spend: 25000, reach: 580000, engagement: 4.3 },
  { month: "May", spend: 21000, reach: 510000, engagement: 4.0 },
  { month: "Jun", spend: 23000, reach: 550000, engagement: 4.2 },
];

const engagementData = [
  { platform: "Instagram", likes: 45000, comments: 8500, shares: 3200 },
  { platform: "TikTok", likes: 62000, comments: 12000, shares: 5800 },
  { platform: "YouTube", likes: 28000, comments: 4200, shares: 1900 },
  { platform: "Twitter", likes: 15000, comments: 2800, shares: 4100 },
];

const topInfluencers = [
  {
    id: 1,
    name: "Sarah Johnson",
    platform: "Instagram",
    followers: "2.4M",
    engagement: 5.8,
    campaigns: 8,
    revenue: 45000,
    avatar: "/woman-influencer.png",
  },
  {
    id: 2,
    name: "Mike Chen",
    platform: "TikTok",
    followers: "1.8M",
    engagement: 7.2,
    campaigns: 6,
    revenue: 38000,
    avatar: "/man-influencer.png",
  },
  {
    id: 3,
    name: "Emma Davis",
    platform: "YouTube",
    followers: "950K",
    engagement: 4.9,
    campaigns: 5,
    revenue: 32000,
    avatar: "/woman-creator.png",
  },
  {
    id: 4,
    name: "Alex Rodriguez",
    platform: "Instagram",
    followers: "1.2M",
    engagement: 6.1,
    campaigns: 7,
    revenue: 41000,
    avatar: "/man-creator.jpg",
  },
];

const platformDistribution = [
  { name: "Instagram", value: 45, color: "#E1306C" },
  { name: "TikTok", value: 30, color: "#40453b" },
  { name: "YouTube", value: 20, color: "#FF0000" },
  { name: "Twitter", value: 5, color: "#1DA1F2" },
];

export default function BrandDashboard() {
  const [timeRange, setTimeRange] = useState("6months");
  const { theme } = useTheme();

  const exportToCSV = () => {
    // Combine all data for export
    const exportData = {
      performance: performanceData,
      campaigns: campaignTrendData,
      engagement: engagementData,
      topInfluencers: topInfluencers,
      platformDistribution: platformDistribution,
    };

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Dashboard Export - " +
      new Date().toLocaleDateString() +
      "\n\n" +
      "Performance Metrics:\n" +
      "Active Campaigns," +
      performanceData.activeCampaigns +
      "\n" +
      "Completed Campaigns," +
      performanceData.completedCampaigns +
      "\n" +
      "Pending Campaigns," +
      performanceData.pendingCampaigns +
      "\n" +
      "Total Spend,$" +
      performanceData.totalSpend.toLocaleString() +
      "\n" +
      "Total Interactions," +
      performanceData.totalInteractions.toLocaleString() +
      "\n" +
      "Overall Engagement Rate," +
      performanceData.overallEngagementRate +
      "%\n\n" +
      "Top Influencers:\n" +
      "Name,Platform,Followers,Engagement Rate,Campaigns,Revenue\n" +
      topInfluencers
        .map(
          (inf) =>
            `${inf.name},${inf.platform},${inf.followers},${inf.engagement}%,${
              inf.campaigns
            },$${inf.revenue.toLocaleString()}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `brand-dashboard-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BrandLayout>
      <div className="min-h-screen bg-background  space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Brand Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Quick snapshot of performance across campaigns and creators
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={exportToCSV} className="gap-2 bg-secondary">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
          <StatCard
            title="Total Spend"
            value={`$${performanceData.totalSpend.toLocaleString()}`}
            Icon={DollarSign}
            iconContainerClass="bg-blue-500/10 text-blue-500"
            change={{
              value: performanceData.spendGrowth,
              period: "vs last month",
            }}
          />

          <StatCard
            title="Interactions"
            value={`${(performanceData.totalInteractions / 1000000).toFixed(
              1
            )}M`}
            Icon={Eye}
            iconContainerClass="bg-purple-500/10 text-purple-500"
            change={{
              value: performanceData.reachGrowth,
              period: "vs last month",
            }}
          />

          <StatCard
            title="Engagement Rate"
            value={`${performanceData.overallEngagementRate}%`}
            Icon={Heart}
            iconContainerClass="bg-pink-500/10 text-pink-500"
          />
          <StatCard
            title="Active Campaigns"
            value={performanceData.activeCampaigns}
            Icon={Activity}
            iconContainerClass="bg-primary/10 text-primary"
          />

          <StatCard
            title="Completed"
            value={performanceData.completedCampaigns}
            Icon={Target}
            iconContainerClass="bg-green-500/10 text-green-500"
          />

          <StatCard
            title="Pending"
            value={performanceData.pendingCampaigns}
            Icon={Users}
            iconContainerClass="bg-yellow-500/10 text-yellow-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Performance Trend */}
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Campaign Performance Trend
              </CardTitle>
              <CardDescription>
                Spend and reach over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={campaignTrendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis stroke={`${theme == "dark" ? "white" : "black"}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="green"
                    strokeWidth={2}
                    name="Spend ($)"
                  />
                  <Line
                    type="monotone"
                    dataKey="reach"
                    stroke="blue"
                    strokeWidth={2}
                    name="Reach"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Platform Distribution
              </CardTitle>
              <CardDescription>
                Campaign distribution across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Analytics */}
        {/* <Card className="chart-container">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Engagement Analytics by Platform
            </CardTitle>
            <CardDescription>
              Likes, comments, and shares across different platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={engagementData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="platform"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="likes" fill="hsl(var(--chart-1))" name="Likes" />
                <Bar
                  dataKey="comments"
                  fill="hsl(var(--chart-2))"
                  name="Comments"
                />
                <Bar
                  dataKey="shares"
                  fill="hsl(var(--chart-3))"
                  name="Shares"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}

        {/* Top Influencers */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Performing Influencers
            </CardTitle>
            <CardDescription>
              Your highest performing creators this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topInfluencers.map((influencer, index) => (
                <div
                  key={influencer.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <img
                        src={influencer.avatar || "/placeholder.svg"}
                        alt={influencer.name}
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {influencer.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{influencer.platform}</span>
                        <span>{influencer.followers} followers</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-foreground">
                        {influencer.engagement}%
                      </p>
                      <p className="text-muted-foreground">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">
                        {influencer.campaigns}
                      </p>
                      <p className="text-muted-foreground">Campaigns</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">
                        ${influencer.revenue.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </BrandLayout>
  );
}

const StatCard = ({ title, value, Icon, iconContainerClass, change }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {/* Conditionally render the growth indicator if change data is provided */}
            {change && (
              <GrowthIndicator value={change.value} period={change.period} />
            )}
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconContainerClass}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GrowthIndicator = ({ value, period = "vs last month" }) => {
  const isPositive = value >= 0;
  const colorClass = isPositive ? "text-green-500" : "text-red-500";
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-1 mt-1">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <p className={`text-sm font-medium ${colorClass}`}>
        {Math.abs(value)}%
        <span className="text-xs text-muted-foreground ml-1">{period}</span>
      </p>
    </div>
  );
};
