"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import { toast } from "react-hot-toast";
import DynamicListInput from "@/components/DynamicListInputForForm";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { Button } from "./ui/button";

import { Textarea } from "@/components/ui/textarea";
import { SelectItem } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

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
            eligibility_criteria: JSON.parse(
              editableFields.eligibility_criteria || "[]"
            ),
            campaign_requirements: JSON.parse(
              editableFields.campaign_requirements || "[]"
            ),
            guidelines_do: JSON.parse(editableFields.guidelines_do || "[]"),
            guidelines_donot: JSON.parse(
              editableFields.guidelines_donot || "[]"
            ),
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
      formData.append(
        "eligibility_criteria",
        JSON.stringify(form.eligibility_criteria)
      );
      formData.append(
        "campaign_requirements",
        JSON.stringify(form.campaign_requirements)
      );
      formData.append("guidelines_do", JSON.stringify(form.guidelines_do));
      formData.append(
        "guidelines_donot",
        JSON.stringify(form.guidelines_donot)
      );

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
        console.log(formData);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {" "}
            {mode === "edit" ? (
              <span className="flex gap-2 items-center flex-row-reverse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
                Edit Campaign
              </span>
            ) : (
              <span className="flex flex-row-reverse gap-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
                  />
                </svg>
                Create Campaign
              </span>
            )}
          </h1>
          {/* <div className="text-sm text-muted-foreground">Step {step} of 2</div> */}
        </div>

        <Card
          className={
            "border-gray-300 dark:border-gray-200/15 bg-transparent shadow-none"
          }
        >
          <CardHeader>
            {/* <CardTitle>{step === 1 ? "" : "Choose Influencers"}</CardTitle> */}
            <CardDescription>
              Fill in the basic details to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 ">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Title */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter campaign title"
                  className={"border border-gray-300 dark:border-gray-100/20"}
                  required
                />
              </motion.div>

              {/* Description */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your campaign goals and objectives"
                  className={"border border-gray-300 dark:border-gray-100/20"}
                  rows={3}
                />
              </motion.div>

              {/* Brief Link & Media Kit Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="brief_link">Brief Link</Label>
                  <Input
                    id="brief_link"
                    type="text"
                    name="brief_link"
                    value={form.brief_link}
                    onChange={handleChange}
                    placeholder="https://example.com/brief"
                    className={"border border-gray-300 dark:border-gray-100/20"}
                  />
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="media_kit_link">Media Kit Link</Label>
                  <Input
                    id="media_kit_link"
                    type="text"
                    name="media_kit_link"
                    value={form.media_kit_link}
                    onChange={handleChange}
                    placeholder="https://example.com/mediakit"
                    className={"border border-gray-300 dark:border-gray-100/20"}
                  />
                </motion.div>
              </div>

              {/* Platform & Content Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="platform">Platform *</Label>
                  <Select
                    name="platform"
                    value={form.platform}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "platform", value } })
                    }
                    required
                  >
                    <SelectTrigger className="border text-black dark:text-white border-gray-300 dark:border-gray-100/20">
                      <SelectValue placeholder="-- Select Platform --" />
                    </SelectTrigger>
                    <SelectContent className="text-black dark:text-white ">
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="Telegram">Telegram</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="content_type">Content Type *</Label>
                  <Select
                    name="content_type"
                    value={form.content_type}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "content_type", value } })
                    }
                    required
                  >
                    <SelectTrigger className="border text-black dark:text-white border-gray-300 dark:border-gray-100/20">
                      <SelectValue placeholder="-- Select Content Type --" />
                    </SelectTrigger>
                    <SelectContent className="text-black dark:text-white">
                      <SelectItem value="Paid per post">
                        Paid per post
                      </SelectItem>
                      <SelectItem value="Barter">Barter</SelectItem>
                      <SelectItem value="Post">Post</SelectItem>
                      <SelectItem value="Story">Story</SelectItem>
                      <SelectItem value="Reel">Reel</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              {/* Dynamic List Inputs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <DynamicListInput
                  label="Eligibility Criteria"
                  values={form.eligibility_criteria}
                  setValues={(val) =>
                    setForm({ ...form, eligibility_criteria: val })
                  }
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <DynamicListInput
                  label="Campaign Requirements"
                  values={form.campaign_requirements}
                  setValues={(val) =>
                    setForm({ ...form, campaign_requirements: val })
                  }
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <DynamicListInput
                  label="Guidelines: Do"
                  values={form.guidelines_do}
                  setValues={(val) => setForm({ ...form, guidelines_do: val })}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <DynamicListInput
                  label="Guidelines: Don't"
                  values={form.guidelines_donot}
                  setValues={(val) =>
                    setForm({ ...form, guidelines_donot: val })
                  }
                />
              </motion.div>

              {/* Feature Image */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Label htmlFor="feature_image">Feature Image</Label>
                <Input
                  id="feature_image"
                  type="file"
                  onChange={handleImageChange}
                  className="border border-gray-300 dark:border-gray-100/20"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 h-32 w-32 object-cover rounded-lg"
                  />
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                className="flex justify-end pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3  rounded-lg hover:opacity-90 transition"
                  >
                    {loading
                      ? "Saving..."
                      : mode === "edit"
                      ? "Update Campaign"
                      : "Create Campaign"}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>
            {/* <Separator /> */}
            {/* <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!form || selectedInfluencers.length === 0}
              >
                Create Campaign ({selectedInfluencers.length} creators)
              </Button>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </BrandLayout>
  );
}

//  <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Title</label>
//             <input
//               type="text"
//               name="title"
//               value={form.title}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={form.description}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg"
//               rows={3}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Brief Link</label>
//             <input
//               type="text"
//               name="brief_link"
//               value={form.brief_link}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Media Kit Link
//             </label>
//             <input
//               type="text"
//               name="media_kit_link"
//               value={form.media_kit_link}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Platform</label>
//             <select
//               name="platform"
//               value={form.platform}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg"
//               required
//             >
//               <option value="">-- Select Platform --</option>
//               <option value="Instagram">Instagram</option>
//               <option value="YouTube">YouTube</option>
//               <option value="Twitter">Twitter</option>
//               <option value="Telegram">Telegram</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Content Type
//             </label>
//             <select
//               name="content_type"
//               value={form.content_type}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg"
//               required
//             >
//               <option value="">-- Select Content Type --</option>
//               <option value="Paid per post">Paid per post</option>
//               <option value="Barter">Barter</option>
//               <option value="Other">Other</option>
//               <option value="Reel">Reel</option>
//               <option value="Story">Story</option>
//               <option value="Post">Post</option>
//               <option value="Video">Video</option>
//             </select>
//           </div>

//           <DynamicListInput
//             label="Eligibility Criteria"
//             values={form.eligibility_criteria}
//             setValues={(val) => setForm({ ...form, eligibility_criteria: val })}
//           />
//           <DynamicListInput
//             label="Campaign Requirements"
//             values={form.campaign_requirements}
//             setValues={(val) =>
//               setForm({ ...form, campaign_requirements: val })
//             }
//           />
//           <DynamicListInput
//             label="Guidelines Do"
//             values={form.guidelines_do}
//             setValues={(val) => setForm({ ...form, guidelines_do: val })}
//           />
//           <DynamicListInput
//             label="Guidelines Don’t"
//             values={form.guidelines_donot}
//             setValues={(val) => setForm({ ...form, guidelines_donot: val })}
//           />

//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Feature Image
//             </label>
//             <input type="file" onChange={handleImageChange} />
//             {imagePreview && (
//               <img
//                 src={imagePreview}
//                 alt="Preview"
//                 className="mt-2 h-32 w-32 object-cover rounded-lg"
//               />
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="px-6 py-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-lg hover:opacity-90 transition"
//           >
//             {loading
//               ? "Saving..."
//               : mode === "edit"
//               ? "Update Campaign"
//               : "Create Campaign"}
//           </button>
//         </form>
