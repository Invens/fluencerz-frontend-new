'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/api';
import InfluencerLayout from '@/components/InfluencerLayout';
import {
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/solid';

const parseJsonSafe = (val) => {
    if (!val) return null;
    try {
        if (typeof val === 'string') return JSON.parse(val);
        return val;
    } catch {
        return null;
    }
};

export default function CampaignDetailPage() {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [applied, setApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const BASE_URL = "https://api.fluencerz.com";

    useEffect(() => {
        const fetchCampaign = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await api.get(`/influencer/campaigns/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const c = res.data.campaign;
                setCampaign({
                    ...c,
                    eligibility_criteria: parseJsonSafe(c.eligibility_criteria),
                    campaign_requirements: parseJsonSafe(c.campaign_requirements),
                    guidelines_do: parseJsonSafe(c.guidelines_do),
                    guidelines_donot: parseJsonSafe(c.guidelines_donot),
                });
                setApplied(res.data.applied);
            } catch (err) {
                console.error('Failed to fetch campaign:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    const handleApply = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await api.post(`/influencer/campaigns/${id}/apply`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage(res.data.message);
            setApplied(true);
        } catch (err) {
            console.error('Application failed:', err);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!campaign) return <p>Campaign not found.</p>;

    return (
        <InfluencerLayout>
            <div className="flex min-h-screen bg-gray-50">
                <main className="flex-1 px-2 sm:px-6 py-6">
                    {/* Back Button */}
                    <div className="mb-5">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center text-gray-700 hover:text-blue-600 text-sm mb-3"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to campaigns
                        </button>
                    </div>

                    {/* Banner */}
                    <div className="relative flex flex-col md:flex-row bg-white rounded-xl shadow mb-6 overflow-hidden">
                        <img
                            src={`${BASE_URL}${campaign.feature_image}`}
                            alt="Campaign"
                            className="w-full md:w-80 h-48 md:h-auto object-cover"
                        />
                        <div className="flex-1 p-5">
                            <div className="flex items-center mb-2">
                             
                                <span className="font-medium text-gray-800">{campaign.Brand?.company_name}</span>
                            </div>
                          
                            <h1 className="text-xl sm:text-2xl font-bold">{campaign.title}</h1>
                            <div className="flex flex-wrap gap-2 my-3">
                                <span className="bg-gray-100 px-3 py-1 rounded text-sm">{campaign.platform}</span>
                                <span className="bg-gray-100 px-3 py-1 rounded text-sm">{campaign.content_type}</span>
                            </div>
                            <p className="text-gray-600 mb-3">{campaign.description}</p>
                            <div className="flex gap-4 flex-wrap">
                                <a
                                    href={campaign.media_kit_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-600 border rounded px-3 py-1 hover:bg-gray-100"
                                >
                                    Download media kit
                                </a>
                                <a
                                    href={campaign.Brand?.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-600 border rounded px-3 py-1 hover:bg-gray-100"
                                >
                                    Visit website
                                </a>
                                {!applied ? (
                                    <button
                                        onClick={handleApply}
                                        className="bg-blue-600 text-white px-5 py-1.5 rounded shadow hover:bg-blue-700 ml-auto"
                                    >
                                        Apply to campaign
                                    </button>
                                ) : (
                                    <p className="mt-2 text-green-600 font-semibold text-sm ml-auto">✅ Already Applied</p>
                                )}
                            </div>
                            {message && <p className="text-green-600 mt-2 text-sm">{message}</p>}
                        </div>
                    </div>

                    {/* Progress Steps */}
                    {/* <div className="flex justify-between items-center mb-8 px-1">
                        {['Application', 'AI review', 'Brand review', 'Accept terms', 'Submissions', 'Completed'].map(
                            (step, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center relative group">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-lg font-semibold ${i === 1
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'border-gray-300 text-gray-400 bg-white'
                                            }`}
                                    >
                                        {i + 1}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600">{step}</span>
                                    {i < 5 && (
                                        <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
                                    )}
                                </div>
                            )
                        )}
                    </div> */}

                    {/* Requirements and Eligibility Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Campaign requirements */}
                        <div className="bg-white rounded-xl shadow p-5">
                            <h4 className="font-semibold mb-3">Campaign requirements</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                {campaign.campaign_requirements &&
                                    Object.entries(campaign.campaign_requirements).map(([k, v], i) => (
                                        <li key={i}>
                                            <span className="font-medium">{k.replace(/_/g, ' ')}:</span> {v}
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        {/* Eligibility */}
                        <div className="bg-white rounded-xl shadow p-5">
                            <h4 className="font-semibold mb-3">Eligibility criteria</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                {campaign.eligibility_criteria &&
                                    Object.entries(campaign.eligibility_criteria).map(([k, v], i) => (
                                        <li key={i}>
                                            <span className="font-medium">{k.replace(/_/g, ' ')}:</span> {v}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>

                    {/* Guidelines Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Guidelines: Do */}
                        <div className="bg-white rounded-xl shadow p-5">
                            <h4 className="font-semibold mb-3 flex items-center gap-1 text-green-600">
                                <CheckCircleIcon className="w-5 h-5" /> Do
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                {campaign.guidelines_do &&
                                    Object.entries(campaign.guidelines_do).map(([k, v], i) => (
                                        <li key={i}>
                                            <span className="text-green-600 mr-1">✔</span>
                                            {k.replace(/_/g, ' ')}: {String(v)}
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        {/* Guidelines: Do not */}
                        <div className="bg-white rounded-xl shadow p-5">
                            <h4 className="font-semibold mb-3 flex items-center gap-1 text-red-600">
                                <XCircleIcon className="w-5 h-5" /> Do not
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                {campaign.guidelines_donot &&
                                    Object.entries(campaign.guidelines_donot).map(([k, v], i) => (
                                        <li key={i}>
                                            <span className="text-red-600 mr-1">✘</span>
                                            {k.replace(/_/g, ' ')}: {String(v)}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>

                    {/* Briefs */}
                    <div className="bg-white rounded-xl shadow p-5 mb-8">
                        <h4 className="font-semibold mb-3">Briefs</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                            {campaign.brief_link && (
                                <a
                                    href={campaign.brief_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    Campaign Details
                                </a>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </InfluencerLayout>
    );
}
