  'use client';

  import { useEffect, useState } from 'react';
  import api from '@/utils/api';
  import InfluencerLayout from '@/components/InfluencerLayout';
  import Link from 'next/link';

  export default function AppliedCampaignsPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      const fetchAppliedCampaigns = async () => {
        const token = localStorage.getItem('token');
        try {
          const res = await api.get('/influencer/applied-campaigns', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCampaigns(res.data.data || []);
        } catch (err) {
          console.error('Failed to fetch applied campaigns:', err);
          setError('Could not load applied campaigns.');
        } finally {
          setLoading(false);
        }
      };
      fetchAppliedCampaigns();
    }, []);

    if (loading) return <p className="text-center mt-8">Loading...</p>;
    if (error) return <p className="text-red-600 text-center mt-8">{error}</p>;
    if (campaigns.length === 0)
      return <p className="text-center mt-8">You haven’t applied to any campaigns yet.</p>;

    return (
      <InfluencerLayout>
        <div className="max-w-5xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-6">📋 My Applied Campaigns</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map((app) => (
              <div
                key={app.application_id}
                className="bg-white flex flex-col rounded-xl shadow-lg border hover:shadow-2xl transition-shadow duration-300 p-0 transform hover:-translate-y-1"
                style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }}
              >
                {/* Campaign Image */}
                {app.campaign.feature_image && (
                  <img
                    src={`https://api.fluencerz.com${app.campaign.feature_image}`}
                    alt={app.campaign.title}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                )}

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">
                    {app.campaign.title}
                  </h3>

                  {/* Brand with logo */}
                  <div className="flex items-center gap-3 mb-2">
                    {app.campaign.Brand?.profile_image && (
                      <img
                        src={`https://api.fluencerz.com${app.campaign.Brand.profile_image}`}
                        alt={app.campaign.Brand.company_name}
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                    )}
                    <span className="text-sm text-gray-700 font-medium">
                      {app.campaign.Brand?.company_name}
                    </span>
                  </div>

                  {/* Status */}
                  <span
                    className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
                      app.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : app.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>

                  {/* Dates */}
                  <p className="text-xs text-gray-500 mb-3">
                    Applied on: {new Date(app.applied_at).toLocaleDateString()}
                  </p>

                  {/* Links */}
                  <div className="flex flex-wrap gap-3 text-sm mt-auto">
                    <Link
                      href={`/dashboard/influencer/campaigns/${app.campaign.id}`}
                      className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded hover:from-blue-600 hover:to-purple-600 transition-colors shadow-md hover:shadow-lg"
                    >
                      View Details
                    </Link>

                    {app.campaign.brief_link && (
                      <a
                        href={app.campaign.brief_link}
                        target="_blank"
                        className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm rounded hover:from-green-600 hover:to-blue-600 transition-colors shadow-md hover:shadow-lg"
                      >
                        Brief
                      </a>
                    )}

                    {/* ✅ Chat button only for approved campaigns */}
                    {app.status === 'approved' && (
                      <Link
                        href={`/dashboard/influencer/campaigns/${app.campaign.id}/chat`}
                        className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm rounded hover:from-pink-600 hover:to-red-600 transition-colors shadow-md hover:shadow-lg"
                      >
                        Chat
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </InfluencerLayout>
    );
  }
