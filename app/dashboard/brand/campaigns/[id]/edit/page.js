"use client";
import { useParams } from "next/navigation";
import CampaignForm from "@/components/CampaignForm";

export default function EditCampaignPage() {
  const { id } = useParams();
  return <CampaignForm mode="edit" campaignId={id} />;
}
