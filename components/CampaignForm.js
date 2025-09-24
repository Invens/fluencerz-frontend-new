"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
  Select,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DynamicListInput from "@/components/DynamicListInputForForm";

const API_BASE_IMAGE = "https://api.fluencerz.com";

export default function CampaignForm({ mode = "create", campaignId }) {
  const router = useRouter();

  // ------------ form state ------------
  const [form, setForm] = useState({
    title: "",
    description: "",
    brief_link: "",
    media_kit_link: "",
    platform: "",
    content_type: "",
    eligibility_criteria: [],
    campaign_requirements: [],
    guidelines_do: [],
    guidelines_donot: [],
  });

  const [featureImage, setFeatureImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // ------------ influencers state ------------
  const [influencers, setInfluencers] = useState([]);
  const [inflLoading, setInflLoading] = useState(false);
  const [inflError, setInflError] = useState(null);

  const [recommendedInfluencers, setRecommendedInfluencers] = useState([]);
  const [recommending, setRecommending] = useState(false);

  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("followers_desc");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ------------ helpers ------------
  const normalizeImg = (src) => {
    if (!src) return "/placeholder.svg";
    if (src.startsWith("http")) return src;
    return `${API_BASE_IMAGE}${src}`;
  };

  const safeJSON = (value, fallback) => {
    try {
      if (value == null || value === "") return fallback;
      return typeof value === "string" ? JSON.parse(value) : value;
    } catch {
      return fallback;
    }
  };

  // ------------ fetch influencers ------------
  useEffect(() => {
    const fetchInfluencers = async () => {
      setInflLoading(true);
      setInflError(null);
      try {
        const res = await api.get("/brand/influencers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setInfluencers(list);
      } catch (err) {
        console.error("❌ Error fetching influencers:", err);
        setInflError("Failed to load influencers");
      } finally {
        setInflLoading(false);
      }
    };
    fetchInfluencers();
  }, [token]);

  // ------------ fetch campaign for edit ------------
  useEffect(() => {
    if (mode !== "edit" || !campaignId) return;
    const fetchCampaign = async () => {
      try {
        const res = await api.get(`/brand/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.data || res.data;
        if (!data) {
          toast.error("Failed to load campaign");
          return;
        }

        const { feature_image, CampaignApplications = [], ...editableFields } =
          data;

        setForm({
          ...editableFields,
          eligibility_criteria: safeJSON(
            editableFields.eligibility_criteria,
            []
          ),
          campaign_requirements: safeJSON(
            editableFields.campaign_requirements,
            []
          ),
          guidelines_do: safeJSON(editableFields.guidelines_do, []),
          guidelines_donot: safeJSON(editableFields.guidelines_donot, []),
        });

        const preselected = CampaignApplications.map((app) => {
          if (app.influencer_id) return app.influencer_id;
          if (app.Influencer?.id) return app.Influencer.id;
          return null;
        }).filter(Boolean);

        setSelectedInfluencers(preselected);
        if (feature_image) setImagePreview(normalizeImg(feature_image));
      } catch (err) {
        console.error("❌ Error fetching campaign:", err);
        toast.error("Failed to load campaign");
      }
    };
    fetchCampaign();
  }, [mode, campaignId]);

  // ------------ handlers ------------
  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setFeatureImage(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const toggleInfluencer = (id) => {
    setSelectedInfluencers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ------------ AI recommend influencers ------------
  const fetchRecommendations = async () => {
    setRecommending(true);
    try {
      const res = await api.post(
        "/brand/recommend-influencers",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendedInfluencers(res.data.recommended || []);
      toast.success("AI recommended influencers loaded!");
    } catch (err) {
      console.error("❌ Recommend error:", err);
      toast.error("Failed to get AI recommendations");
    } finally {
      setRecommending(false);
    }
  };

  // ------------ merge influencers ------------
  const filteredInfluencers = useMemo(() => {
    let list = [...influencers];

    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((inf) => {
        const name = (inf.full_name || "").toLowerCase();
        const niche = (inf.niche || "").toLowerCase();
        return name.includes(needle) || niche.includes(needle);
      });
    }

    switch (sortBy) {
      case "followers_asc":
        list.sort(
          (a, b) => (a.followers_count || 0) - (b.followers_count || 0)
        );
        break;
      case "name_asc":
        list.sort((a, b) =>
          (a.full_name || "").localeCompare(b.full_name || "")
        );
        break;
      default:
        list.sort(
          (b, a) => (a.followers_count || 0) - (b.followers_count || 0)
        );
    }

    if (recommendedInfluencers.length > 0) {
      const recIds = recommendedInfluencers.map((i) => i.id);
      const rec = recommendedInfluencers.map((i) => ({ ...i, _ai: true }));
      const others = list.filter((i) => !recIds.includes(i.id));
      return [...rec, ...others];
    }

    return list;
  }, [influencers, q, sortBy, recommendedInfluencers]);

  // ------------ submit ------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) return toast.error("Title is required");
    if (!form.platform?.trim()) return toast.error("Platform is required");
    if (!form.content_type?.trim())
      return toast.error("Content type is required");

    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) =>
        formData.append(k, typeof v === "object" ? JSON.stringify(v) : v || "")
      );
      formData.append("influencer_ids", JSON.stringify(selectedInfluencers));
      if (featureImage) formData.append("feature_image", featureImage);

      if (mode === "edit") {
        await api.put(`/brand/campaigns/${campaignId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Campaign updated successfully");
      } else {
        await api.post("/brand/add-campaign", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Campaign created successfully");
      }

      router.push("/dashboard/brand/campaigns");
    } catch (err) {
      console.error("❌ Save campaign error:", err);
      toast.error(err?.response?.data?.message || "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  // ------------ UI ------------
  return (
    <BrandLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">
          {mode === "edit" ? "Edit Campaign" : "Create Campaign"}
        </h1>

        <Card>
          <CardHeader>
            <CardDescription>Fill in details and assign influencers</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-8"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* --- Basics --- */}
              <section className="space-y-4">
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Campaign Title"
                  required
                />
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Campaign Description"
                  rows={3}
                />

                <Input
                  name="brief_link"
                  value={form.brief_link}
                  onChange={handleChange}
                  placeholder="Brief link"
                />
                <Input
                  name="media_kit_link"
                  value={form.media_kit_link}
                  onChange={handleChange}
                  placeholder="Media Kit link"
                />

                <Select
                  name="platform"
                  value={form.platform}
                  onValueChange={(value) =>
                    setForm((s) => ({ ...s, platform: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  name="content_type"
                  value={form.content_type}
                  onValueChange={(value) =>
                    setForm((s) => ({ ...s, content_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid per post">Paid per post</SelectItem>
                    <SelectItem value="Barter">Barter</SelectItem>
                    <SelectItem value="Reel">Reel</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </section>

              {/* --- Lists --- */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DynamicListInput
                  label="Eligibility Criteria"
                  values={form.eligibility_criteria}
                  setValues={(val) =>
                    setForm((s) => ({ ...s, eligibility_criteria: val }))
                  }
                />
                <DynamicListInput
                  label="Campaign Requirements"
                  values={form.campaign_requirements}
                  setValues={(val) =>
                    setForm((s) => ({ ...s, campaign_requirements: val }))
                  }
                />
                <DynamicListInput
                  label="Guidelines (Do)"
                  values={form.guidelines_do}
                  setValues={(val) =>
                    setForm((s) => ({ ...s, guidelines_do: val }))
                  }
                />
                <DynamicListInput
                  label="Guidelines (Don't)"
                  values={form.guidelines_donot}
                  setValues={(val) =>
                    setForm((s) => ({ ...s, guidelines_donot: val }))
                  }
                />
              </section>

              {/* --- Feature Image --- */}
              <section>
                <Label>Feature Image</Label>
                <Input type="file" onChange={handleImageChange} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 h-32 w-32 rounded-lg object-cover border"
                  />
                )}
              </section>

         {/* --- Influencers --- */}
<section className="space-y-6">
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-2">
      <Label>Assign Influencers</Label>
      <Badge>{selectedInfluencers.length} selected</Badge>
    </div>
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={fetchRecommendations}
        disabled={recommending}
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
      >
        {recommending ? "Recommending..." : "Recommend (AI)"}
      </Button>
      {recommendedInfluencers.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRecommendedInfluencers([])}
        >
          Clear
        </Button>
      )}
    </div>
  </div>

  <div className="max-h-[600px] overflow-y-auto space-y-6">
    {/* Recommended by AI */}
    {recommendedInfluencers.length > 0 && (
      <div>
        <h3 className="text-sm font-semibold text-purple-600 mb-3">
          🤖 Recommended by AI
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendedInfluencers.map((inf) => {
            const checked = selectedInfluencers.includes(inf.id);
            return (
              <button
                key={inf.id}
                type="button"
                onClick={() => toggleInfluencer(inf.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  checked ? "border-purple-500 bg-purple-50" : ""
                }`}
              >
                <img
                  src={normalizeImg(inf.profile_image)}
                  alt={inf.full_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <Link
                    href={`/dashboard/brand/influencers/${inf.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-purple-700 hover:underline"
                  >
                    {inf.full_name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {inf.niche || "—"} · {(inf.followers_count || 0).toLocaleString()} followers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="h-4 w-4"
                />
              </button>
            );
          })}
        </div>
      </div>
    )}

    {/* All Influencers */}
    <div>
      <h3 className="text-sm font-semibold text-gray-600 mb-3">
        All Influencers
      </h3>
      {inflLoading ? (
        <p>Loading...</p>
      ) : inflError ? (
        <p className="text-red-500">{inflError}</p>
      ) : filteredInfluencers.length === 0 ? (
        <p className="text-gray-500">No influencers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredInfluencers.map((inf) => {
            const checked = selectedInfluencers.includes(inf.id);
            return (
              <button
                key={inf.id}
                type="button"
                onClick={() => toggleInfluencer(inf.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  checked ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <img
                  src={normalizeImg(inf.profile_image)}
                  alt={inf.full_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <Link
                    href={`/dashboard/brand/influencers/${inf.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {inf.full_name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {inf.niche || "—"} · {(inf.followers_count || 0).toLocaleString()} followers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="h-4 w-4"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  </div>
</section>

              {/* --- Submit --- */}
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : mode === "edit"
                    ? "Update Campaign"
                    : "Create Campaign"}
                </Button>
              </div>
            </motion.form>
          </CardContent>
        </Card>
      </div>
    </BrandLayout>
  );
}
