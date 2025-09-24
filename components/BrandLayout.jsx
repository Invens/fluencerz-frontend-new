"use client";
import { useState } from "react";
import { useRoleGuard } from "@/middleware/useRoleGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PaperAirplaneIcon,
  UsersIcon,
  BriefcaseIcon,
  StarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  BriefcaseBusiness,
  BringToFrontIcon,
  icons,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  StickyNote,
  Target,
  User,
  User2Icon,
} from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function BrandLayout({ children }) {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useRoleGuard("brand");
  // const pathname = usePathname();

  // const navItems = [
  //   // { label: 'Dashboard', href: '/dashboard/brand', icon: HomeIcon },
  //   // { label: 'Requests', href: '/dashboard/brand/requests', icon: PaperAirplaneIcon },
  //   { label: 'Campaigns', href: '/dashboard/brand/campaigns', icon: BriefcaseIcon },
  //   {label: 'Applications', href: '/dashboard/brand/Applications', icon: BriefcaseBusiness},
  //   // {lable: 'Influencers', href: '/dashboard/brand/influencers', icon: User2Icon},
  //   {label: 'Influencers', href: '/dashboard/brand/influencers', icon: BringToFrontIcon},
  //   {label: 'Active Campaigns', href: '/dashboard/brand/approved-influencers', icon: BringToFrontIcon},

  //   // { label: 'Ratings', href: '/dashboard/brand/ratings', icon: StarIcon },
  //   { label: 'Settings', href: '/dashboard/brand/settings', icon: CogIcon },
  // ];

  const { theme, setTheme } = useTheme();

  function NavItem({ href, label, icon }) {
    const pathname = usePathname();
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center text-foreground gap-2 rounded-md px-3 py-2 text-sm ${
          active
            ? "bg-primary/10 text-primary font-semibold "
            : " hover:bg-muted"
        }`}
        aria-current={active ? "page" : undefined}
      >
        {icon} {label}
      </Link>
    );
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:block border-r bg-background">
        <div className="p-4 sticky top-0">
          <div className="mb-4">
            <Link href="/" className="font-semibold text-foreground">
              <Image
                alt="_Logo"
                className="w-42 h-18"
                src={`${
                  theme == "dark" ? "/fluencerz.png" : "/fluencerz-dark.png"
                }`}
                height={100}
                width={100}
              />
            </Link>
          </div>
          <nav className="grid gap-1">
            <NavItem
              href="/dashboard/brand"
              label="Dashboard"
              icon={<LayoutDashboard size={16} />}
            />

            <NavItem
              href="/dashboard/brand/campaigns"
              label="Campaigns"
              icon={<Target size={16} />}
            />
            <NavItem
              href="/dashboard/brand/applications"
              label="Applications"
              icon={<StickyNote size={16} />}
            />
             {/* <NavItem
              href="/dashboard/brand/report"
              label="Report"
              icon={<StickyNote size={16} />}
            /> */}
             <NavItem
              href="/dashboard/brand/approved-influencers"
              label="Active Campaigns"
              icon={<StickyNote size={16} />}
            />
            <NavItem
              href="/dashboard/brand/influencers"
              label="Influencers"
              icon={<User size={16} />}
            />
            {/* <NavItem href="/brand/estimator" label="Estimator" /> */}
            <NavItem
              href="/dashboard/brand/settings"
              label="Settings"
              icon={<Settings size={16} />}
            />
          </nav>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="md:hidden font-semibold text-foreground">
              <Image
                alt="toggle-logo"
                className="w-42 h-12"
                src={`${
                  theme == "dark" ? "/fluencerz.png" : "/fluencerz-dark.png"
                }`}
                height={100}
                width={100}
              />
            </Link>
            <div className="flex justify-end w-full items-center gap-2">
              <ModeToggle />
              <Button
                // onClick={() => logout()}
                variant={"link"}
                href={"#logout"}
              >
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile Sidebar Overlay //*/}
      {/* {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )} */}

      {/* Mobile Toggle Button  // */}
      {/* <button
        className="lg:hidden fixed top-20 left-4 z-60 p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-blue-600 transition-colors duration-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isSidebarOpen}
      >
        {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button> */}

      {/* Sidebar */}
      {/* <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-full lg:w-64 bg-white shadow-lg rounded-r-2xl overflow-y-auto transition-transform duration-300 z-50 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 sm:p-6 flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
            B
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Brand Panel
          </h1>
        </div>

        <nav className="flex flex-col gap-1 px-3 sm:px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                pathname === item.href
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
              }`}
              onClick={() => setIsSidebarOpen(false)}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 px-4 sm:px-6">
          <p className="text-xs sm:text-sm text-gray-500">© 2025 Brand Panel</p>
        </div>
      </aside> */}

      {/* Main Content */}
    </div>
  );
}
