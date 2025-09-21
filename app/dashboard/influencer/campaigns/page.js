'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import InfluencerLayout from '@/components/InfluencerLayout';
import api from '@/utils/api';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const BASE_URL = "https://api.fluencerz.com";

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get('/influencer/campaigns/feed');
        setCampaigns(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <InfluencerLayout>
      <div className="mx-auto px-4 py-6 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Available Campaigns</h2>

        {campaigns.length === 0 ? (
          <p>No campaigns available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white flex flex-col rounded-xl shadow-lg border hover:shadow-2xl transition-shadow duration-300 p-0 transform hover:-translate-y-1" // Minimal 3D: subtle lift and deeper shadow on hover
                style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }} // Soft 3D shadow
              >
                {/* Brand + Title */}
                <div className="flex items-center gap-2 px-4 pt-4">
                  {/* <img
                    src={campaign.Brand?.profile_image || '/placeholder_brand.jpg'}
                    alt={campaign.Brand?.company_name || "Brand"}
                    className="w-7 h-7 rounded-full border bg-gray-200 object-cover"
                  /> */}
                  <span className="text-xs font-semibold text-gray-700">{campaign.Brand?.company_name}</span>
                </div>
                
                {/* Feature Image */}
                <div className="w-full h-36 flex items-center justify-center mt-3">
                  <img
                    src={campaign.feature_image ? `${BASE_URL}${campaign.feature_image}` : '/placeholder_campaign.jpg'}
                    alt={campaign.title}
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>
                
                {/* Title */}
                <div className="px-4 mt-3">
                  <div className="font-semibold text-[1rem] text-gray-900 truncate" title={campaign.title}>
                    {campaign.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate mb-1">{campaign.description}</div>
                </div>
                
                {/* Tags - Colorful */}
                <div className="flex flex-wrap items-center px-4 gap-y-1 mt-2 min-h-[1.75rem]">
                  <span className="inline-block px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1">
                    {campaign.content_type}
                  </span>
                  <span className="inline-block px-3 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-1">
                    {campaign.platform}
                  </span>
                </div>
                
                {/* Application Status - Colorful */}
                <div className="px-4 mt-2 mb-0.5">
                  <span className="inline-block rounded bg-green-100 text-green-700 text-xs px-2 py-1 font-semibold">
                    Applications open
                  </span>
                </div>
                
                {/* View Button - Colorful Gradient */}
                <div className="flex px-4 mt-4 mb-4">
                  <Link
                    href={`/dashboard/influencer/campaigns/${campaign.id}`}
                    className="w-full inline-block font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-2 text-center text-sm transition shadow-md hover:shadow-lg" // Colorful gradient + minimal 3D shadow
                  >
                    View campaign
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InfluencerLayout>
  );
}
