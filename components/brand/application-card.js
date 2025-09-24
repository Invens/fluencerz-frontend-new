"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const API_HOST = "https://api.fluencerz.com";

function getRequester(app) {
  const candidate =
    app.forwardedByUser ||
    app.forwarded_by_user ||
    app.requested_by_user ||
    app.requester ||
    app.ForwardedBy ||
    app.forwardedBy ||
    null;

  if (!candidate) return null;
  if (typeof candidate === "string") return { name: candidate };
  if (typeof candidate === "object" && candidate !== null) {
    return {
      name:
        candidate.full_name ||
        candidate.name ||
        candidate.username ||
        candidate.email ||
        "Unknown",
      avatar:
        candidate.profile_image ||
        candidate.profile_picture_url ||
        candidate.avatar_url ||
        undefined,
    };
  }
  return null;
}

export function ApplicationCard({ app, onApprove, onReject, className }) {
  const influencer = app.Influencer || {};
  const influencerName = influencer.full_name || "Unknown Influencer";

  // Always resolve image from your API host
  const avatarSrc = influencer.profile_image
    ? `${API_HOST}${influencer.profile_image}`
    : influencer.profile_picture_url || "/placeholder.svg";

  const campaignTitle = app.Campaign?.title || "Untitled Campaign";
  const requester = getRequester(app);

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      {/* Header */}
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={avatarSrc} alt={influencerName} />
          <AvatarFallback aria-hidden>
            {influencerName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold text-foreground truncate">
            {influencerName}
          </CardTitle>
          <p className="text-xs text-muted-foreground truncate">
            Campaign: {campaignTitle}
          </p>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex flex-col gap-3">
        {/* Extra influencer details */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="bg-muted/30 p-2 rounded-md text-center">
            <p className="font-semibold text-foreground">
              {influencer.followers_count || 0}
            </p>
            <p>Followers</p>
          </div>
          <div className="bg-muted/30 p-2 rounded-md text-center">
            <p className="font-semibold text-foreground">
              {influencer.engagement_rate || 0}%
            </p>
            <p>Engagement</p>
          </div>
          <div className="bg-muted/30 p-2 rounded-md text-center col-span-2">
            <p className="font-semibold text-foreground">
              {influencer.niche || "—"}
            </p>
            <p>Niche</p>
          </div>
        </div>

        {/* Requested by info */}
        {requester && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="rounded-full text-xs">
              Requested by
            </Badge>
            <div className="flex items-center gap-2 min-w-0">
              {requester.avatar && (
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                      requester.avatar?.startsWith("http")
                        ? requester.avatar
                        : `${API_HOST}${requester.avatar}`
                    }
                    alt={requester.name}
                  />
                  <AvatarFallback aria-hidden>
                    {String(requester.name || "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-sm text-foreground truncate">
                {requester.name}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button size="sm" onClick={onApprove}>
            Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={onReject}>
            Reject
          </Button>
          <Link href={`/dashboard/brand/influencers/${influencer.id || ""}`}>
            <Button size="sm" variant="secondary">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
