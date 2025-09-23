"use client";
import { useEffect, useState } from "react";
import BrandLayout from "@/components/BrandLayout";
import api from "@/utils/api";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  BadgeDollarSign,
  Target,
  ListChecks,
  Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const API_BASE_URL = "https://api.fluencerz.com";

export default function BrandCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        // 1. Get campaigns list
        const res = await api.get("/brand/campaigns-list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const campaignList = res.data.data || [];
        setCampaigns(campaignList);

        // 2. Fetch details for each campaign in parallel
        const details = await Promise.all(
          campaignList.map(async (campaign) => {
            const detailRes = await api.get(`/brand/campaigns/${campaign.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return detailRes.data.data;
          })
        );

        // 3. Save detailed campaigns to state
        setCampaigns(details);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCampaigns();
  }, []);

  console.log(campaigns);

  const columnsCount = 6;
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const statusBadge = (status) => {
    const base = "border";
    if (status === "active")
      return cn(
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        base
      );
    if (status === "published")
      return cn(
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        base
      );
    if (status === "pending")
      return cn(
        "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        base
      );
    if (status === "cancelled")
      return cn(
        "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        base
      );
    if (status === "completed")
      return cn("bg-muted text-foreground/70 dark:text-foreground/80", base);
    return cn("bg-secondary text-secondary-foreground", base);
  };

  const RowAvatars = ({ influencers = [] }) => {
    // const visible = influencers?.slice(0, 3) || [];
    // const extra = Math.max((influencers?.length || 0) - visible.length, 0);
    return (
      <div className="flex items-center gap-2">
        {influencers
          .filter((inf) => inf.status == "approved")
          .map((inf) => (
            <Avatar key={inf.Influencer.id} className="h-6 w-6">
              <AvatarImage
                alt={inf.Influencer.full_name}
                src={
                  inf.Influencer.profile_image ||
                  `/placeholder.svg?height=24&width=24&query=avatar`
                }
              />
              <AvatarFallback>
                {inf.Influencer.full_name?.[0]?.toUpperCase() || "I"}
              </AvatarFallback>
            </Avatar>
          ))}
        <div className="text-xs text-muted-foreground">
          {influencers?.length || 0} creators
          {/* {extra > 0 ? ` (+${extra})` : "" */}
        </div>
      </div>
    );
  };

  return (
    <BrandLayout>
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-primary" />
          </div>
        ) : campaigns?.length == 0 ? (
          <div className="text-sm text-muted-foreground">
            No campaigns yet. Click “Create Campaign” to add your first one.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-balance">Campaigns</h1>
              <Link href="/dashboard/brand/campaigns/create">
                <Button>Create Campaign</Button>
              </Link>
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead
                      className="w-10"
                      aria-label="expand column"
                    ></TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Creators</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => {
                    const isOpen = !!expanded[c.id];
                    const created = new Date(c.created_at).toLocaleDateString();
                    return (
                      <>
                        <TableRow
                          key={c.id}
                          className={cn(
                            "transition-colors hover:bg-muted/60",
                            "odd:bg-muted/40"
                          )}
                        >
                          <TableCell className="align-middle">
                            <button
                              type="button"
                              onClick={() => toggleExpand(c.id)}
                              aria-expanded={isOpen}
                              aria-controls={`campaign-details-${c.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                              title={
                                isOpen ? "Collapse details" : "Expand details"
                              }
                            >
                              {isOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          </TableCell>

                          <TableCell className="align-middle">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {c.title || "Untitled Campaign"}
                              </span>
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {c.objective
                                  ? `Objective: ${c.objective}`
                                  : c.description}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="align-middle">
                            <Badge className={statusBadge(c.status)}>
                              {c.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="align-middle">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{created}</span>
                            </div>
                          </TableCell>

                          <TableCell className="align-middle">
                            <RowAvatars influencers={c.CampaignApplications} />
                          </TableCell>

                          <TableCell className="align-middle text-right flex justify-end gap-2">
                            {/* <Link
                              href={`/dashboard/brand/campaigns/${c.brand_id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                              >
                                View
                              </Button>
                            </Link> */}
                            <Link
                              href={`/dashboard/brand/campaigns/${c.id}/edit`}
                            >
                              <Button
                                size="sm"
                                className="cursor-pointer bg-secondary"
                              >
                                Edit Campaign
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>

                        {isOpen && (
                          <TableRow
                            className="bg-background/60"
                            aria-live="polite"
                          >
                            <TableCell colSpan={columnsCount} className="p-0">
                              <div
                                id={`campaign-details-${c.id}`}
                                className="grid gap-6 p-4 md:grid-cols-3"
                              >
                                {/* About Panel */}
                                <div className="md:col-span-2 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <h3 className="text-sm font-semibold">
                                      About this campaign
                                    </h3>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Detail label="Name" value={c.title} />
                                    <Detail
                                      label="Objective"
                                      value={c.objective}
                                    />
                                    <Detail
                                      label="Type"
                                      value={c.content_type}
                                    />
                                    {/* <Detail
                                      label="Budget"
                                      value={formatBudget(c.budget)}
                                      icon={
                                        <BadgeDollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                      }
                                    /> */}
                                    {/* <Detail
                                      label="Duration"
                                      value={c.duration}
                                      icon={
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                      }
                                    /> */}
                                    {/* <Detail
                                      label="Audience"
                                      value={c.target_audience}
                                      icon={
                                        <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                                      }
                                    /> */}
                                    <Detail
                                      label="Platform"
                                      value={c.platform}
                                      icon={
                                        <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                                      }
                                    />
                                    <Detail
                                      label="Media Link"
                                      value={c.media_kit_link}
                                      icon={
                                        <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                                      }
                                    />
                                    <Detail
                                      label="Breif Link"
                                      value={c.brief_link}
                                      icon={
                                        <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                                      }
                                    />
                                  </div>
                                  <DetailBlock
                                    title="Description"
                                    value={c.description}
                                  />
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DetailBlock
                                      title="Guidelines Do's"
                                      value={c.guidelines_do}
                                    />
                                    <DetailBlock
                                      title="Guidelines Dont's"
                                      value={c.guidelines_donot}
                                    />
                                    <DetailBlock
                                      title="Requirements"
                                      value={c.campaign_requirements}
                                    />
                                  </div>
                                </div>

                                {/* Influencers Panel */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      <h3 className="text-sm font-semibold">
                                        Influencers
                                      </h3>
                                    </div>
                                    <Badge variant="secondary">
                                      {c.CampaignApplications?.length || 0}{" "}
                                      apporved
                                    </Badge>
                                  </div>
                                  <div className="max-h-64 overflow-auto rounded-md border">
                                    {(c.CampaignApplications ?? []).length ===
                                    0 ? (
                                      <div className="p-4 text-xs text-muted-foreground">
                                        No influencers added for this campaign.
                                      </div>
                                    ) : (
                                      <ul className="divide-y">
                                        {c.CampaignApplications?.map((inf) => (
                                          <li
                                            key={inf.Influencer.id}
                                            className="flex items-center justify-between gap-3 p-3"
                                          >
                                            <div className="flex items-center gap-3">
                                              <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                  alt={inf.Influencer.full_name}
                                                  src={
                                                    inf.Influencer
                                                      .profile_image ||
                                                    "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                                                  }
                                                />
                                                <AvatarFallback>
                                                  {inf.Influencer.full_name
                                                    ?.slice(0, 1)
                                                    ?.toUpperCase() || "I"}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="text-sm font-medium">
                                                {inf.Influencer.full_name}
                                              </div>
                                            </div>
                                            {/* <Button
                                              size="sm"
                                              variant="outline"
                                              asChild
                                            >
                                              <Link
                                                href={`/brand/influencers?username=${inf.Influencer.full_name}`}
                                              >
                                                View profile
                                              </Link>
                                            </Button> */}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </BrandLayout>
  );
}

function Detail({ label, value, icon }) {
  if (value === undefined || value === null || value === "") {
    return <div className="text-xs text-muted-foreground">{label}: —</div>;
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon ? (
        icon
      ) : (
        <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className="text-xs uppercase text-muted-foreground">{label}</span>
      <span className="font-medium">{String(value)}</span>
    </div>
  );
}

function DetailBlock({ title, value }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase text-muted-foreground">{title}</div>
      <div className="rounded-md border bg-card p-3 text-sm">
        {String(value)}
      </div>
    </div>
  );
}

function formatBudget(budget) {
  if (budget === undefined || budget === null || budget === "")
    return undefined;
  const num = typeof budget === "string" ? Number(budget) : budget;
  if (Number.isFinite(num)) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return `$${num}`;
    }
  }
  return String(budget);
}
