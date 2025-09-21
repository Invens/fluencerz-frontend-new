"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import { toast } from "react-hot-toast";
import DynamicListInput from "@/components/DynamicListInputForForm";

const API_BASE_URL = "https://api.fluencerz.com";

export default function CampaignForm({ mode = "create", campaignId }) {
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Fetch campaign for edit
  useEffect(() => {
    if (mode === "edit" && campaignId) {
      const fetchData = async () => {
        try {
          const res = await api.get(`/brand/campaigns/${campaignId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data.data;

          const {
            id,
            brand_id,
            feature_image,
            created_at,
            updated_at,
            ...editableFields
          } = data;

          // Parse JSON fields if stored as strings
          setForm({
            ...editableFields,
            eligibility_criteria: JSON.parse(editableFields.eligibility_criteria || "[]"),
            campaign_requirements: JSON.parse(editableFields.campaign_requirements || "[]"),
            guidelines_do: JSON.parse(editableFields.guidelines_do || "[]"),
            guidelines_donot: JSON.parse(editableFields.guidelines_donot || "[]"),
          });

          if (feature_image) {
            setImagePreview(`${API_BASE_URL}${feature_image}`);
          }
        } catch (err) {
          console.error("❌ Error fetching campaign:", err);
          toast.error("Failed to load campaign");
        }
      };
      fetchData();
    }
  }, [mode, campaignId]);

  // ✅ Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Handle feature image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFeatureImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("brief_link", form.brief_link);
      formData.append("media_kit_link", form.media_kit_link);
      formData.append("platform", form.platform);
      formData.append("content_type", form.content_type);

      // Convert arrays → JSON strings
      formData.append("eligibility_criteria", JSON.stringify(form.eligibility_criteria));
      formData.append("campaign_requirements", JSON.stringify(form.campaign_requirements));
      formData.append("guidelines_do", JSON.stringify(form.guidelines_do));
      formData.append("guidelines_donot", JSON.stringify(form.guidelines_donot));

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
      toast.error("Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandLayout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">
          {mode === "edit" ? "✏️ Edit Campaign" : "➕ Create Campaign"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              rows={3}
            />
          </div>

          {/* Brief Link */}
          <div>
            <label className="block text-sm font-medium mb-1">Brief Link</label>
            <input
              type="text"
              name="brief_link"
              value={form.brief_link}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Media Kit Link */}
          <div>
            <label className="block text-sm font-medium mb-1">Media Kit Link</label>
            <input
              type="text"
              name="media_kit_link"
              value={form.media_kit_link}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Platform dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select
              name="platform"
              value={form.platform}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">-- Select Platform --</option>
              <option value="Instagram">Instagram</option>
              <option value="YouTube">YouTube</option>
              <option value="Twitter">Twitter</option>
              <option value="Telegram">Telegram</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Content Type dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Content Type</label>
            <select
              name="content_type"
              value={form.content_type}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">-- Select Content Type --</option>
              <option value="Paid per post">Paid per post</option>
              <option value="Barter">Barter</option>
              <option value="Other">Other</option>
              <option value="Reel">Reel</option>
              <option value="Story">Story</option>
              <option value="Post">Post</option>
              <option value="Video">Video</option>
            </select>
          </div>

          {/* Dynamic List Inputs */}
          <DynamicListInput
            label="Eligibility Criteria"
            values={form.eligibility_criteria}
            setValues={(val) => setForm({ ...form, eligibility_criteria: val })}
          />
          <DynamicListInput
            label="Campaign Requirements"
            values={form.campaign_requirements}
            setValues={(val) => setForm({ ...form, campaign_requirements: val })}
          />
          <DynamicListInput
            label="Guidelines Do"
            values={form.guidelines_do}
            setValues={(val) => setForm({ ...form, guidelines_do: val })}
          />
          <DynamicListInput
            label="Guidelines Don’t"
            values={form.guidelines_donot}
            setValues={(val) => setForm({ ...form, guidelines_donot: val })}
          />

          {/* Feature Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Feature Image</label>
            <input type="file" onChange={handleImageChange} />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 h-32 w-32 object-cover rounded-lg"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-lg hover:opacity-90 transition"
          >
            {loading
              ? "Saving..."
              : mode === "edit"
              ? "Update Campaign"
              : "Create Campaign"}
          </button>
        </form>
      </div>
    </BrandLayout>
  );
}
