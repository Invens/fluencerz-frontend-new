"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/api";
import InfluencerLayout from "@/components/InfluencerLayout";
import {
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Globe,
  Briefcase,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const parseJsonSafe = (val) => {
  if (!val) return [];
  try {
    if (typeof val === "string") return JSON.parse(val);
    return val;
  } catch {
    return [];
  }
};

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const BASE_URL = "https://api.fluencerz.com";

  useEffect(() => {
    const fetchCampaign = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await api.get(`/influencer/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const c = res.data.campaign;
        setCampaign({
          ...c,
          eligibility_criteria: parseJsonSafe(c.eligibility_criteria),
          campaign_requirements: parseJsonSafe(c.campaign_requirements),
          guidelines_do: parseJsonSafe(c.guidelines_do),
          guidelines_donot: parseJsonSafe(c.guidelines_donot),
        });
        setApplied(res.data.applied);
      } catch (err) {
        console.error("❌ Failed to fetch campaign:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleApply = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.post(
        `/influencer/campaigns/${id}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setApplied(true);
    } catch (err) {
      console.error("❌ Application failed:", err);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!campaign) return <p className="p-6">Campaign not found.</p>;

  return (
    <InfluencerLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Back */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to campaigns
        </button>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img
            src={
              campaign.feature_image
                ? `${BASE_URL}${campaign.feature_image}`
                : "https://via.placeholder.com/1200x400?text=No+Image"
            }
            alt="Campaign"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 flex flex-col justify-end p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={18} className="text-white/90" />
              <span className="font-medium text-white/90">
                {campaign.Brand?.company_name || "Unknown Brand"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{campaign.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Globe size={14} /> {campaign.platform}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Briefcase size={14} /> {campaign.content_type}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Calendar size={14} />
                {new Date(campaign.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description & CTA */}
        <div className="bg-card rounded-xl shadow p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {campaign.description}
          </p>
          <div className="flex flex-wrap gap-3">
            {campaign.media_kit_link && (
              <a
                href={campaign.media_kit_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm border rounded px-3 py-1 hover:bg-muted transition"
              >
                Media Kit
              </a>
            )}
            {campaign.brief_link && (
              <a
                href={campaign.brief_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm border rounded px-3 py-1 hover:bg-muted transition"
              >
                Campaign Brief
              </a>
            )}
            {!applied ? (
              <Button
                onClick={handleApply}
                className="ml-auto bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-md"
              >
                Apply Now
              </Button>
            ) : (
              <p className="ml-auto text-green-600 font-semibold text-sm">
                ✅ Already Applied
              </p>
            )}
          </div>
          {message && (
            <p className="text-green-600 text-sm font-medium">{message}</p>
          )}
        </div>

        {/* Detail Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <DetailCard title="Campaign Requirements" items={campaign.campaign_requirements} />
          <DetailCard title="Eligibility Criteria" items={campaign.eligibility_criteria} />
        </div>

        {/* Guidelines */}
        <div className="grid md:grid-cols-2 gap-6">
          <GuidelineCard
            title="Do"
            items={campaign.guidelines_do}
            color="green"
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          />
          <GuidelineCard
            title="Don't"
            items={campaign.guidelines_donot}
            color="red"
            icon={<XCircle className="w-5 h-5 text-red-600" />}
          />
        </div>
      </div>
    </InfluencerLayout>
  );
}

/* ---------- Sub Components ---------- */

function DetailCard({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-card rounded-xl shadow p-5">
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="bg-muted px-3 py-1 rounded-full text-xs text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GuidelineCard({ title, items, color, icon }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-card rounded-xl shadow p-5">
      <h4 className={`font-semibold mb-3 flex items-center gap-2`}>
        {icon} {title}
      </h4>
      <ul className="space-y-2 text-sm">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full bg-${color}-500 inline-block`}
            ></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
