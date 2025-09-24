"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Upload,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  Briefcase,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchProfile = async () => {
    try {
      const res = await api.get("/brand/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error("Failed to fetch brand profile:", err);
      setError("Failed to load profile. Please try again.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setMsgType("");

    try {
      // Update profile fields
      await api.put(
        "/brand/update",
        {
          phone: profile.phone,
          skype: profile.skype,
          industry: profile.industry,
          website: profile.website,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Upload profile image
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        await api.patch("/brand/upload-profile", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setMsg("Profile updated successfully!");
      setMsgType("success");
      setImageFile(null);
    } catch (err) {
      console.error("Update failed:", err);
      setMsg("Update failed. Please try again.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <BrandLayout>
        <div className="flex flex-col items-center justify-center h-full w-full gap-6 p-8">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <Button
            onClick={() => {
              setError(null);
              fetchProfile();
            }}
            variant="outline"
            className={"border border-gray-300 dark:border-gray-100/20"}
          >
            Try Again
          </Button>
        </div>
      </BrandLayout>
    );
  }

  if (!profile) {
    return (
      <BrandLayout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </BrandLayout>
    );
  }

  return (
    <BrandLayout>
      <div className=" mx-auto  space-y-8">
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your brand profile and account preferences
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
              <CardDescription>
                Your brand identity and basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar
                    className={
                      "h-24 w-24 border border-gray-300 dark:border-gray-100/20"
                    }
                  >
                    <AvatarImage
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : profile.profile_image
                          ? `http://localhost:4004${profile.profile_image}`
                          : undefined
                      }
                      alt="Brand Avatar"
                    />
                    <AvatarFallback className="text-lg">
                      {profile.company_name?.charAt(0) || "B"}
                    </AvatarFallback>
                  </Avatar>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Button>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="hidden"
                    />
                  </Label>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Company Name
                      </Label>
                      <Input
                        value={profile.company_name || ""}
                        disabled
                        className={
                          "border border-gray-300 dark:border-gray-100/20"
                        }
                      />
                      <Badge variant="secondary" className="text-xs">
                        Read-only
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contact Person
                      </Label>
                      <Input
                        value={profile.contact_person || ""}
                        disabled
                        className={
                          "border border-gray-300 dark:border-gray-100/20"
                        }
                      />
                      <Badge variant="secondary" className="text-xs">
                        Read-only
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      value={profile.email || ""}
                      disabled
                      className={
                        "border border-gray-300 dark:border-gray-100/20"
                      }
                    />
                    <Badge variant="secondary" className="text-xs">
                      Read-only
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Update your contact details and communication preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className={"border border-gray-300 dark:border-gray-100/20"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skype" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Skype ID
                  </Label>
                  <Input
                    id="skype"
                    name="skype"
                    value={profile.skype || ""}
                    onChange={handleChange}
                    placeholder="Enter your Skype ID"
                    className={"border border-gray-300 dark:border-gray-100/20"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Details about your business and industry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={profile.industry || ""}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Fashion, Food"
                    className={"border border-gray-300 dark:border-gray-100/20"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={profile.website || ""}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className={"border border-gray-300 dark:border-gray-100/20"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>

                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit FluencerZ
                  </Link>

                  <Separator orientation="vertical" className="h-4" />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("userType");
                      window.location.href = "/";
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>

              {msg && (
                <div
                  className={`mt-4 p-4 rounded-lg border ${
                    msgType === "success"
                      ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
                      : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">{msg}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </BrandLayout>
  );
}
