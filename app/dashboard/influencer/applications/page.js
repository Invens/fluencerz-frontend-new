'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import InfluencerLayout from '@/components/InfluencerLayout';
import Link from 'next/link';
import { Calendar, CheckCircle, Clock, FileText, MessageSquare } from 'lucide-react';

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
        console.error('❌ Failed to fetch applied campaigns:', err);
        setError('Could not load applied campaigns.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedCampaigns();
  }, []);

  if (loading)
    return <p className="text-center mt-10 text-muted-foreground">Loading campaigns...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (campaigns.length === 0)
    return <p className="text-center mt-10 text-muted-foreground">You haven’t applied to any campaigns yet.</p>;

  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle size={14} /> Approved
        </span>
      );
    }
    if (status === 'pending' || status === 'brand_approved') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
          <Clock size={14} /> Pending
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
        <FileText size={14} /> Applied
      </span>
    );
  };

  return (
    <InfluencerLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">My Applied Campaigns</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your applications and collaborate with brands.
          </p>
        </div>

        {/* Campaign Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((app) => (
            <div
              key={app.application_id}
              className="flex flex-col bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >
              {/* Campaign Image */}
              {app.campaign.feature_image && (
                <div className="relative w-full h-40">
                  <img
                    src={`https://api.fluencerz.com${app.campaign.feature_image}`}
                    alt={app.campaign.title}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                  <div className="absolute top-3 right-3">{getStatusBadge(app.status)}</div>
                </div>
              )}

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                {/* Brand */}
                <div className="flex items-center gap-2 mb-3">
                  {app.Brand?.profile_picture && (
                    <img
                      src={`https://api.fluencerz.com${app.Brand.profile_picture}`}
                      alt={app.Brand.company_name}
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {app.Brand?.company_name}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                  {app.campaign.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {app.campaign.description}
                </p>

                {/* Applied Date */}
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <Calendar size={14} className="mr-1" />
                  Applied on {new Date(app.applied_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-wrap gap-3 text-sm">
                  <Link
                    href={`/dashboard/influencer/campaigns/${app.campaign.id}`}
                    className="flex-1 text-center px-4 py-2 rounded-lg border bg-background hover:bg-muted transition text-sm font-medium"
                  >
                    View Details
                  </Link>

                  {app.campaign.brief_link && (
                    <a
                      href={app.campaign.brief_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-4 py-2 rounded-lg border bg-background hover:bg-muted transition text-sm font-medium"
                    >
                      Brief
                    </a>
                  )}

                  {app.status === 'approved' && (
                    <Link
                      href={`/dashboard/influencer/campaigns/${app.campaign.id}/chat`}
                      className="w-full text-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow hover:from-purple-600 hover:to-blue-600 transition text-sm font-medium"
                    >
                      <MessageSquare size={14} className="inline mr-1" />
                      Media Library
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
