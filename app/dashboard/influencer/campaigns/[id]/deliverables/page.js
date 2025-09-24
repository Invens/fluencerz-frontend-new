"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/api";
import InfluencerLayout from "@/components/InfluencerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DynamicListInput from "@/components/DynamicListInputForForm";

const API_BASE = "https://api.fluencerz.com";

export default function CampaignDeliverablesPage() {
  const { id } = useParams(); // campaignId
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    platform: "Instagram",
    media_type: "POST",
    permalink: "",
    metrics: [],
    tags: [],
    notes: "",
    tracking: "{}",
    proof_file: null,
    cover_image: null,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ---------------- Fetch Deliverables ---------------- */
  const fetchDeliverables = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/influencer/campaigns/${id}/deliverables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliverables(res.data.data || []);
    } catch (err) {
      console.error("❌ Error fetching deliverables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDeliverables();
  }, [id]);

  /* ---------------- Handle Form Change ---------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  /* ---------------- Submit Deliverable ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("platform", form.platform);
      fd.append("media_type", form.media_type);
      fd.append("permalink", form.permalink);
      fd.append("metrics", JSON.stringify(form.metrics || {}));
      fd.append("tags", JSON.stringify(form.tags || []));
      fd.append("notes", form.notes || "");
      fd.append("tracking", form.tracking || "{}");
      if (form.proof_file) fd.append("proof_file", form.proof_file);
      if (form.cover_image) fd.append("cover_image", form.cover_image);

      if (editing) {
        await api.put(`/influencer/deliverables/${editing}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(`/influencer/campaigns/${id}/deliverables`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      resetForm();
      await fetchDeliverables();
    } catch (err) {
      console.error("❌ Error submitting deliverable:", err);
      alert("Failed to submit deliverable");
    }
  };

  const resetForm = () => {
    setForm({
      platform: "Instagram",
      media_type: "POST",
      permalink: "",
      metrics: [],
      tags: [],
      notes: "",
      tracking: "{}",
      proof_file: null,
      cover_image: null,
    });
    setEditing(null);
  };

  /* ---------------- Start Edit ---------------- */
  const startEdit = (d) => {
    setEditing(d.id);
    setForm({
      platform: d.platform,
      media_type: d.media_type,
      permalink: d.permalink || "",
      metrics: d.metrics || [],
      tags: d.tags || [],
      notes: d.notes || "",
      tracking: JSON.stringify(d.tracking || {}, null, 2),
      proof_file: null,
      cover_image: null,
    });
  };

  return (
    <InfluencerLayout>
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          📑 Campaign Deliverables
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Submit and manage your campaign reports.
        </p>

        {/* Deliverables List */}
        {loading ? (
          <p>Loading...</p>
        ) : deliverables.length === 0 ? (
          <p className="text-gray-500">
            No deliverables yet. Submit your first report below.
          </p>
        ) : (
          <div className="space-y-4">
            {deliverables.map((d) => (
              <Card key={d.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle>
                    {d.platform} • {d.media_type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-start">
                  <div className="space-y-1 text-sm">
                    <p>Status: {d.status}</p>
                    {d.permalink && (
                      <a
                        href={d.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        View Post
                      </a>
                    )}
                    <p className="text-xs text-gray-500">
                      Submitted {new Date(d.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  {d.status !== "approved" && (
                    <Button size="sm" onClick={() => startEdit(d)}>
                      Edit
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Submit / Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editing ? "✏️ Edit Deliverable" : "➕ Submit Deliverable"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Platform */}
              <div>
                <Label>Platform</Label>
                <select
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                >
                  <option>Instagram</option>
                  <option>YouTube</option>
                  <option>TikTok</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Media Type */}
              <div>
                <Label>Media Type</Label>
                <select
                  name="media_type"
                  value={form.media_type}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                >
                  <option>POST</option>
                  <option>REEL</option>
                  <option>STORY</option>
                  <option>VIDEO</option>
                  <option>CAROUSEL</option>
                  <option>OTHER</option>
                </select>
              </div>

              {/* Permalink */}
              <div>
                <Label>Permalink</Label>
                <Input
                  name="permalink"
                  value={form.permalink}
                  onChange={handleChange}
                  placeholder="https://instagram.com/p/xyz"
                />
              </div>

              {/* Metrics */}
              <DynamicListInput
                label="Metrics (reach, likes, impressions...)"
                values={form.metrics}
                setValues={(val) => setForm({ ...form, metrics: val })}
              />

              {/* Tags */}
              <DynamicListInput
                label="Tags"
                values={form.tags}
                setValues={(val) => setForm({ ...form, tags: val })}
              />

              {/* Tracking */}
              <div>
                <Label>Tracking (JSON)</Label>
                <Textarea
                  name="tracking"
                  value={form.tracking}
                  onChange={handleChange}
                  rows={2}
                  className="font-mono text-xs"
                />
              </div>

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                <Textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              {/* Proof File */}
              <div>
                <Label>Proof File (image/pdf/zip)</Label>
                <Input
                  type="file"
                  name="proof_file"
                  accept="image/*,application/pdf,application/zip"
                  onChange={handleChange}
                />
              </div>

              {/* Cover Image */}
              <div>
                <Label>Cover Image</Label>
                <Input
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>

              <Button type="submit">
                {editing ? "Update Deliverable" : "Submit Deliverable"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </InfluencerLayout>
  );
}
