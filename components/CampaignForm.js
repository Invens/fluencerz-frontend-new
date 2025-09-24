"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import { toast } from "react-hot-toast";
import DynamicListInput from "@/components/DynamicListInputForForm";
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

// ✅ Image host for stored files
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

  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("followers_desc"); // followers_desc | followers_asc | name_asc

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ------------ helpers ------------
  const normalizeImg = (src) => {
    if (!src) return "/placeholder.svg";
    if (src.startsWith("http")) return src;
    // stored path like /uploads/... -> prefix with API host
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
        // Handle both shapes: {success:true,data:[..]} or just [...]
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

        const {
          id,
          brand_id,
          feature_image,
          created_at,
          updated_at,
          CampaignApplications = [],
          ...editableFields
        } = data;

        setForm({
          ...editableFields,
          eligibility_criteria: safeJSON(editableFields.eligibility_criteria, []),
          campaign_requirements: safeJSON(editableFields.campaign_requirements, []),
          guidelines_do: safeJSON(editableFields.guidelines_do, []),
          guidelines_donot: safeJSON(editableFields.guidelines_donot, []),
        });

        // Preselect assigned influencers from CampaignApplications
        // Depending on your include, either app.influencer_id exists or app.Influencer.id
        const preselected = CampaignApplications.map((app) => {
          if (app.influencer_id) return app.influencer_id;
          if (app.Influencer?.id) return app.Influencer.id;
          return null;
        }).filter(Boolean);

        setSelectedInfluencers(preselected);

        if (feature_image) {
          setImagePreview(normalizeImg(feature_image));
        }
      } catch (err) {
        console.error("❌ Error fetching campaign:", err);
        toast.error("Failed to load campaign");
      }
    };
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, campaignId]);

  // ------------ input handlers ------------
  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

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

  const selectAllFiltered = () => {
    const ids = filteredInfluencers.map((i) => i.id);
    // merge unique
    setSelectedInfluencers((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearSelection = () => setSelectedInfluencers([]);

  // ------------ filtered + sorted influencers ------------
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
        list.sort((a, b) => (a.followers_count || 0) - (b.followers_count || 0));
        break;
      case "name_asc":
        list.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
        break;
      default:
        // followers_desc
        list.sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0));
    }

    return list;
  }, [influencers, q, sortBy]);

  // ------------ submit ------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) return toast.error("Title is required");
    if (!form.platform?.trim()) return toast.error("Platform is required");
    if (!form.content_type?.trim()) return toast.error("Content type is required");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description || "");
      formData.append("brief_link", form.brief_link || "");
      formData.append("media_kit_link", form.media_kit_link || "");
      formData.append("platform", form.platform || "");
      formData.append("content_type", form.content_type || "");

      formData.append("eligibility_criteria", JSON.stringify(form.eligibility_criteria || []));
      formData.append("campaign_requirements", JSON.stringify(form.campaign_requirements || []));
      formData.append("guidelines_do", JSON.stringify(form.guidelines_do || []));
      formData.append("guidelines_donot", JSON.stringify(form.guidelines_donot || []));

      // ✅ attach influencer IDs
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {mode === "edit" ? "Edit Campaign" : "Create Campaign"}
          </h1>
        </div>

        <Card className="border-gray-300 dark:border-gray-200/15 bg-transparent shadow-none">
          <CardHeader>
            <CardDescription>Fill in the details and assign influencers</CardDescription>
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
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter campaign title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your campaign goals and objectives"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brief_link">Brief Link</Label>
                    <Input
                      id="brief_link"
                      type="text"
                      name="brief_link"
                      value={form.brief_link}
                      onChange={handleChange}
                      placeholder="https://example.com/brief"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media_kit_link">Media Kit Link</Label>
                    <Input
                      id="media_kit_link"
                      type="text"
                      name="media_kit_link"
                      value={form.media_kit_link}
                      onChange={handleChange}
                      placeholder="https://example.com/mediakit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform *</Label>
                    <Select
                      name="platform"
                      value={form.platform}
                      onValueChange={(value) => setForm((s) => ({ ...s, platform: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- Select Platform --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="YouTube">YouTube</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="Telegram">Telegram</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content_type">Content Type *</Label>
                    <Select
                      name="content_type"
                      value={form.content_type}
                      onValueChange={(value) => setForm((s) => ({ ...s, content_type: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- Select Content Type --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid per post">Paid per post</SelectItem>
                        <SelectItem value="Barter">Barter</SelectItem>
                        <SelectItem value="Post">Post</SelectItem>
                        <SelectItem value="Story">Story</SelectItem>
                        <SelectItem value="Reel">Reel</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* --- Lists --- */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DynamicListInput
                  label="Eligibility Criteria"
                  values={form.eligibility_criteria}
                  setValues={(val) => setForm((s) => ({ ...s, eligibility_criteria: val }))}
                />
                <DynamicListInput
                  label="Campaign Requirements"
                  values={form.campaign_requirements}
                  setValues={(val) => setForm((s) => ({ ...s, campaign_requirements: val }))}
                />
                <DynamicListInput
                  label="Guidelines: Do"
                  values={form.guidelines_do}
                  setValues={(val) => setForm((s) => ({ ...s, guidelines_do: val }))}
                />
                <DynamicListInput
                  label="Guidelines: Don't"
                  values={form.guidelines_donot}
                  setValues={(val) => setForm((s) => ({ ...s, guidelines_donot: val }))}
                />
              </section>

              {/* --- Feature image --- */}
              <section className="space-y-2">
                <Label htmlFor="feature_image">Feature Image</Label>
                <Input id="feature_image" type="file" onChange={handleImageChange} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 h-32 w-32 object-cover rounded-lg border"
                  />
                )}
              </section>

              {/* --- Influencer assignment --- */}
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Label>Assign Influencers</Label>
                    <Badge variant="secondary">{selectedInfluencers.length} selected</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by name or niche..."
                      className="h-9 w-56"
                    />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9 w-44">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="followers_desc">Followers (high → low)</SelectItem>
                        <SelectItem value="followers_asc">Followers (low → high)</SelectItem>
                        <SelectItem value="name_asc">Name (A → Z)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="sm" onClick={selectAllFiltered}>
                      Select all (filtered)
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="max-h-[460px] overflow-y-auto rounded-lg border p-3">
                  {inflLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : inflError ? (
                    <div className="p-6 text-sm text-red-600">{inflError}</div>
                  ) : filteredInfluencers.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">No influencers match your search.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                      {filteredInfluencers.map((inf) => {
                        const checked = selectedInfluencers.includes(inf.id);
                        const img = inf.profile_picture_url || inf.profile_image || "";
                        const firstLetter = (inf.full_name || "?")[0].toUpperCase();

                        return (
                          <button
                            key={inf.id}
                            type="button"
                            onClick={() => toggleInfluencer(inf.id)}
                            className={`group flex items-center gap-3 rounded-lg border p-3 text-left transition ${checked
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                                : "hover:border-foreground/30"
                              }`}
                          >
                            {/* Avatar */}
                            <div className="h-12 w-12 rounded-full flex items-center justify-center border bg-gray-100 text-gray-600 font-semibold">
                              {img ? (
                                <img
                                  src={normalizeImg(img)}
                                  alt={inf.full_name}
                                  className="h-12 w-12 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement.textContent = firstLetter;
                                  }}
                                />
                              ) : (
                                firstLetter
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/dashboard/brand/influencers/${inf.id}`}
                                  onClick={(e) => e.stopPropagation()} // prevent toggle
                                  className="font-medium truncate text-blue-600 hover:underline"
                                >
                                  {inf.full_name}
                                </Link>
                                {checked && <Badge className="h-5">Selected</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {inf.niche || "—"} · {(inf.followers_count || 0).toLocaleString()} followers
                              </p>
                            </div>

                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              aria-label={`Select ${inf.full_name}`}
                              checked={checked}
                              onChange={() => toggleInfluencer(inf.id)}
                              className="h-4 w-4"
                              onClick={(e) => e.stopPropagation()} // prevent click bubbling
                            />
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>

                {/* quick peek of selected */}
                {selectedInfluencers.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Selected IDs: {selectedInfluencers.slice(0, 6).join(", ")}
                    {selectedInfluencers.length > 6 && ` +${selectedInfluencers.length - 6} more`}
                  </div>
                )}
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
