"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// safe parsing helpers
function safeParseObj(json) {
  if (!json) return {};
  try {
    const v = JSON.parse(json);
    return typeof v === "object" && v !== null ? v : {};
  } catch {
    return {};
  }
}
function safeParseArr(json) {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function InfluencerDetailsDialog({ influencer, open, onOpenChange }) {
  if (!influencer) return null;

  const name = influencer.full_name || "Influencer";
  const avatar =
    influencer.profile_image ||
    influencer.instagramAccount?.profile_picture_url ||
    undefined;

  const stats = [
    { label: "Followers", value: influencer.instagramAccount?.followers_count },
    { label: "Following", value: influencer.instagramAccount?.follows_count },
    { label: "Posts", value: influencer.instagramAccount?.media_count },
    { label: "Avg Reach", value: influencer.instagramAccount?.avg_reach },
    { label: "Avg Views", value: influencer.instagramAccount?.avg_views },
    { label: "Avg Likes", value: influencer.instagramAccount?.avg_likes },
    { label: "Avg Comments", value: influencer.instagramAccount?.avg_comments },
  ].filter((s) => s.value !== undefined && s.value !== null);

  const ig = influencer.instagramAccount;

  const audienceGender = safeParseObj(ig?.audience_gender);
  const followersByCountry = safeParseArr(ig?.followers_by_country);
  const audienceAge = safeParseArr(ig?.audience_age_distribution);
  const audienceCity = safeParseArr(ig?.audience_city);
  const dayInsights = safeParseObj(ig?.account_insights_day);
  const monthInsights = safeParseObj(ig?.account_insights_30days);
  const mediaWithInsights = safeParseArr(ig?.media_with_insights);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:min-w-5xl xl:min-w-7xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-balance">{name}</DialogTitle>
          <DialogDescription>
            Influencer profile and Instagram insights
          </DialogDescription>
        </DialogHeader>

        {/* Profile */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={
                avatar ||
                "/placeholder.svg?height=64&width=64&query=profile%20avatar"
              }
              alt={name}
            />
            <AvatarFallback aria-hidden>
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {influencer.niche ? (
              <div>
                <span className="text-muted-foreground">Niche: </span>
                <span className="text-foreground">{influencer.niche}</span>
              </div>
            ) : null}
            {influencer.total_reach ? (
              <div>
                <span className="text-muted-foreground">Total reach: </span>
                <span className="text-foreground">
                  {influencer.total_reach}
                </span>
              </div>
            ) : null}
            {influencer.availability ? (
              <div>
                <span className="text-muted-foreground">Availability: </span>
                <span className="text-foreground">
                  {influencer.availability}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Stat tiles */}
        {stats.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {stats.map((s) => (
              <Card key={s.label} className="bg-card">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-muted-foreground">
                    {s.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xl font-semibold text-foreground">
                    {s.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Audience breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Audience Gender */}
          {Object.keys(audienceGender).length > 0 ? (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Audience Gender</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm">
                  {Object.entries(audienceGender).map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between">
                      <span className="capitalize text-foreground">{k}</span>
                      <span className="text-muted-foreground">{v}%</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {/* Age Distribution */}
          {audienceAge.length > 0 ? (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">
                  Audience Age Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm">
                  {audienceAge.map((a, i) => (
                    <li
                      key={`${a.age_range}-${i}`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-foreground">{a.age_range}</span>
                      <span className="text-muted-foreground">
                        {a.percentage}%
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Followers by Country */}
          {followersByCountry.length > 0 ? (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Followers by Country</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm">
                  {followersByCountry.map((c, i) => (
                    <li
                      key={`${c.country}-${i}`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-foreground">{c.country}</span>
                      <span className="text-muted-foreground">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {/* Audience City */}
          {audienceCity.length > 0 ? (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Audience City</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm">
                  {audienceCity.map((c, i) => (
                    <li
                      key={`${c.city}-${i}`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-foreground">{c.city}</span>
                      <span className="text-muted-foreground">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Last Day Insights */}
        {Object.keys(dayInsights).length > 0 ? (
          <Card className="mt-4">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Last Day Insights</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {Object.entries(dayInsights).map(([metric, dataObj]) => {
                  if (!dataObj?.data || dataObj.data.length === 0) return null;
                  return (
                    <div key={metric}>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {metric.replace(/_/g, " ")}
                      </p>
                      <ul className="space-y-1 text-sm">
                        {dataObj.data.flatMap((d, i) =>
                          (d.values || []).map((val, idx) => (
                            <li
                              key={`${metric}-${i}-${idx}`}
                              className="flex items-center justify-between"
                            >
                              <span className="text-foreground">
                                {d.name || metric}
                              </span>
                              <span className="text-muted-foreground">
                                {val?.value}{" "}
                                {val?.end_time
                                  ? `(till ${new Date(
                                      val.end_time
                                    ).toLocaleDateString("en-US")})`
                                  : ""}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Last 30 Days Insights */}
        {Object.keys(monthInsights).length > 0 ? (
          <Card className="mt-4">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Last 30 Days Insights</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {Object.entries(monthInsights).map(([metric, dataObj]) => {
                  if (!dataObj?.data || dataObj.data.length === 0) return null;
                  return (
                    <div key={metric}>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {metric.replace(/_/g, " ")}
                      </p>
                      <ul className="space-y-1 text-sm">
                        {dataObj.data.flatMap((d, i) =>
                          (d.values || []).map((val, idx) => (
                            <li
                              key={`${metric}-${i}-${idx}`}
                              className="flex items-center justify-between"
                            >
                              <span className="text-foreground">
                                {d.name || metric}
                              </span>
                              <span className="text-muted-foreground">
                                {val?.value}{" "}
                                {val?.end_time
                                  ? `(till ${new Date(
                                      val.end_time
                                    ).toLocaleDateString("en-US")})`
                                  : ""}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Media with Insights */}
        {mediaWithInsights.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Media With Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mediaWithInsights.map((media) => (
                <Card key={media.id}>
                  <CardContent className="pt-4">
                    {media.media_type === "IMAGE" ? (
                      <img
                        src={media.media_url || "/placeholder.svg"}
                        alt={media.caption || "Media image"}
                        className="rounded mb-2 w-full h-40 object-cover"
                      />
                    ) : null}
                    {media.media_type === "VIDEO" ? (
                      <video
                        src={media.media_url}
                        className="rounded mb-2 w-full h-40 object-cover"
                        controls
                      />
                    ) : null}
                    <p className="text-sm font-medium text-foreground truncate">
                      {media.caption || "No caption"}
                    </p>
                    {media.permalink ? (
                      <a
                        href={media.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline text-muted-foreground"
                      >
                        View Post
                      </a>
                    ) : null}
                    <div className="mt-2 text-xs space-y-1">
                      {(media.insights?.data || []).map((ins) => (
                        <p key={ins.name} className="text-foreground">
                          {String(ins.name || "").replace(/_/g, " ")}:{" "}
                          {ins.values?.[0]?.value ?? "-"}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {/* Portfolio */}
        {influencer && influencer.portfolio ? (
          <Card className="mt-4">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <a
                href={influencer.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground"
              >
                View Portfolio
              </a>
            </CardContent>
          </Card>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
