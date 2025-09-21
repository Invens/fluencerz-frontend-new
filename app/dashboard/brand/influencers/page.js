'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLayout from '@/components/BrandLayout';
import api from '@/utils/api';

const API_BASE_URL = "https://api.fluencerz.com";

// Helper: Parse JSON safely
function parseJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

// Helper: Avatar fallback (first letter)
function Avatar({ name, image }) {
  if (image) {
    return (
      <img
        src={`${API_BASE_URL}${image}`}
        alt={name}
        className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-md"
      />
    );
  }
  return (
    <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xl shadow-md">
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [nicheFilter, setNicheFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [maxFollowers, setMaxFollowers] = useState('');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const res = await api.get('/brand/influencers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInfluencers(res.data || []); // API is returning array directly
        setFiltered(res.data || []);
      } catch (err) {
        console.error('❌ Error fetching influencers:', err);
        setInfluencers([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = influencers;

    if (nicheFilter) {
      result = result.filter((inf) =>
        inf.niche?.toLowerCase() === nicheFilter.toLowerCase()
      );
    }

    if (platformFilter) {
      result = result.filter((inf) => {
        const sp = parseJSON(inf.social_platforms);
        return sp.some((p) => p.platform.toLowerCase() === platformFilter.toLowerCase());
      });
    }

    if (minFollowers) {
      result = result.filter((inf) => inf.followers_count >= parseInt(minFollowers));
    }

    if (maxFollowers) {
      result = result.filter((inf) => inf.followers_count <= parseInt(maxFollowers));
    }

    setFiltered(result);
  }, [nicheFilter, platformFilter, minFollowers, maxFollowers, influencers]);

  if (loading) {
    return (
      <BrandLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-10 w-10 rounded-full border-t-4 border-indigo-600" />
        </div>
      </BrandLayout>
    );
  }

  // Unique values for filters
  const niches = [...new Set(influencers.map((inf) => inf.niche).filter(Boolean))];
  const platforms = [
    ...new Set(
      influencers.flatMap((inf) =>
        parseJSON(inf.social_platforms).map((sp) => sp.platform)
      )
    ),
  ].filter(Boolean);

  return (
    <BrandLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Influencers Directory
        </h2>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Niche</label>
            <select
              className="border rounded px-3 py-2 text-sm w-40 dark:bg-gray-700 dark:text-white"
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
            >
              <option value="">All</option>
              {niches.map((n, idx) => (
                <option key={idx} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select
              className="border rounded px-3 py-2 text-sm w-40 dark:bg-gray-700 dark:text-white"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="">All</option>
              {platforms.map((p, idx) => (
                <option key={idx} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Min Followers</label>
            <input
              type="number"
              className="border rounded px-3 py-2 text-sm w-32 dark:bg-gray-700 dark:text-white"
              value={minFollowers}
              onChange={(e) => setMinFollowers(e.target.value)}
              placeholder="e.g. 1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Followers</label>
            <input
              type="number"
              className="border rounded px-3 py-2 text-sm w-32 dark:bg-gray-700 dark:text-white"
              value={maxFollowers}
              onChange={(e) => setMaxFollowers(e.target.value)}
              placeholder="e.g. 50000"
            />
          </div>

          <button
            onClick={() => {
              setNicheFilter('');
              setPlatformFilter('');
              setMinFollowers('');
              setMaxFollowers('');
            }}
            className="ml-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Reset
          </button>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-10">
            No influencers found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((inf) => {
              const socialPlatforms = parseJSON(inf.social_platforms);
              return (
                <div
                  key={inf.id}
                  className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  {/* Banner */}
                  <div className="h-20 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" />

                  {/* Avatar */}
                  <div className="relative -mt-10 flex justify-center">
                    <Avatar name={inf.full_name} image={inf.profile_image} />
                  </div>

                  {/* Body */}
                  <div className="text-center px-4 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {inf.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {inf.niche || 'No niche'}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <p className="text-gray-500 dark:text-gray-300">Followers</p>
                        <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {inf.followers_count?.toLocaleString() || '—'}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <p className="text-gray-500 dark:text-gray-300">Platforms</p>
                        <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {socialPlatforms.length}
                        </p>
                      </div>
                    </div>

                    {/* Social Platforms */}
                    {socialPlatforms.length > 0 && (
                      <div className="mt-4 text-xs text-left bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                          Platforms:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {socialPlatforms.map((sp, idx) => (
                            <li key={idx}>
                              <span className="capitalize">{sp.platform}</span> —{' '}
                              <span className="font-semibold">
                                {parseInt(sp.followers).toLocaleString()}
                              </span>{' '}
                              followers
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex justify-center gap-3">
                      <Link
                        href={`/dashboard/brand/influencers/${inf.id}`}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BrandLayout>
  );
}
