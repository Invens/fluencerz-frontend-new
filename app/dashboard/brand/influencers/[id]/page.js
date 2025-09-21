'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BrandLayout from '@/components/BrandLayout';
import api from '@/utils/api';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

// ---------- Helpers ----------
function safeParse(str, fallback) {
    try {
        return typeof str === 'string' ? JSON.parse(str) : str;
    } catch {
        return fallback;
    }
}

function Avatar({ name, image }) {
    if (image) {
        return (
            <img
                src={`https://api.fluencerz.com${image}`}
                alt={name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
            />
        );
    }
    return (
        <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-3xl font-bold border-4 border-white shadow">
            {name?.charAt(0).toUpperCase()}
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-white p-4 rounded-lg text-center shadow hover:shadow-md transition">
            <p className="text-gray-600 text-sm">{label}</p>
            <p className="text-xl font-bold">{value ?? '—'}</p>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-white p-5 rounded-lg shadow space-y-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            {children}
        </div>
    );
}

// Chart colors
const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

export default function InfluencerDetailPage() {
    const { id } = useParams();
    const [influencer, setInfluencer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/brand/influencers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setInfluencer(res.data.data);
            } catch (err) {
                console.error('❌ Error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <BrandLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin h-10 w-10 rounded-full border-t-4 border-indigo-600" />
                </div>
            </BrandLayout>
        );
    }

    if (!influencer) {
        return (
            <BrandLayout>
                <div className="text-center py-10 text-gray-500">Influencer not found</div>
            </BrandLayout>
        );
    }

    // Parse JSON fields
    const socialPlatforms = safeParse(influencer.social_platforms, []);
    const audienceGender = safeParse(influencer.audience_gender || "{}", {}); // ✅ always object
    const followersByCountry = safeParse(influencer.followers_by_country || "[]", []);
    const instagramAccount = influencer.instagramAccount || {};
    const dayInsights = safeParse(instagramAccount.account_insights_day || "{}", {});
    const monthInsights = safeParse(instagramAccount.account_insights_30_days || "{}", {});
    const mediaWithInsights = safeParse(instagramAccount.media_with_insights || "[]", []);


    // Prepare chart data
    const genderData = Object.entries(audienceGender).map(([k, v]) => ({ name: k, value: v }));
    const countryData = followersByCountry.map((c) => ({ name: c.country, value: c.percentage }));

    // ---------- Tabs ----------
    const tabs = ['Overview', 'Audience', 'Instagram Stats', 'Media'];

    return (
        <BrandLayout>
            <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-xl p-8 shadow text-white">
                    <Avatar name={influencer.full_name} image={influencer.profile_image} />
                    <div>
                        <h1 className="text-3xl font-bold">{influencer.full_name}</h1>
                        <p className="text-lg">{influencer.niche}</p>
                        {influencer.email && <p className="text-sm opacity-80">{influencer.email}</p>}
                        {influencer.phone && <p className="text-sm opacity-80">{influencer.phone}</p>}
                        {influencer.website && (
                            <a href={influencer.website} target="_blank" className="underline text-sm">
                                {influencer.website}
                            </a>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 border-b pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tab
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'Overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard label="Followers" value={influencer.followers_count?.toLocaleString()} />
                                <StatCard label="Engagement Rate" value={influencer.engagement_rate ? `${influencer.engagement_rate}%` : '—'} />
                                <StatCard label="Total Reach" value={influencer.total_reach?.toLocaleString()} />
                                <StatCard label="Availability" value={influencer.availability} />
                            </div>
                            {socialPlatforms.length > 0 && (
                                <Section title="🌐 Social Platforms">
                                    <ul className="space-y-1 text-sm">
                                        {socialPlatforms.map((sp, i) => (
                                            <li key={i} className="flex justify-between">
                                                <span>{sp.platform}</span>
                                                <span>{sp.followers}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Section>
                            )}
                        </div>
                    )}

                    {activeTab === 'Audience' && (
                        <div className="space-y-6">
                            <Section title="👥 Audience Gender">
                                {genderData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={100} label>
                                                {genderData.map((_, index) => (
                                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p>No data available</p>
                                )}
                            </Section>
                            <Section title="🌍 Followers by Country">
                                {countryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={countryData}>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#4f46e5" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p>No data available</p>
                                )}
                            </Section>
                            {influencer.audience_age_group && (
                                <Section title="📈 Audience Age Group">
                                    <p>{influencer.audience_age_group}</p>
                                </Section>
                            )}
                        </div>
                    )}

                    {activeTab === 'Instagram Stats' && (
                        <div className="space-y-6">
                            <Section title="📱 Instagram Account Stats">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard label="Avg Reach" value={instagramAccount.avg_reach} />
                                    <StatCard label="Avg Views" value={instagramAccount.avg_views} />
                                    <StatCard label="Avg Likes" value={instagramAccount.avg_likes} />
                                    <StatCard label="Avg Comments" value={instagramAccount.avg_comments} />
                                    <StatCard label="Total Engagements" value={instagramAccount.total_engagements} />
                                </div>
                            </Section>
                            {/* Last Day Insights */}
                            <Section title="📊 Account Insights (Last Day)">
                                {Object.entries(dayInsights).map(([metric, obj]) => (
                                    obj?.data?.length > 0 && (
                                        <div key={metric} className="mb-4">
                                            <p className="font-medium capitalize">{metric.replace(/_/g, ' ')}:</p>
                                            <ul className="space-y-1 text-sm">
                                                {obj.data.flatMap((d, i) =>
                                                    d.values?.map((val, j) => (
                                                        <li key={`${i}-${j}`} className="flex justify-between">
                                                            <span>{d.name || metric}</span>
                                                            <span>{val.value} {val.end_time && `(till ${new Date(val.end_time).toLocaleDateString()})`}</span>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                    )
                                ))}
                            </Section>

                            {/* Last 30 Days Insights */}
                            <Section title="📊 Account Insights (Last 30 Days)">
                                {Object.entries(monthInsights).map(([metric, obj]) => (
                                    obj?.data?.length > 0 && (
                                        <div key={metric} className="mb-4">
                                            <p className="font-medium capitalize">{metric.replace(/_/g, ' ')}:</p>
                                            <ul className="space-y-1 text-sm">
                                                {obj.data.flatMap((d, i) =>
                                                    d.values?.map((val, j) => (
                                                        <li key={`${i}-${j}`} className="flex justify-between">
                                                            <span>{d.name || metric}</span>
                                                            <span>{val.value} {val.end_time && `(till ${new Date(val.end_time).toLocaleDateString()})`}</span>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                    )
                                ))}
                            </Section>


                        </div>
                    )}

                    {activeTab === 'Media' && (
                        <div className="space-y-6">
                            <Section title="🖼 Media With Insights">
                                {mediaWithInsights.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No media insights available.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {mediaWithInsights.map((media) => (
                                            <div
                                                key={media.id}
                                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border border-gray-100 dark:border-gray-700"
                                            >
                                                {/* Media Preview */}
                                                <a href={media.permalink} target="_blank" rel="noopener noreferrer">
                                                    {media.media_type === 'IMAGE' && (
                                                        <img
                                                            src={media.media_url}
                                                            alt={media.caption}
                                                            className="w-full h-48 object-cover hover:opacity-90 transition"
                                                        />
                                                    )}
                                                    {media.media_type === 'VIDEO' && (
                                                        <video
                                                            src={media.media_url}
                                                            controls
                                                            className="w-full h-48 object-cover"
                                                        />
                                                    )}
                                                    {media.media_type === 'CAROUSEL_ALBUM' && (
                                                        <img
                                                            src={media.media_url}
                                                            alt={media.caption}
                                                            className="w-full h-48 object-cover"
                                                        />
                                                    )}
                                                </a>

                                                {/* Content */}
                                                <div className="p-4 space-y-3">
                                                    {/* Caption */}
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {media.caption || 'No caption'}
                                                    </p>

                                                    {/* Metrics */}
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        {media.insights?.data?.map((insight) => (
                                                            <div
                                                                key={insight.name}
                                                                className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md text-center"
                                                            >
                                                                <p className="text-gray-500 dark:text-gray-300 capitalize">
                                                                    {insight.name.replace(/_/g, ' ')}
                                                                </p>
                                                                <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                                    {insight.values?.[0]?.value ?? '—'}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* CTA */}
                                                    <div className="pt-2">
                                                        <a
                                                            href={media.permalink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                                        >
                                                            🔗 View on Instagram
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Section>
                        </div>
                    )}

                </div>
            </div>
        </BrandLayout>
    );
}
