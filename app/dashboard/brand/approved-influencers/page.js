'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLayout from '@/components/BrandLayout';
import api from '@/utils/api';

const API_BASE_URL = "https://api.fluencerz.com";

export default function ActiveCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/brand/approved-influencers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(res.data.campaigns || []);
    } catch (err) {
      console.error('❌ Error fetching campaigns:', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <BrandLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-10">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]">
            Active Campaigns & Influencers
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
            See which influencers are actively collaborating with your campaigns.
          </p>
        </div>

        {/* Empty State */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white/70 dark:bg-gray-800/50 rounded-xl shadow-lg">
            <p className="text-gray-500">No active campaigns with influencers yet.</p>
          </div>
        ) : (
          campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* Campaign Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{c.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status: {c.status}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  {c.influencers.length} influencers
                </span>
              </div>

              {/* Influencers Grid */}
              {c.influencers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {c.influencers.map((inf) => (
                    <div
                      key={inf.id}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 shadow hover:shadow-lg transition"
                    >
                      <div className="flex flex-col items-center text-center">
                        <img
                          src={
                            inf.profile_picture_url ||
                            (inf.profile_image ? `${API_BASE_URL}${inf.profile_image}` : '/default-avatar.png')
                          }
                          alt={inf.full_name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md mb-3"
                        />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{inf.full_name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{inf.niche}</p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-600 dark:text-gray-300">
                        <div className="bg-white dark:bg-gray-700 p-2 rounded shadow text-center">
                          <p className="font-semibold">{inf.followers_count}</p>
                          <p>Followers</p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-2 rounded shadow text-center">
                          <p className="font-semibold">{inf.engagement_rate}%</p>
                          <p>Engagement</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex space-x-3 justify-center">
                        <Link
                          href={`/dashboard/brand/chat/${c.id}`}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                        >
                          Chat
                        </Link>
                        <Link
                          href={`/dashboard/brand/influencers/${inf.id}`}
                          className="px-3 py-1 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-lg hover:opacity-90 text-sm"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-6 text-gray-500 text-sm">No influencers for this campaign.</p>
              )}
            </div>
          ))
        )}
      </div>
    </BrandLayout>
  );
}
