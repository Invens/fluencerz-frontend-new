"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";

const API_BASE_URL = "http://localhost:4004";

// Helper to safely parse JSON
function parseJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// ✅ Render parsed JSON as bullet points
function renderParsedField(field) {
  const parsed = parseJSON(field);

  if (!parsed) return <span className="text-gray-400">—</span>;

  if (typeof parsed === "object" && !Array.isArray(parsed)) {
    return (
      <ul className="list-disc list-inside text-sm space-y-1">
        {Object.entries(parsed).map(([key, value]) => (
          <li key={key}>
            <span className="font-medium capitalize">
              {key.replace(/_/g, " ")}:
            </span>{" "}
            {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
          </li>
        ))}
      </ul>
    );
  }

  if (Array.isArray(parsed)) {
    return (
      <ul className="list-disc list-inside text-sm space-y-1">
        {parsed.map((item, idx) => (
          <li key={idx}>{String(item)}</li>
        ))}
      </ul>
    );
  }

  return <span>{String(parsed)}</span>;
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await api.get(`/brand/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaign(res.data.data);
      } catch (err) {
        console.error("❌ Error fetching campaign:", err);
      }
    };
    fetchCampaign();
  }, [id]);

  console.log(campaign);

  if (!campaign) {
    return (
      <BrandLayout>
        <p className="text-center text-gray-500 py-20">Loading...</p>
      </BrandLayout>
    );
  }

  return (
    <BrandLayout>
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
        {/* Campaign Header */}
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            {campaign.title}
          </h1>
          {campaign.feature_image && (
            <img
              src={`${API_BASE_URL}${campaign.feature_image}`}
              alt={campaign.title}
              className="w-full h-72 object-cover rounded-lg mb-6"
            />
          )}
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
            {campaign.description}
          </p>

          {/* Campaign Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  campaign.status === "published"
                    ? "bg-green-200 text-green-800"
                    : campaign.status === "draft"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {campaign.status}
              </span>
            </p>
            <p>
              <strong>Platform:</strong>{" "}
              <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded text-xs font-medium">
                {campaign.platform}
              </span>
            </p>
            <p>
              <strong>Content Type:</strong>{" "}
              <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-medium">
                {campaign.content_type}
              </span>
            </p>
            <p>
              <strong>Brief:</strong>{" "}
              <a
                href={campaign.brief_link}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                {campaign.brief_link}
              </a>
            </p>
            <p>
              <strong>Media Kit:</strong>{" "}
              <a
                href={campaign.media_kit_link}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                {campaign.media_kit_link}
              </a>
            </p>

            {/* ✅ JSON Fields */}
            <div className="col-span-2">
              <strong>Eligibility:</strong>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mt-1">
                {renderParsedField(campaign.eligibility_criteria)}
              </div>
            </div>

            <div className="col-span-2">
              <strong>Requirements:</strong>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mt-1">
                {renderParsedField(campaign.campaign_requirements)}
              </div>
            </div>

            <div className="col-span-2">
              <strong>Guidelines (Do):</strong>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mt-1">
                {renderParsedField(campaign.guidelines_do)}
              </div>
            </div>

            <div className="col-span-2">
              <strong>Guidelines (Don’t):</strong>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mt-1">
                {renderParsedField(campaign.guidelines_donot)}
              </div>
            </div>

            <p>
              <strong>Created At:</strong>{" "}
              {new Date(campaign.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Applications
          </h2>

          {campaign.CampaignApplications &&
          campaign.CampaignApplications.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {campaign.CampaignApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {app.Influencer?.profile_image && (
                      <img
                        src={`${API_BASE_URL}${app.Influencer.profile_image}`}
                        alt={app.Influencer.full_name}
                        className="w-14 h-14 rounded-full border object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {app.Influencer?.full_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{app.Influencer?.instagram_handle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>Followers: {app.Influencer?.followers_count}</p>
                    <p>Engagement Rate: {app.Influencer?.engagement_rate}%</p>
                    <p>Category: {app.Influencer?.category}</p>
                    <p className="text-xs text-gray-400">
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        app.status === "approved"
                          ? "bg-green-200 text-green-800"
                          : app.status === "rejected"
                          ? "bg-red-200 text-red-800"
                          : app.status === "forwarded"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No applications yet.
            </p>
          )}
        </div>
      </div>
    </BrandLayout>
  );
}
