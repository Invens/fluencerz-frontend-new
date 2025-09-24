"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Eye,
  Mail,
  Phone,
  Calendar,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
} from "lucide-react";
import {
  formatNumber,
  formatPercentage,
  parseJsonSafely,
} from "@/lib/formatters";
import api from "@/utils/api";
import { PlatformBadge } from "@/components/platform-badge";
import { MetricCard } from "@/components/metric-card";
import { AudienceChart } from "@/components/audience-chart";
import BrandLayout from "@/components/BrandLayout";

export default function InfluencerDetailPage() {
  const { id } = useParams();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get(`/brand/influencers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInfluencer(res.data.data);
      } catch (err) {
        console.error("Error fetching influencer:", err);
        setError("Failed to load influencer data");
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencer();
  }, [id]);

  if (loading) {
    return (
      <BrandLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-primary" />
        </div>
      </BrandLayout>
    );
  }

  if (error || !influencer) {
    return notFound();
  }

  // Parse influencer fields
  const socialPlatforms = parseJsonSafely(influencer.social_platforms, []);
  const audienceGender = parseJsonSafely(influencer.audience_gender, {});
  const followersByCountry = parseJsonSafely(influencer.followers_by_country, []);

  const genderData = [
    {
      name: "male",
      value: Number.parseInt(audienceGender.male || "0"),
      color: "#3b82f6",
    },
    {
      name: "female",
      value: Number.parseInt(audienceGender.female || "0"),
      color: "#ec4899",
    },
    {
      name: "other",
      value: Number.parseInt(audienceGender.other || "0"),
      color: "#8b5cf6",
    },
  ].filter((item) => item.value > 0);

  const countryData = followersByCountry.map((item) => ({
    country: item.country,
    percentage: Number.parseInt(item.percentage),
  }));

  // Instagram account & insights
  const instagramAccount = influencer.instagramAccount || null;
  const mediaInsights = instagramAccount
    ? JSON.parse(instagramAccount.media_with_insights || "[]")
    : [];
  const insights1d = instagramAccount
    ? JSON.parse(instagramAccount.insights_1d || "{}")
    : {};
  const insights30d = instagramAccount
    ? JSON.parse(instagramAccount.insights_30d || "{}")
    : {};

  return (
    <BrandLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage
                    src={
                      influencer.profile_image
                        ? `https://api.fluencerz.com${influencer.profile_image}`
                        : "/placeholder.svg"
                    }
                    alt={influencer.full_name}
                  />

                  <AvatarFallback className="text-2xl font-bold">
                    {influencer.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {influencer.full_name}
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <Badge variant="secondary" className="font-medium">
                      {influencer.niche}
                    </Badge>
                    <Badge
                      variant={
                        influencer.availability === "available"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        influencer.availability === "available"
                          ? "bg-green-600"
                          : ""
                      }
                    >
                      {influencer.availability}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {socialPlatforms.map((platform, index) => (
                      <PlatformBadge
                        key={index}
                        platform={platform.platform}
                        followers={platform.followers}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Followers"
              value={formatNumber(influencer.followers_count)}
              subtitle="Across all platforms"
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              title="Engagement Rate"
              value={formatPercentage(influencer.engagement_rate)}
              subtitle="Average engagement"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <MetricCard
              title="Total Reach"
              value={formatNumber(influencer.total_reach)}
              subtitle="Monthly reach"
              icon={<Eye className="h-5 w-5" />}
            />
            <MetricCard
              title="Age Group"
              value={influencer.audience_age_group}
              subtitle="Primary audience"
              icon={<Users className="h-5 w-5" />}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Platform Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {socialPlatforms.map((platform, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {platform.platform === "Instagram" && (
                            <Instagram className="h-5 w-5 text-pink-500" />
                          )}
                          {platform.platform === "Facebook" && (
                            <Facebook className="h-5 w-5 text-blue-600" />
                          )}
                          {platform.platform === "Twitter" && (
                            <Twitter className="h-5 w-5 text-sky-500" />
                          )}
                          <span className="font-medium">
                            {platform.platform}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {formatNumber(Number(platform.followers))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            followers
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined</span>
                      <span className="font-medium">
                        {new Date(influencer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">
                        {new Date(influencer.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={
                          influencer.availability === "available"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          influencer.availability === "available"
                            ? "bg-green-600"
                            : ""
                        }
                      >
                        {influencer.availability}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Audience */}
            <TabsContent value="audience">
              <AudienceChart genderData={genderData} countryData={countryData} />
            </TabsContent>

            {/* Contact */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{influencer.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">{influencer.phone}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          LinkedIn/Skype
                        </div>
                        <a
                          href={influencer.skype}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Portfolio */}
            <TabsContent value="portfolio">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio & Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                    {influencer.portfolio || "No portfolio provided."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Instagram */}
            <TabsContent value="instagram" className="space-y-6">
              {!instagramAccount ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    This creator has not connected their Instagram account.
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Account Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Instagram Account</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p><strong>Username:</strong> @{instagramAccount.username}</p>
                        <p><strong>Followers:</strong> {formatNumber(instagramAccount.followers_count)}</p>
                        <p><strong>Engagement Rate:</strong> {formatPercentage(instagramAccount.total_engagements)}</p>
                      </div>
                      <div>
                        <p><strong>Avg Likes:</strong> {formatNumber(instagramAccount.avg_likes)}</p>
                        <p><strong>Avg Comments:</strong> {formatNumber(instagramAccount.avg_comments)}</p>
                        <p><strong>Avg Reach:</strong> {formatNumber(instagramAccount.avg_reach)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 1 Day Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>1 Day Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {["impressions", "reach", "profile_views"].map((metric) => (
                        <div key={metric} className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground capitalize">{metric}</p>
                          <p className="font-bold">{formatNumber(insights1d[metric] || 0)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* 30 Day Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>30 Day Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {["impressions", "reach", "profile_views"].map((metric) => (
                        <div key={metric} className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground capitalize">{metric}</p>
                          <p className="font-bold">{formatNumber(insights30d[metric] || 0)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Media Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Media Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mediaInsights.length === 0 ? (
                        <p className="text-muted-foreground">No media insights available.</p>
                      ) : (
                        mediaInsights.map((media, idx) => {
                          const getMetric = (name) =>
                            media.insights?.data?.find((d) => d.name === name)?.values?.[0]?.value || 0;

                          const reach = getMetric("reach");
                          const likes = getMetric("likes");
                          const comments = getMetric("comments");
                          const shares = getMetric("shares");
                          const saves = getMetric("saved");
                          const views = getMetric("views");

                          const engagementRate = instagramAccount.followers_count
                            ? ((likes + comments + shares + saves) / instagramAccount.followers_count) * 100
                            : 0;

                          return (
                            <div key={idx} className="rounded-lg border bg-card overflow-hidden shadow">
                              {media.media_type === "IMAGE" && (
                                <img src={media.media_url} alt={media.caption} className="w-full h-48 object-cover" />
                              )}
                              {media.media_type === "VIDEO" && (
                                <video controls className="w-full h-48 object-cover">
                                  <source src={media.media_url} type="video/mp4" />
                                </video>
                              )}
                              {media.media_type === "CAROUSEL_ALBUM" && (
                                <img src={media.media_url} alt={media.caption} className="w-full h-48 object-cover" />
                              )}

                              <div className="p-4 space-y-2">
                                <a
                                  href={media.permalink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-primary hover:underline"
                                >
                                  View on Instagram
                                </a>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {media.caption || "No caption"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(media.timestamp).toLocaleDateString()}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <span>Reach: {reach}</span>
                                  <span>Likes: {likes}</span>
                                  <span>Comments: {comments}</span>
                                  <span>Shares: {shares}</span>
                                  <span>Saves: {saves}</span>
                                  <span>Views: {views}</span>
                                  <span className="col-span-2 font-medium text-primary">
                                    Engagement Rate: {engagementRate.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </BrandLayout>
  );
}
