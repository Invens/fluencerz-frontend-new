"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/api";
import BrandLayout from "@/components/BrandLayout";
import {
  FileDown,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Link2,
} from "lucide-react";

const API_BASE = "https://api.fluencerz.com";

export default function CampaignReportPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ---------------- Fetch campaign + report ---------------- */
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [campaignRes, reportRes] = await Promise.all([
        api.get(`/brand/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/brand/campaigns/${id}/report`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCampaign(campaignRes.data?.data || campaignRes.data?.campaign);
      setReport(reportRes.data?.data || {});
    } catch (err) {
      console.error("❌ Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  /* ---------------- Handle review decision ---------------- */
  const reviewDeliverable = async (deliverableId, decision) => {
    try {
      await api.post(
        `/brand/deliverables/${deliverableId}/review`,
        { decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
    } catch (err) {
      console.error("❌ Error reviewing deliverable:", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading report...</p>;
  }

  if (!campaign) {
    return <p className="text-center mt-10">Campaign not found.</p>;
  }

  return (
    <BrandLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <a
            href={`${API_BASE}/api/brand/campaigns/${id}/report/pdf?token=${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg shadow hover:opacity-90"
          >
            <FileDown size={18} />
            Download PDF
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b">
          {["overview", "totals", "influencers"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 capitalize ${
                tab === t
                  ? "border-b-2 border-purple-500 font-medium"
                  : "text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === "overview" && (
          <div className="space-y-4">
            <p className="text-gray-700">{campaign.description}</p>
            <p className="text-sm text-gray-600">
              Status:{" "}
              <span className="font-medium capitalize">{campaign.status}</span>
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Brief:</strong>{" "}
                <a
                  href={campaign.brief_link}
                  target="_blank"
                  className="text-indigo-600 underline"
                >
                  {campaign.brief_link}
                </a>
              </p>
              <p>
                <strong>Media Kit:</strong>{" "}
                <a
                  href={campaign.media_kit_link}
                  target="_blank"
                  className="text-indigo-600 underline"
                >
                  {campaign.media_kit_link}
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Tab: Totals */}
        {tab === "totals" && report?.totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(report.totals).map(([k, v]) => (
              <div
                key={k}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center"
              >
                <p className="text-xs text-gray-500 capitalize">{k}</p>
                <p className="text-lg font-bold">{v}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Influencers & Deliverables */}
        {tab === "influencers" && report?.byInfluencer && (
          <div className="space-y-8">
            {Object.values(report.byInfluencer).map((group) => (
              <div
                key={group.influencer.id}
                className="border rounded-lg shadow bg-white dark:bg-gray-900"
              >
                {/* Influencer header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b">
                  {group.influencer.profile_image ? (
                    <img
                      src={`${API_BASE}${group.influencer.profile_image}`}
                      className="w-12 h-12 rounded-full object-cover"
                      alt={group.influencer.full_name}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                      {group.influencer.full_name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">
                      {group.influencer.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {group.influencer.niche} ·{" "}
                      {group.influencer.followers_count} followers
                    </p>
                  </div>
                </div>

                {/* Subtotals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                  {Object.entries(group.subtotals).map(([k, v]) => (
                    <div key={k} className="text-center">
                      <p className="text-xs text-gray-500">{k}</p>
                      <p className="font-medium">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Deliverables */}
                <div className="overflow-x-auto">
                  <table className="w-full border-t">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                        <th className="p-3">Platform</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Permalink</th>
                        <th className="p-3">Notes</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((d) => (
                        <tr
                          key={d.id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="p-3">{d.platform}</td>
                          <td className="p-3">{d.media_type}</td>
                          <td className="p-3">
                            {d.permalink ? (
                              <a
                                href={d.permalink}
                                target="_blank"
                                className="text-indigo-600 flex items-center gap-1 text-xs underline"
                              >
                                <Link2 size={14} /> View
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-3 text-xs">{d.notes || "-"}</td>
                          <td className="p-3">
                            {d.status === "approved" && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle size={14} /> Approved
                              </span>
                            )}
                            {d.status === "submitted" && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <Clock size={14} /> Submitted
                              </span>
                            )}
                            {d.status === "rejected" && (
                              <span className="flex items-center gap-1 text-red-600">
                                <XCircle size={14} /> Rejected
                              </span>
                            )}
                          </td>
                          <td className="p-3 space-x-2">
                            <button
                              onClick={() => reviewDeliverable(d.id, "approved")}
                              className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => reviewDeliverable(d.id, "rejected")}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BrandLayout>
  );
}
