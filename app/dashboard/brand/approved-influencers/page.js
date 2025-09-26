"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import { Users, MessageCircle, Info, Calendar, BarChart3 } from "lucide-react";

const API_BASE_URL = "https://api.fluencerz.com";

export default function ActiveCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/brand/approved-influencers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(res.data.campaigns || []);
    } catch (err) {
      console.error("❌ Error fetching campaigns:", err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <BrandLayout>
      <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
        {/* Header */}
        <div className="border-b pb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Active Campaigns
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
            Track all live collaborations and influencer performance here hassle free
          </p>
        </div>

        {/* Empty state */}
        {campaigns.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-500">No active campaigns found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900"
              >
                {/* Campaign header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {c.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>Status: {c.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
                      {c.influencers.length} Influencer
                      {c.influencers.length !== 1 && "s"}
                    </span>
                    {/* ✅ See Report Button */}
                    <Link
                      href={`/dashboard/brand/campaigns/${c.id}/report`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700 transition"
                    >
                      <BarChart3 className="w-4 h-4" />
                      See Report
                    </Link>
                  </div>
                </div>

                {/* Influencer list */}
                {c.influencers.length > 0 ? (
                  <div className="divide-y">
                    {c.influencers.map((inf) => (
                      <div
                        key={inf.id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        {/* Left: avatar + info */}
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              inf.profile_picture_url ||
                              (inf.profile_image
                                ? `${API_BASE_URL}${inf.profile_image}`
                                : "/default-avatar.png")
                            }
                            alt={inf.full_name}
                            className="w-12 h-12 rounded-full object-cover border"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {inf.full_name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {inf.niche || "No niche"}
                            </p>
                          </div>
                        </div>

                        {/* Middle: stats */}
                        <div className="flex gap-8 text-sm text-gray-600 dark:text-gray-300">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {inf.followers_count}
                            </p>
                            <p className="text-xs text-gray-500">Followers</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {inf.engagement_rate}%
                            </p>
                            <p className="text-xs text-gray-500">Engagement</p>
                          </div>
                        </div>

                        {/* Right: actions */}
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/brand/chat/${c.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Media Share
                          </Link>
                          <Link
                            href={`/dashboard/brand/influencers/${inf.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            <Info className="w-4 h-4" />
                            Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-6 py-4 text-sm text-gray-500">
                    No influencers for this campaign.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BrandLayout>
  );
}
