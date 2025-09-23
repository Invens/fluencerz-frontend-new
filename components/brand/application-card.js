"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export function ApplicationCard({
  app,
  onApprove,
  onReject,
  onDetails,
  className,
}) {
  const influencerName = app.Influencer?.full_name || "Unknown Influencer";
  const avatarSrc =
    app.Influencer?.profile_picture_url ||
    app.Influencer?.profile_image ||
    undefined;
  const campaignTitle = app.Campaign?.title || "Untitled Campaign";

  const requester = getRequester(app);

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={avatarSrc || "/placeholder.svg"}
            alt={influencerName}
          />
          <AvatarFallback aria-hidden>
            {influencerName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <CardTitle className="text-base text-foreground text-pretty truncate">
            {influencerName}
          </CardTitle>
          <p className="text-xs text-muted-foreground truncate">
            Campaign: {campaignTitle}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {requester && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Requested by
            </Badge>
            <div className="flex items-center gap-2 min-w-0">
              {requester.avatar ? (
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={requester.avatar || "/placeholder.svg"}
                    alt={requester.name}
                  />
                  <AvatarFallback aria-hidden>
                    {String(requester.name || "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : null}
              <span className="text-sm text-foreground truncate">
                {requester.name}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={onApprove}>
            Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={onReject}>
            Reject
          </Button>
          <Button size="sm" variant="secondary" onClick={onDetails}>
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
