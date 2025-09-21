"use client";
import { useEffect, useState } from "react";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import { toast } from "react-hot-toast";
import Link from "next/link";

const API_BASE_URL = "https://api.fluencerz.com";

export default function BrandCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/brand/campaigns-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(res.data.data || []);
    } catch (err) {
      console.error("❌ Error fetching campaigns:", err);
      toast.error("Failed to fetch campaigns");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <BrandLayout>
      <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]">
              Manage Campaigns
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              View and manage all your campaigns.
            </p>
          </div>
          <Link
            href="/dashboard/brand/campaigns/create"
            className="px-5 py-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-medium rounded-lg shadow hover:opacity-90 transition"
          >
            + New Campaign
          </Link>
        </div>

        {/* Campaigns List */}
        <div>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
              <p className="text-gray-500">
                No campaigns yet. Start by creating one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden hover:shadow-lg transition"
                >
                  {c.feature_image ? (
                    <img
                      src={`${API_BASE_URL}${c.feature_image}`}
                      alt={c.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full flex items-center justify-center bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-sm">
                      No Image
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {c.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {c.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          c.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.status}
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/brand/campaigns/${c.id}`}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/brand/campaigns/${c.id}/edit`}
                          className="px-3 py-1 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-xs rounded-lg hover:opacity-90 transition"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Created {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BrandLayout>
  );
}
