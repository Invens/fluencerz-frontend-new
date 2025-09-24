"use client";
import { useEffect, useState } from "react";
import InfluencerLayout from "@/components/InfluencerLayout";
import api from "@/utils/api";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Briefcase,
  Globe,
  Building2,
  ArrowRight,
} from "lucide-react";

const BASE_URL = "http://localhost:4004";

export default function InfluencerCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get("/influencer/campaigns/feed");
        setCampaigns(res.data.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <InfluencerLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Discover Campaigns
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No campaigns available right now. Check back soon!
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-md hover:shadow-xl transition-transform hover:-translate-y-1"
              >
                {/* Banner / Feature Image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={
                      c.feature_image
                        ? `${BASE_URL}${c.feature_image}`
                        : "https://via.placeholder.com/600x300?text=No+Image"
                    }
                    alt={c.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                  {/* Brand */}
                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <div className="bg-white/90 px-2 py-1 rounded text-xs font-medium shadow">
                      <Building2 className="inline-block w-3 h-3 mr-1 text-gray-600" />
                      {c.Brand?.company_name || "Unknown Brand"}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 space-y-3">
                  {/* Title & Desc */}
                  <div>
                    <h2 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition">
                      {c.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 rounded-full"
                    >
                      <Briefcase size={12} /> {c.content_type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 rounded-full"
                    >
                      <Globe size={12} /> {c.platform}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 rounded-full"
                    >
                      <Calendar size={12} />
                      {new Date(c.created_at).toLocaleDateString()}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge className="bg-green-100 text-green-700 font-medium rounded-full">
                      Applications Open
                    </Badge>
                  </div>

                  {/* Button */}
                  <div className="mt-auto">
                    <Button
                      asChild
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Link href={`/dashboard/influencer/campaigns/${c.id}`}>
                        View Campaign <ArrowRight size={14} />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InfluencerLayout>
  );
}
