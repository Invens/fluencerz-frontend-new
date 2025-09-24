"use client";

import useSWR from "swr";
import { postDecision, getApplications } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApplicationCard } from "@/components/brand/application-card";
import BrandLayout from "@/components/BrandLayout";

export default function BrandApplicationsPage() {
  const { data, error, mutate } = useSWR(
    "/brand/applications/forwarded",
    async () => {
      const res = await getApplications();
      return res || [];
    }
  );

  const applications = data || [];
  const isLoading = !data && !error;

  const handleDecision = async (id, decision) => {
    try {
      await postDecision(id, decision);
      await mutate();
    } catch (e) {
      console.error("[decision error]:", e.message);
    }
  };

  return (
    <BrandLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Applications
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and decide on influencer applications for your campaigns.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            aria-label="Refresh applications"
          >
            Refresh
          </Button>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg bg-muted h-36 border border-border"
              />
            ))}
          </div>
        ) : error ? (
          <div className="border border-destructive rounded-lg p-4">
            <p className="text-sm">
              There was an error loading applications. Please try again.
            </p>
            <Button className="mt-3" size="sm" onClick={() => mutate()}>
              Retry
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <section className="border border-border rounded-lg p-8 bg-card text-center">
            <p className="text-foreground font-medium">No applications yet</p>
            <p className="text-muted-foreground text-sm">
              When creators apply to your campaigns, they’ll appear here.
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => mutate()}>
                Check again
              </Button>
            </div>
          </section>
        ) : (
          <section
            className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4")}
          >
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onApprove={() => handleDecision(app.id, "brand_approved")}
                onReject={() => handleDecision(app.id, "reject")}
              />
            ))}
          </section>
        )}
      </div>
    </BrandLayout>
  );
}
