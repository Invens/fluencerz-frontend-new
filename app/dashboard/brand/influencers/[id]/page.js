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
  Loader2,
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

  console.log(influencer);

  const socialPlatforms = parseJsonSafely(influencer.social_platforms, []);
  const audienceGender = parseJsonSafely(influencer.audience_gender, {});
  const followersByCountry = parseJsonSafely(
    influencer.followers_by_country,
    []
  );

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

  return (
    <BrandLayout>
      <div className="min-h-screen bg-background">
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage
                    src={influencer.profile_image || "/placeholder.svg"}
                    alt={influencer.full_name}
                  />
                  <AvatarFallback className="text-2xl font-bold">
                    {influencer.full_name}
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

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
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

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Joined</span>
                        <span className="font-medium">
                          {new Date(influencer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Updated
                        </span>
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="audience" className="space-y-6">
              <AudienceChart
                genderData={genderData}
                countryData={countryData}
              />
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Email
                          </div>
                          <div className="font-medium">{influencer.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Phone
                          </div>
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
                          <div className="font-medium text-primary hover:underline">
                            <a
                              href={influencer.skype}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Profile
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Portfolio & Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                      {influencer.portfolio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </BrandLayout>
  );
}
