'use client';
import { useEffect, useState } from 'react';
import BrandLayout from '@/components/BrandLayout';
import api from '@/utils/api';

export default function BrandApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const fetchApplications = async () => {
        try {
            const res = await api.get('/brand/applications/forwarded', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setApplications(res.data.data || []);
        } catch (err) {
            console.error('❌ Error fetching apps:', err);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    const handleDecision = async (id, decision) => {
        try {
          await api.post(
            `/brand/applications/${id}/decision`,
            { decision },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          fetchApplications();
        } catch (err) {
          console.error("❌ Decision error:", err);
        }
      };
      

    return (
        <BrandLayout>
            <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]">
                        Applications
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Review and decide on influencer applications for your campaigns.
                    </p>
                </div>

                {applications.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <svg
                            className="mx-auto h-10 w-10 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            No applications yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app) => (
                            <div
                                key={app.id}
                                className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
                            >
                                <div className="relative">
                                    <div className="h-24 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] opacity-80"></div>
                                    <img
                                        src={app.Influencer?.profile_picture_url || app.Influencer?.profile_image || 'https://via.placeholder.com/80'}
                                        alt={app.Influencer?.full_name}
                                        className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                                    />
                                </div>
                                <div className="pt-12 pb-4 px-5 text-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {app.Influencer?.full_name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Campaign: {app.Campaign?.title}
                                    </p>
                                    <div className="mt-4 flex space-x-3 justify-center">
                                        <button
                                            onClick={() => handleDecision(app.id, 'brand_approved')}
                                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDecision(app.id, 'reject')}
                                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => setSelectedInfluencer(app.Influencer)}
                                            className="px-3 py-1 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal for Influencer Details */}
                {selectedInfluencer && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl p-8 relative max-h-[90vh] overflow-y-auto m-4">
                            <button
                                onClick={() => setSelectedInfluencer(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold"
                            >
                                ✕
                            </button>

                            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#030203] via-[#fd1d1d] to-[#fcb045]">
                                {selectedInfluencer.full_name}'s Profile
                            </h2>

                            {/* Profile Section */}
                            <div className="flex items-center gap-6 mb-8 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                                <img
                                    src={
                                        selectedInfluencer.profile_image ||
                                        selectedInfluencer.instagramAccount?.profile_picture_url
                                    }
                                    alt={selectedInfluencer.full_name}
                                    className="w-20 h-20 rounded-full border object-cover"
                                />
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="font-semibold text-gray-800 dark:text-gray-200">Niche:</span> {selectedInfluencer.niche}</p>
                                    <p className="text-sm"><span className="font-semibold text-gray-800 dark:text-gray-200">Total Reach:</span> {selectedInfluencer.total_reach}</p>
                                    <p className="text-sm"><span className="font-semibold text-gray-800 dark:text-gray-200">Availability:</span> {selectedInfluencer.availability}</p>
                                </div>
                            </div>

                            {/* Instagram Insights */}
                            {selectedInfluencer.instagramAccount && (
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">📊 Instagram Insights</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 p-4 rounded-lg text-center shadow">
                                            <p className="font-semibold">Followers</p>
                                            <p className="text-xl">{selectedInfluencer.instagramAccount.followers_count}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 p-4 rounded-lg text-center shadow">
                                            <p className="font-semibold">Following</p>
                                            <p className="text-xl">{selectedInfluencer.instagramAccount.follows_count}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 p-4 rounded-lg text-center shadow">
                                            <p className="font-semibold">Posts</p>
                                            <p className="text-xl">{selectedInfluencer.instagramAccount.media_count}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-900 p-4 rounded-lg text-center shadow">
                                            <p className="font-semibold">Avg Reach</p>
                                            <p className="text-xl">{selectedInfluencer.instagramAccount.avg_reach}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-900 p-4 rounded-lg text-center shadow">
                                            <p className="font-semibold">Avg Views</p>
                                            <p className="text-xl">{selectedInfluencer.instagramAccount.avg_views}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-900 p-4 rounded-lg text-center shadow">
                                            <p className="font-semibold">Avg Likes</p>
                                            <p className="text-xl">{selectedInfluencer.instagramAccount.avg_likes}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-900 p-4 rounded-lg text-center shadow">
                                            <p className="font-semibold">Avg Comments</p>
                                            <p className="text-xl">{selectedInfluencer.instagramAccount.avg_comments}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-900 p-4 rounded-lg text-center shadow">
                                            <p className="font-semibold">Total Engagements</p>
                                            <p className="text-xl">{selectedInfluencer.instagramAccount.total_engagements}</p>
                                        </div>
                                    </div>

                                    {/* Audience Gender */}
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <h4 className="font-semibold text-lg mb-2">👥 Audience Gender</h4>
                                        <ul className="space-y-1 text-sm">
                                            {Object.entries(JSON.parse(selectedInfluencer.instagramAccount.audience_gender || "{}")).map(([k, v]) => (
                                                <li key={k} className="flex justify-between">
                                                    <span>{k}</span> <span>{v}%</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Followers by Country */}
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <h4 className="font-semibold text-lg mb-2">🌍 Followers by Country</h4>
                                        <ul className="space-y-1 text-sm">
                                            {JSON.parse(selectedInfluencer.instagramAccount.followers_by_country || "[]").map((c, i) => (
                                                <li key={i} className="flex justify-between">
                                                    <span>{c.country}</span> <span>{c.count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Age Distribution */}
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <h4 className="font-semibold text-lg mb-2">📈 Audience Age Distribution</h4>
                                        <ul className="space-y-1 text-sm">
                                            {JSON.parse(selectedInfluencer.instagramAccount.audience_age_distribution || "[]").map((a, i) => (
                                                <li key={i} className="flex justify-between">
                                                    <span>{a.age_range}</span> <span>{a.percentage}%</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Audience City */}
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <h4 className="font-semibold text-lg mb-2">🏙 Audience City</h4>
                                        <ul className="space-y-1 text-sm">
                                            {JSON.parse(selectedInfluencer.instagramAccount.audience_city || "[]").map((c, i) => (
                                                <li key={i} className="flex justify-between">
                                                    <span>{c.city}</span> <span>{c.count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Last Day Insights */}
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <h4 className="font-semibold text-lg mb-2">📊 Last Day Insights</h4>
                                        {(() => {
                                            let dayInsights = JSON.parse(selectedInfluencer.instagramAccount.account_insights_day || "{}");
                                            return Object.entries(dayInsights).map(([metric, dataObj]) => {
                                                if (!dataObj?.data || dataObj.data.length === 0) return null;
                                                return (
                                                    <div key={metric} className="mb-4">
                                                        <p className="font-semibold capitalize">{metric.replace(/_/g, " ")}:</p>
                                                        <ul className="space-y-1 text-sm">
                                                            {dataObj.data.map((d, i) => (
                                                                d.values?.map((val, idx) => (
                                                                    <li key={`${i}-${idx}`} className="flex justify-between">
                                                                        <span>{d.name || metric}</span>
                                                                        <span>{val.value} (till {new Date(val.end_time).toLocaleDateString("en-US")})</span>
                                                                    </li>
                                                                ))
                                                            ))}
                                                        </ul>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>

                                    {/* Last 30 Days Insights */}
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <h4 className="font-semibold text-lg mb-2">📊 Last 30 Days Insights</h4>
                                        {(() => {
                                            let monthInsights = JSON.parse(selectedInfluencer.instagramAccount.account_insights_30days || "{}");
                                            return Object.entries(monthInsights).map(([metric, dataObj]) => {
                                                if (!dataObj?.data || dataObj.data.length === 0) return null;
                                                return (
                                                    <div key={metric} className="mb-4">
                                                        <p className="font-semibold capitalize">{metric.replace(/_/g, " ")}:</p>
                                                        <ul className="space-y-1 text-sm">
                                                            {dataObj.data.map((d, i) => (
                                                                d.values?.map((val, idx) => (
                                                                    <li key={`${i}-${idx}`} className="flex justify-between">
                                                                        <span>{d.name || metric}</span>
                                                                        <span>{val.value} (till {new Date(val.end_time).toLocaleDateString("en-US")})</span>
                                                                    </li>
                                                                ))
                                                            ))}
                                                        </ul>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>

                                    {/* Media With Insights */}
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <h4 className="font-semibold text-lg mb-2">🖼 Media With Insights</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {JSON.parse(selectedInfluencer.instagramAccount.media_with_insights || "[]").map((media) => (
                                                <div key={media.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow hover:shadow-md transition-shadow">
                                                    {media.media_type === "IMAGE" && (
                                                        <img src={media.media_url} alt={media.caption} className="rounded mb-2 w-full h-40 object-cover" />
                                                    )}
                                                    {media.media_type === "VIDEO" && (
                                                        <video src={media.media_url} controls className="rounded mb-2 w-full h-40 object-cover"></video>
                                                    )}
                                                    <p className="font-semibold text-sm truncate">{media.caption || "No Caption"}</p>
                                                    <a href={media.permalink} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">View Post</a>
                                                    <div className="mt-2 text-xs space-y-1">
                                                        {media.insights?.data?.map((insight) => (
                                                            <p key={insight.name}>
                                                                {insight.name.replace(/_/g, " ")}: {insight.values?.[0]?.value}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Portfolio */}
                            {selectedInfluencer.portfolio && (
                                <div className="mt-8 bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-2">📂 Portfolio</h3>
                                    <a href={selectedInfluencer.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                        View Portfolio
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </BrandLayout>
    );
}
