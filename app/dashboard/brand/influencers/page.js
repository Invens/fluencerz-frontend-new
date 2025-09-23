"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Eye,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const API_BASE_URL = "https://api.fluencerz.com";

// Safe JSON parser
function parseJSON(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Parse audience gender data
function parseGender(value) {
  try {
    return JSON.parse(value);
  } catch {
    return { male: "0", female: "0", other: "0" };
  }
}

// Parse followers by country
function parseCountries(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Format number with K/M suffix
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num?.toString() || "0";
}

// Avatar with fallback on error
function Avatar({ name, image, size = "w-16 h-16" }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative">
      {image && !imgError ? (
        <img
          src={`${API_BASE_URL}${image}`}
          alt={name}
          onError={() => setImgError(true)}
          className={`${size} rounded-full object-cover border-2 border-border shadow-sm transition-transform duration-300 hover:scale-105`}
        />
      ) : (
        <div
          className={`${size} rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold text-lg border-2 border-border shadow-sm`}
        >
          {name?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
}

// Platform icon component
function PlatformIcon({ platform }) {
  const icons = {
    Instagram: <Instagram className="h-5 w-5 text-pink-500" />,
    Facebook: <Facebook className="h-5 w-5 text-blue-600" />,
    Twitter: <Twitter className="h-5 w-5 text-sky-500" />,
    YouTube: <Youtube className="h-5 w-5 text-red-500" />,
    TikTok: "🎵",
    LinkedIn: "💼",
    Snapchat: "👻",
  };
  return <span className="text-sm">{icons[platform] || "🌐"}</span>;
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [maxFollowers, setMaxFollowers] = useState("");
  const [minEngagement, setMinEngagement] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [availability, setAvailability] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Fetch list of influencers
        const listRes = await api.get("/brand/influencers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const influencersList = listRes.data || [];

        // 2. Fetch details for each influencer by id
        const details = await Promise.all(
          influencersList.map(async (inf) => {
            try {
              const res = await api.get(`/brand/influencers/${inf.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return res.data.data;
            } catch (err) {
              console.error(`❌ Error fetching influencer ${inf.id}:`, err);
              return null;
            }
          })
        );

        setInfluencers(details.filter(Boolean));
      } catch (err) {
        console.error("❌ Error fetching influencers list:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) load();
  }, [token]);

  // Extract filter options from data
  const filterOptions = useMemo(() => {
    const niches = [
      ...new Set(influencers.map((inf) => inf.niche).filter(Boolean)),
    ];
    const platforms = [
      ...new Set(
        influencers.flatMap((inf) =>
          parseJSON(inf.social_platforms).map((sp) => sp.platform)
        )
      ),
    ].filter(Boolean);
    const countries = [
      ...new Set(
        influencers.flatMap((inf) =>
          parseCountries(inf.followers_by_country).map((c) => c.country)
        )
      ),
    ].filter(Boolean);
    const ageGroups = [
      ...new Set(
        influencers.map((inf) => inf.audience_age_group).filter(Boolean)
      ),
    ];

    return { niches, platforms, countries, ageGroups };
  }, [influencers]);

  // Filter influencers based on all criteria
  const filteredInfluencers = useMemo(() => {
    return influencers.filter((inf) => {
      // Search query filter
      if (
        searchQuery &&
        !inf.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !inf.niche?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Niche filter
      if (selectedNiche && inf.niche !== selectedNiche) return false;

      // Platform filter
      if (selectedPlatform) {
        const platforms = parseJSON(inf.social_platforms).map(
          (sp) => sp.platform
        );
        if (!platforms.includes(selectedPlatform)) return false;
      }

      // Country filter
      if (selectedCountry) {
        const countries = parseCountries(inf.followers_by_country).map(
          (c) => c.country
        );
        if (!countries.includes(selectedCountry)) return false;
      }

      // Follower count filters
      if (minFollowers && inf.followers_count < Number.parseInt(minFollowers))
        return false;
      if (maxFollowers && inf.followers_count > Number.parseInt(maxFollowers))
        return false;

      // Engagement rate filter
      if (
        minEngagement &&
        inf.engagement_rate < Number.parseFloat(minEngagement)
      )
        return false;

      // Age group filter
      if (selectedAge && inf.audience_age_group !== selectedAge) return false;

      // Availability filter
      if (availability && inf.availability !== availability) return false;

      // Gender filter (dominant gender)
      if (selectedGender) {
        const genderData = parseGender(inf.audience_gender);
        const dominantGender = Object.entries(genderData).reduce((a, b) =>
          Number.parseInt(genderData[a[0]] || 0) >
          Number.parseInt(genderData[b[0]] || 0)
            ? a
            : b
        )[0];
        if (dominantGender !== selectedGender) return false;
      }

      return true;
    });
  }, [
    influencers,
    searchQuery,
    selectedNiche,
    selectedPlatform,
    selectedCountry,
    minFollowers,
    maxFollowers,
    minEngagement,
    selectedAge,
    availability,
    selectedGender,
  ]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedNiche("");
    setSelectedPlatform("");
    setSelectedCountry("");
    setMinFollowers("");
    setMaxFollowers("");
    setMinEngagement("");
    setSelectedAge("");
    setAvailability("");
    setSelectedGender("");
  };

  if (loading) {
    return (
      <BrandLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-primary" />
        </div>
      </BrandLayout>
    );
  }

  return (
    <BrandLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-balance">
            Influencers Directory
          </h1>
          <Badge variant="secondary" className="text-sm">
            {filteredInfluencers.length} influencer
            {filteredInfluencers.length !== 1 ? "s" : ""} found
          </Badge>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-80 flex-shrink-0">
              <Card className="">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Filter Influencers</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or niche..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Niche Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Niche
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring transition"
                      value={selectedNiche}
                      onChange={(e) => setSelectedNiche(e.target.value)}
                    >
                      <option value="">All Niches</option>
                      {filterOptions.niches.map((niche) => (
                        <option key={niche} value={niche}>
                          {niche}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Platform Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Platform
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring transition"
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                    >
                      <option value="">All Platforms</option>
                      {filterOptions.platforms.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Follower Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Follower Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minFollowers}
                        onChange={(e) => setMinFollowers(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxFollowers}
                        onChange={(e) => setMaxFollowers(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Min Engagement Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 2.5"
                      value={minEngagement}
                      onChange={(e) => setMinEngagement(e.target.value)}
                    />
                  </div>

                  {/* Country Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Primary Country
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring transition"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                      <option value="">All Countries</option>
                      {filterOptions.countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Age Group Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Audience Age
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring transition"
                      value={selectedAge}
                      onChange={(e) => setSelectedAge(e.target.value)}
                    >
                      <option value="">All Ages</option>
                      {filterOptions.ageGroups.map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Availability Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Availability
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring transition"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full bg-transparent"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {filteredInfluencers.length === 0 ? (
                <Card className="text-center py-16">
                  <CardContent>
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No influencers found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters to find more results.
                    </p>
                    <Button variant="outline" onClick={clearAllFilters}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredInfluencers.map((inf) => {
                    const socialPlatforms = parseJSON(inf.social_platforms);
                    const genderData = parseGender(inf.audience_gender);
                    const countries = parseCountries(inf.followers_by_country);
                    const totalFollowers = socialPlatforms.reduce(
                      (sum, sp) => sum + Number.parseInt(sp.followers || 0),
                      0
                    );

                    return (
                      <motion.div
                        key={inf.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                          <CardHeader className="pb-4">
                            <div className="flex items-start gap-4">
                              <Avatar
                                name={inf.full_name}
                                image={inf.profile_image}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg text-foreground truncate">
                                  {inf.full_name}
                                </h3>
                                <Badge variant="secondary" className="mt-1">
                                  {inf.niche || "General"}
                                </Badge>
                                <div className="flex items-center gap-2 mt-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      inf.availability === "available"
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                    }`}
                                  />
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {inf.availability || "Unknown"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="flex-1 space-y-4">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-black/10 rounded-lg p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Users className="h-4 w-4 text-primary" />
                                  <span className="text-xs text-muted-foreground">
                                    Followers
                                  </span>
                                </div>
                                <p className="font-bold text-foreground">
                                  {formatNumber(inf.followers_count)}
                                </p>
                              </div>
                              <div className="bg-black/10 rounded-lg p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <TrendingUp className="h-4 w-4 text-primary" />
                                  <span className="text-xs text-muted-foreground">
                                    Engagement
                                  </span>
                                </div>
                                <p className="font-bold text-foreground">
                                  {inf.engagement_rate?.toFixed(1) || "0"}%
                                </p>
                              </div>
                            </div>

                            {/* Social Platforms */}
                            {socialPlatforms.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  Platforms
                                </h4>
                                <div className="space-y-2">
                                  {socialPlatforms
                                    .slice(0, 3)
                                    .map((sp, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          <PlatformIcon
                                            platform={sp.platform}
                                          />
                                          <span className="text-foreground">
                                            {sp.platform}
                                          </span>
                                        </div>
                                        <span className="text-muted-foreground font-medium">
                                          {formatNumber(
                                            Number.parseInt(sp.followers)
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                  {socialPlatforms.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{socialPlatforms.length - 3} more
                                      platforms
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Audience Demographics */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-muted-foreground">
                                Audience
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    Age:
                                  </span>
                                  <span className="text-foreground">
                                    {inf.audience_age_group || "N/A"}
                                  </span>
                                </div>
                                {countries.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-foreground">
                                      {countries[0].country}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {inf.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>Email</span>
                                </div>
                              )}
                              {inf.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>Phone</span>
                                </div>
                              )}
                            </div>
                          </CardContent>

                          {/* ✅ Stick button at bottom */}
                          <CardFooter className="mt-auto">
                            <Link
                              href={`/dashboard/brand/influencers/${inf.id}`}
                              className="w-full"
                            >
                              <Button className="w-full" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BrandLayout>
  );
}
