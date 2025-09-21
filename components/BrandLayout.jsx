'use client';
import { useState } from 'react';
import { useRoleGuard } from '@/middleware/useRoleGuard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  PaperAirplaneIcon,
  UsersIcon,
  BriefcaseIcon,
  StarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BriefcaseBusiness, BringToFrontIcon, icons, User2Icon } from 'lucide-react';

export default function BrandLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useRoleGuard('brand');
  const pathname = usePathname();

  const navItems = [
    // { label: 'Dashboard', href: '/dashboard/brand', icon: HomeIcon },
    // { label: 'Requests', href: '/dashboard/brand/requests', icon: PaperAirplaneIcon },
    { label: 'Campaigns', href: '/dashboard/brand/campaigns', icon: BriefcaseIcon },
    {label: 'Applications', href: '/dashboard/brand/Applications', icon: BriefcaseBusiness},
    // {lable: 'Influencers', href: '/dashboard/brand/influencers', icon: User2Icon},
    {label: 'Influencers', href: '/dashboard/brand/influencers', icon: BringToFrontIcon},
    {label: 'Active Campaigns', href: '/dashboard/brand/approved-influencers', icon: BringToFrontIcon},

    // { label: 'Ratings', href: '/dashboard/brand/ratings', icon: StarIcon },
    { label: 'Settings', href: '/dashboard/brand/settings', icon: CogIcon },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-20 left-4 z-60 p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-blue-600 transition-colors duration-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isSidebarOpen}
      >
        {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-full lg:w-64 bg-white shadow-lg rounded-r-2xl overflow-y-auto transition-transform duration-300 z-50 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo/Title */}
        <div className="p-4 sm:p-6 flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
            B
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Brand Panel
          </h1>
        </div>

        {/* Navigation */}
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

        {/* Footer */}
        <div className="absolute bottom-4 px-4 sm:px-6">
          <p className="text-xs sm:text-sm text-gray-500">© 2025 Brand Panel</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:pl-8 lg:pr-8">
        <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}