"use client";
import { useRoleGuard } from "@/middleware/useRoleGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Bell,
  Cog,
  LayoutDashboard,
  Star,
} from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function InfluencerLayout({ children }) {
  useRoleGuard("influencer");
  const { theme } = useTheme();
  const pathname = usePathname();

  function NavItem({ href, label, icon }) {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        aria-current={active ? "page" : undefined}
      >
        {icon} {label}
      </Link>
    );
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:block border-r bg-background">
        <div className="p-4 sticky top-0">
          {/* Logo */}
          <div className="mb-4">
            <Link href="/" className="font-semibold text-foreground">
              <Image
                alt="Influencer Panel Logo"
                className="w-42 h-18"
                src={theme === "dark" ? "/fluencerz.png" : "/fluencerz-dark.png"}
                height={100}
                width={100}
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="grid gap-1">
            <NavItem
              href="/dashboard/influencer"
              label="Dashboard"
              icon={<LayoutDashboard size={16} />}
            />
            <NavItem
              href="/dashboard/influencer/campaigns"
              label="Campaigns"
              icon={<Briefcase size={16} />}
            />
            <NavItem
              href="/dashboard/influencer/applications"
              label="Applications"
              icon={<Star size={16} />}
            />
            <NavItem
              href="/dashboard/influencer/notifications"
              label="Notifications"
              icon={<Bell size={16} />}
            />
            <NavItem
              href="/dashboard/influencer/settings"
              label="Settings"
              icon={<Cog size={16} />}
            />
          </nav>
        </div>
      </aside>

      {/* Main Layout */}
      <div className="flex min-h-dvh flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Logo */}
            <Link href="/" className="md:hidden font-semibold text-foreground">
              <Image
                alt="Influencer Logo Mobile"
                className="w-42"
                src={theme === "dark" ? "/fluencerz.webp" : "/fluencerz-black.png"}
                height={100}
                width={100}
              />
            </Link>

            <div className="flex justify-end w-full items-center gap-2">
              <ModeToggle />
              <Button variant="link" href="#logout">
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
