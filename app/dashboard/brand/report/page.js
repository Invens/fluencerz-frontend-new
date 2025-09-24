'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/api';
import BrandLayout from '@/components/BrandLayout';
import Link from 'next/link';
import { FileDown, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [totals, setTotals] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await api.get(`/brand/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaign(res.data.data || res.data.campaign);
      } catch (err) {
        console.error('❌ Error fetching campaign:', err);
      }
    };
    fetchCampaign();
  }, [id]);

  // Fetch campaign report
  useEffect(() => {
    if (!id) return;
    const fetchReport = async () => {
      try {
        const res = await api.get(`/brand/campaigns/${id}/report`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeliverables(res.data.data.deliverables || []);
        setTotals(res.data.data.totals || {});
      } catch (err) {
        console.error('❌ Error fetching report:', err);
      }
    };
    fetchReport();
  }, [id]);

  if (!campaign) return <p className="text-center mt-10">Loading campaign...</p>;

  return (
    <BrandLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <a
            href={`https://api.fluencerz.com/api/brand/campaigns/${id}/report/pdf?token=${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg shadow hover:opacity-90"
          >
            <FileDown size={18} />
            Download PDF
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b mb-6">
          <button
            className={`pb-2 ${activeTab === 'overview' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-2 ${activeTab === 'deliverables' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('deliverables')}
          >
            Reports
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <p>{campaign.description}</p>
            <p className="text-sm text-gray-600">Status: {campaign.status}</p>
          </div>
        )}

        {activeTab === 'deliverables' && (
          <div>
            {/* Totals */}
            {totals && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(totals).map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center"
                  >
                    <p className="text-xs text-gray-500 capitalize">{k}</p>
                    <p className="text-lg font-bold">{v}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Deliverables Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                    <th className="p-3">Influencer</th>
                    <th className="p-3">Platform</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Metrics</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverables.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="p-3 flex items-center gap-2">
                        <img
                          src={
                            d.Influencer?.profile_image
                              ? `https://api.fluencerz.com${d.Influencer.profile_image}`
                              : '/default-avatar.png'
                          }
                          className="w-8 h-8 rounded-full"
                          alt={d.Influencer?.full_name}
                        />
                        {d.Influencer?.full_name}
                      </td>
                      <td className="p-3">{d.platform}</td>
                      <td className="p-3">{d.media_type}</td>
                      <td className="p-3">
                        {d.metrics &&
                          Object.entries(d.metrics).map(([k, v]) => (
                            <div key={k} className="text-xs">
                              {k}: {v}
                            </div>
                          ))}
                      </td>
                      <td className="p-3">
                        {d.status === 'approved' && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={14} /> Approved
                          </span>
                        )}
                        {d.status === 'submitted' && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Clock size={14} /> Submitted
                          </span>
                        )}
                        {d.status === 'rejected' && (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle size={14} /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="p-3 space-x-2">
                        <button
                          onClick={() =>
                            reviewDeliverable(d.id, 'approved')
                          }
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            reviewDeliverable(d.id, 'rejected')
                          }
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </BrandLayout>
  );

  async function reviewDeliverable(deliverableId, decision) {
    try {
      await api.post(
        `/brand/deliverables/${deliverableId}/review`,
        { decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh
      const res = await api.get(`/brand/campaigns/${id}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliverables(res.data.data.deliverables || []);
      setTotals(res.data.data.totals || {});
    } catch (err) {
      console.error('❌ Error reviewing deliverable:', err);
    }
  }
}
