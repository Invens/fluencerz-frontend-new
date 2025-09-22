'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLayout from '@/components/BrandLayout';
import api from '@/utils/api';

const API_BASE_URL = "https://api.fluencerz.com";

// Safe JSON parser
function parseJSON(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Avatar with fallback on error
function Avatar({ name, image }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative">
      {image && !imgError ? (
        <img
          src={`${API_BASE_URL}${image}`}
          alt={name}
          onError={() => setImgError(true)}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-200 font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm">
          {name?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setInfluencers(res.data || []);
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

  useEffect(() => {
    let result = influencers;

    if (nicheFilter) {
      result = result.filter(
        (inf) => inf.niche?.toLowerCase() === nicheFilter.toLowerCase()
      );
    }

    if (platformFilter) {
      result = result.filter((inf) => {
        const sp = parseJSON(inf.social_platforms);
        return sp.some(
          (p) => p.platform.toLowerCase() === platformFilter.toLowerCase()
        );
      });
    }

    if (minFollowers) {
      result = result.filter(
        (inf) => inf.followers_count >= parseInt(minFollowers)
      );
    }

    if (maxFollowers) {
      result = result.filter(
        (inf) => inf.followers_count <= parseInt(maxFollowers)
      );
    }

    setFiltered(result);
  }, [nicheFilter, platformFilter, minFollowers, maxFollowers, influencers]);

  if (loading) {
    return (
      <BrandLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-indigo-500" />
        </div>
      </BrandLayout>
    );
  }

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
      <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Influencer Directory
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} influencer{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Niche
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
              >
                <option value="">All Niches</option>
                {niches.map((n, idx) => (
                  <option key={idx} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Platform
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="">All Platforms</option>
                {platforms.map((p, idx) => (
                  <option key={idx} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Min Followers
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Max Followers
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={maxFollowers}
                onChange={(e) => setMaxFollowers(e.target.value)}
                placeholder="50000"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setNicheFilter('');
              setPlatformFilter('');
              setMinFollowers('');
              setMaxFollowers('');
            }}
            className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-gray-600 text-indigo-600 dark:text-white rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-500 transition font-medium"
          >
            Clear Filters
          </button>
        </div>

        {/* Influencer Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No influencers match your criteria.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Try adjusting the filters to find more results.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((inf) => {
              const socialPlatforms = parseJSON(inf.social_platforms);
              return (
                <div
                  key={inf.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <Avatar name={inf.full_name} image={inf.profile_image} />
                  <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                    {inf.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {inf.niche || 'No niche'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-4 w-full text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Followers</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {inf.followers_count?.toLocaleString() || '—'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Platforms</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {socialPlatforms.length}
                      </p>
                    </div>
                  </div>

                  {/* Platforms */}
                  {socialPlatforms.length > 0 && (
                    <div className="mt-4 w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-300 font-medium text-sm mb-2">
                        Social Platforms
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        {socialPlatforms.map((sp, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span className="capitalize">{sp.platform}</span>
                            <span className="font-semibold">
                              {parseInt(sp.followers).toLocaleString()} followers
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link
                    href={`/dashboard/brand/influencers/${inf.id}`}
                    className="mt-6 w-full px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    View Profile
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BrandLayout>
  );
}