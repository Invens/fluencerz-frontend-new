'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import InfluencerLayout from '@/components/InfluencerLayout';
import api from '@/utils/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

/* ----------------------------- helpers ----------------------------- */
const API_BASE = 'http://localhost:4004';

/** Parse value if it’s a JSON string; otherwise return as-is */
function parseMaybeJSON(v, fallback) {
  if (v == null) return fallback;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return fallback ?? v; }
  }
  return v;
}

function formatDateTime(d) {
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (!dt || isNaN(dt.getTime())) return '';
    return dt.toLocaleString();
  } catch {
    return '';
  }
}

/* ------------------------ DynamicListInput UI ----------------------- */
function DynamicListInput({ label, items, setItems, keys }) {
  const [newItem, setNewItem] = useState({});
  const [error, setError] = useState('');

  const handleChange = (key, value) => {
    setNewItem((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const validateItem = () => {
    if (!keys.every((k) => newItem[k] !== undefined && newItem[k] !== '')) {
      setError('All fields are required.');
      return false;
    }
    if ((label === 'Followers by Country' || label === 'Audience Gender %')) {
      const num = Number(newItem.percentage);
      if (Number.isNaN(num) || num < 0 || num > 100) {
        setError('Percentage must be between 0 and 100.');
        return false;
      }
    }
    if (label === 'Social Platforms') {
      const num = Number(newItem.followers);
      if (Number.isNaN(num)) {
        setError('Followers must be a valid number.');
        return false;
      }
    }
    return true;
  };

  const addItem = () => {
    if (!validateItem()) return;
    setItems([...items, newItem]);
    setNewItem({});
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setError('');
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-4">
      <label className="block text-base font-semibold text-gray-800">{label}</label>

      {items?.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition"
            >
              <span className="text-gray-800">
                {keys.map((k, i) => (
                  <span key={i}>
                    <span className="font-medium text-indigo-600">{item[k]}</span>
                    {i < keys.length - 1 ? <span className="mx-1 text-gray-500">•</span> : null}
                  </span>
                ))}
              </span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-500 hover:text-red-600 p-1 rounded-full transition"
                aria-label={`Remove ${label} item ${idx + 1}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">No {label.toLowerCase()} added yet.</p>
      )}

      <div className="flex gap-2 flex-wrap">
        {keys.map((key, i) => (
          <input
            key={i}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            className="flex-1 min-w-[120px] p-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={newItem[key] ?? ''}
            onChange={(e) => handleChange(key, e.target.value)}
            aria-label={`${key} for ${label}`}
            type={key === 'percentage' || key === 'followers' ? 'number' : 'text'}
          />
        ))}
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
          aria-label={`Add ${label}`}
        >
          + Add
        </button>
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}

/* ------------------------ Main Page Component ----------------------- */
export default function InfluencerSettingsPage() {
  const [profile, setProfile] = useState(null);
  const [instagram, setInstagram] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);            // page/global loader
  const [igRefreshing, setIgRefreshing] = useState(false); // instagram-only refresh state
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' | 'error'
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [countries, setCountries] = useState([]);
  const [genders, setGenders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  /* --------------------------- data fetching --------------------------- */
  const fetchProfile = async () => {
    const res = await api.get('/influencer/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProfile(res.data);
  };

  const fetchInstagram = async () => {
    // GET /connect/instagram/data
    const res = await axios.get(`${API_BASE}/connect/instagram/data`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const ig = res?.data?.data ?? null;

    if (!ig) {
      setInstagram(null);
      setMedia([]);
      return;
    }

    const account_insights_day = parseMaybeJSON(ig.account_insights_day, {});
    const account_insights_30days = parseMaybeJSON(ig.account_insights_30days, {});
    const media_with_insights = parseMaybeJSON(ig.media_with_insights, []);

    setInstagram({
      ...ig,
      account_insights_day,
      account_insights_30days,
      media_with_insights,
    });
    setMedia(media_with_insights);
    // This is simply "when UI fetched"; backend may not store last sync
    setLastRefreshedAt(new Date());
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await Promise.all([fetchProfile(), fetchInstagram().catch(() => {})]);
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!profile) return;
    setPlatforms(parseMaybeJSON(profile.social_platforms, []));
    setCountries(parseMaybeJSON(profile.followers_by_country, []));
    const genderObj = parseMaybeJSON(profile.audience_gender, {});
    const genderData = Object.entries(genderObj || {}).map(([gender, percentage]) => ({
      gender,
      percentage,
    }));
    setGenders(genderData);
  }, [profile]);

  /* --------------------------- profile update -------------------------- */
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setMsgType('');

    // simple guards
    const totalCountryPercentage = countries.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0);
    if (totalCountryPercentage > 100) {
      setMsg('Followers by country percentages must not exceed 100%.');
      setMsgType('error');
      setLoading(false);
      return;
    }
    const totalGenderPercentage = genders.reduce((sum, g) => sum + (parseFloat(g.percentage) || 0), 0);
    if (totalGenderPercentage > 100) {
      setMsg('Audience gender percentages must not exceed 100%.');
      setMsgType('error');
      setLoading(false);
      return;
    }

    const genderObject = genders.reduce((obj, { gender, percentage }) => {
      if (gender) obj[gender] = percentage;
      return obj;
    }, {});

    try {
      await api.put(
        '/influencer/update',
        {
          phone: profile.phone,
          skype: profile.skype,
          niche: profile.niche,
          followers_count: parseInt(profile.followers_count) || 0,
          total_reach: parseInt(profile.total_reach) || 0,
          audience_age_group: profile.audience_age_group,
          social_platforms: JSON.stringify(platforms),
          followers_by_country: JSON.stringify(countries),
          audience_gender: JSON.stringify(genderObject),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await api.patch('/influencer/upload-profile', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      }

      setMsg('Profile updated successfully!');
      setMsgType('success');
      setImageFile(null);
      setIsEditing(false);
      await fetchProfile();
    } catch (err) {
      setMsg('Update failed. Please try again.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------- instagram: refresh btn ---------------------- */
  const handleRefreshInstagram = async () => {
    if (!token) return;
    setMsg('');
    setMsgType('');
    setIgRefreshing(true);
    try {
      // Prefer new separate controller if you created it:
      // GET /connect/instagram/refresh-insights
      await axios.get(`${API_BASE}/connect/instagram/refresh-insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err1) {
      // Fallback to a simpler refresh endpoint if that’s what you wired:
      try {
        await axios.get(`${API_BASE}/connect/instagram/refresh`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err2) {
        console.error('❌ Failed to refresh Instagram data:', err2);
        setMsg('Failed to refresh Instagram data.');
        setMsgType('error');
        setIgRefreshing(false);
        return;
      }
    }

    try {
      await fetchInstagram(); // re-fetch fresh data
      setMsg('Instagram data refreshed successfully!');
      setMsgType('success');
      setLastRefreshedAt(new Date());
    } catch (err) {
      setMsg('Refreshed, but failed to load latest data into the page.');
      setMsgType('error');
    } finally {
      setIgRefreshing(false);
    }
  };

  /* ------------------------------- render ------------------------------ */
  if (loading) {
    return (
      <InfluencerLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-600" />
        </div>
      </InfluencerLayout>
    );
  }

  if (error) {
    return (
      <InfluencerLayout>
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <p className="text-base font-semibold text-red-600">Error loading profile</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <button
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                await fetchProfile();
              } finally {
                setLoading(false);
              }
            }}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </InfluencerLayout>
    );
  }

  return (
    <InfluencerLayout>
      <div className="py-10 bg-gray-100 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          {/* global toast-ish message */}
          {msg && (
            <div
              className={`mb-4 rounded-md p-3 text-sm ${
                msgType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
              }`}
              role="alert"
            >
              {msg}
            </div>
          )}

          <div className="space-y-8">
            {/* ----------------------- Influencer Profile Card ----------------------- */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="sticky top-0 bg-indigo-50 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Influencer Profile</h2>
                    <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800">
                      Visit FluencerZ
                    </Link>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('userType');
                      window.location.href = '/';
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    aria-label="Log out"
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {profile && !isEditing ? (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={
                          profile.profile_image ? `${API_BASE}${profile.profile_image}` : '/default-avatar.png'
                        }
                        alt="Profile"
                        className="h-20 w-20 rounded-full object-cover border border-gray-200"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mt-2">{profile.full_name}</h3>
                    <p className="text-sm text-gray-500">{profile.niche || 'Add your niche'}</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
                      aria-label="Edit profile"
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} className="space-y-6 transition-all duration-300">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img
                          src={
                            imageFile
                              ? URL.createObjectURL(imageFile)
                              : profile?.profile_image
                              ? `${API_BASE}${profile.profile_image}`
                              : '/default-avatar.png'
                          }
                          alt="Profile"
                          className="h-20 w-20 rounded-full object-cover border border-gray-200"
                        />
                        <label
                          htmlFor="profile-image"
                          className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-indigo-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </label>
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                          className="hidden"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mt-2">{profile?.full_name}</h3>
                      <p className="text-sm text-gray-500">{profile?.niche || 'Add your niche'}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          disabled
                          value={profile?.email || ''}
                          className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed"
                          aria-disabled="true"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          name="phone"
                          value={profile?.phone || ''}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          placeholder="Phone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Skype</label>
                        <input
                          name="skype"
                          value={profile?.skype || ''}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          placeholder="Skype"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Niche</label>
                        <input
                          name="niche"
                          value={profile?.niche || ''}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          placeholder="Niche"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Followers Count</label>
                        <input
                          type="number"
                          name="followers_count"
                          value={profile?.followers_count || 0}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          placeholder="Followers Count"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Audience Age Group</label>
                        <input
                          name="audience_age_group"
                          value={profile?.audience_age_group || ''}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          placeholder="18-24"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Reach</label>
                        <input
                          type="number"
                          name="total_reach"
                          value={profile?.total_reach || ''}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          placeholder="Total Reach"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <DynamicListInput
                        label="Social Platforms"
                        items={platforms}
                        setItems={setPlatforms}
                        keys={['platform', 'followers']}
                      />
                      <DynamicListInput
                        label="Followers by Country"
                        items={countries}
                        setItems={setCountries}
                        keys={['country', 'percentage']}
                      />
                      <DynamicListInput
                        label="Audience Gender %"
                        items={genders}
                        setItems={setGenders}
                        keys={['gender', 'percentage']}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                          disabled={loading}
                          aria-label={loading ? 'Updating profile' : 'Update profile'}
                        >
                          {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="w-full sm:w-auto px-6 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition"
                          aria-label="Cancel editing"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* ------------------------ Instagram Account Card ----------------------- */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="sticky top-0 bg-indigo-50 p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Instagram Account</h3>
              </div>

              <div className="p-6 space-y-8">
                {!instagram ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-8 bg-gray-50 rounded-lg shadow-inner">
                    <p className="text-gray-600 text-base font-medium">
                      Connect your Instagram to unlock content and analytics.
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          const res = await axios.get(`${API_BASE}/connect/auth/instagram`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          window.location.href = res.data.url;
                        } catch {
                          setMsg('Failed to initiate Instagram connection.');
                          setMsgType('error');
                        }
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md"
                    >
                      Connect Instagram
                    </button>
                  </div>
                ) : (
                  <>
                    {/* top profile strip */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl shadow-md">
                      <img
                        src={instagram.profile_picture_url || '/default-avatar.png'}
                        alt={instagram.username}
                        className="h-28 w-28 rounded-full border-4 border-white shadow-lg object-cover"
                        onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                      />
                      <div className="space-y-2 text-center sm:text-left">
                        <p className="text-xl font-bold text-gray-900">@{instagram.username}</p>
                        <p className="text-sm text-gray-600 italic line-clamp-3">
                          {instagram.biography || 'No bio available'}
                        </p>
                        {instagram.website ? (
                          <a
                            href={instagram.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium break-all"
                          >
                            {instagram.website}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No website provided</p>
                        )}
                        <div className="flex gap-4 justify-center sm:justify-start">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold text-indigo-600">
                              {instagram.followers_count?.toLocaleString() || 0}
                            </span>{' '}
                            Followers
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold text-indigo-600">
                              {instagram.follows_count?.toLocaleString() || 0}
                            </span>{' '}
                            Following
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold text-indigo-600">
                              {instagram.media_count || 0}
                            </span>{' '}
                            Posts
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* refresh + metrics */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Account Metrics</h4>
                        <div className="flex items-center gap-3">
                          {lastRefreshedAt && (
                            <span className="text-xs text-gray-500">
                              Last synced: {formatDateTime(lastRefreshedAt)}
                            </span>
                          )}
                          <button
                            onClick={handleRefreshInstagram}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition disabled:opacity-60
                                       bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
                            disabled={igRefreshing}
                            aria-label="Refresh Instagram Data"
                          >
                            {igRefreshing ? (
                              <>
                                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Refreshing…
                              </>
                            ) : (
                              <>
                                <span>🔄</span> Refresh Data
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                          { key: 'avg_likes', label: 'Average Likes' },
                          { key: 'avg_comments', label: 'Average Comments' },
                          { key: 'avg_reach', label: 'Average Reach' },
                          { key: 'avg_views', label: 'Average Views' },
                          {
                            key: 'engagement_rate',
                            label: 'Engagement Rate',
                            format: (val) => (typeof val === 'number' ? `${val.toFixed(2)}%` : '0%'),
                            alias: 'total_engagements',
                          },
                        ].map(({ key, label, format, alias }) => {
                          const value = instagram[key] ?? instagram[alias ?? key];
                          return (
                            <div
                              key={key}
                              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center hover:shadow-md transition-all duration-300"
                            >
                              <p className="text-sm text-gray-600 font-medium">{label}</p>
                              <p className="text-xl font-bold text-indigo-600">
                                {format ? format(value) : value?.toLocaleString?.() ?? '0'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* daily insights */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Daily Insights</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['reach', 'impressions', 'views'].map((key) => (
                          <div
                            key={key}
                            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center hover:shadow-md transition-all duration-300"
                          >
                            <p className="text-sm text-gray-600 capitalize font-medium">{key}</p>
                            <p className="text-xl font-bold text-indigo-600">
                              {instagram.account_insights_day?.[key]?.data?.[0]?.values?.[0]?.value?.toLocaleString?.() ??
                                '—'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 30-day demographics */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">30-Day Demographics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Gender */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <h5 className="text-base font-medium text-gray-700 mb-3">Gender Distribution</h5>
                          {instagram.account_insights_30days?.follower_demographics?.data?.length ? (
                            <ul className="space-y-2">
                              {instagram.account_insights_30days.follower_demographics.data.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-sm">
                                  <span className="text-gray-600 capitalize">{item.gender || 'Unknown'}</span>
                                  <span className="font-semibold text-indigo-600">
                                    {typeof item.percentage === 'number' ? item.percentage.toFixed(1) : 0}%
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 text-center">No gender data available</p>
                          )}
                        </div>

                        {/* Country */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <h5 className="text-base font-medium text-gray-700 mb-3">Country Distribution</h5>
                          {instagram.account_insights_30days?.follower_demographics?.data?.length ? (
                            <ul className="space-y-2">
                              {instagram.account_insights_30days.follower_demographics.data.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-sm">
                                  <span className="text-gray-600 capitalize">{item.country || 'Unknown'}</span>
                                  <span className="font-semibold text-indigo-600">
                                    {typeof item.percentage === 'number' ? item.percentage.toFixed(1) : 0}%
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 text-center">No country data available</p>
                          )}
                        </div>

                        {/* Age */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <h5 className="text-base font-medium text-gray-700 mb-3">Age Distribution</h5>
                          {instagram.account_insights_30days?.engaged_audience_demographics?.data?.length ? (
                            <ul className="space-y-2">
                              {instagram.account_insights_30days.engaged_audience_demographics.data.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-sm">
                                  <span className="text-gray-600 capitalize">{item.age || 'Unknown'}</span>
                                  <span className="font-semibold text-indigo-600">
                                    {typeof item.percentage === 'number' ? item.percentage.toFixed(1) : 0}%
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 text-center">No age data available</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* media posts */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Media Posts</h4>
                      {media.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg shadow-inner">
                          No media found. Share Instagram posts to display here!
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {media.map((m) => (
                            <div
                              key={m.id}
                              className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
                            >
                              {m.media_type === 'IMAGE' ? (
                                <img
                                  src={m.media_url}
                                  alt={m.caption || 'Instagram post'}
                                  className="w-full h-64 object-cover"
                                />
                              ) : (
                                <video controls className="w-full h-64 object-cover">
                                  <source src={m.media_url} type="video/mp4" />
                                </video>
                              )}

                              <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold rounded-full px-2 py-1">
                                {m.media_type}
                              </div>

                              <div className="p-4 space-y-3">
                                <p className="text-sm text-gray-700 line-clamp-3 font-medium">
                                  {m.caption || 'No caption'}
                                </p>

                                <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  <div className="flex flex-col items-center">
                                    <span className="font-semibold text-indigo-600">
                                      {m.insights?.data?.find((i) => i.name === 'likes')?.values?.[0]?.value?.toLocaleString?.() ||
                                        0}
                                    </span>
                                    <span>Likes</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="font-semibold text-indigo-600">
                                      {m.insights?.data?.find((i) => i.name === 'comments')?.values?.[0]?.value?.toLocaleString?.() ||
                                        0}
                                    </span>
                                    <span>Comments</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="font-semibold text-indigo-600">
                                      {m.insights?.data?.find((i) => i.name === 'views')?.values?.[0]?.value?.toLocaleString?.() ||
                                        0}
                                    </span>
                                    <span>Views</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="font-semibold text-indigo-600">
                                      {m.insights?.data?.find((i) => i.name === 'reach')?.values?.[0]?.value?.toLocaleString?.() ||
                                        0}
                                    </span>
                                    <span>Reach</span>
                                  </div>
                                </div>

                                <Link
                                  href={m.permalink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-center text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition"
                                >
                                  View on Instagram →
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* --------------------- /Instagram Account Card --------------------- */}
          </div>
        </div>
      </div>
    </InfluencerLayout>
  );
}
