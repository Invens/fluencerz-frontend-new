
'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Lock } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Industry categories with minimum multipliers
const categories = [
  { name: 'Finance / Investing', multiplier: 2.0 },
  { name: 'Technology / Gadgets', multiplier: 1.8 },
  { name: 'Health & Wellness', multiplier: 1.6 },
  { name: 'Beauty / Skincare', multiplier: 1.5 },
  { name: 'Fashion / Apparel', multiplier: 1.4 },
  { name: 'Luxury / Jewelry', multiplier: 2.0 },
  { name: 'Gaming', multiplier: 1.5 },
  { name: 'Parenting / Baby', multiplier: 1.3 },
  { name: 'Food & Beverage', multiplier: 1.2 },
  { name: 'Home & DIY', multiplier: 1.3 },
  { name: 'Travel & Hospitality', multiplier: 1.5 },
  { name: 'Automotive', multiplier: 2.0 },
  { name: 'Education / Careers', multiplier: 1.4 },
  { name: 'Entertainment / Pop Culture', multiplier: 1.2 },
  { name: 'Pets / Animals', multiplier: 1.2 },
  { name: 'Sustainability / Green Living', multiplier: 1.3 },
  { name: 'Art / Design / Photography', multiplier: 1.3 },
];

// Utility to format large numbers
const formatNumber = (num) => {
  if (!num) return '0';
  num = parseFloat(num);
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
};

// Determine base rate based on followers
const getBaseRate = (followers) => {
  if (followers <= 5_000_000) return 20;
  if (followers <= 10_000_000) return 18;
  return 16; // 10M+
};

// In-memory storage for request counts (replace with backend database in production)
const requestCountsByIP = {};

export default function InstagramProfilePage() {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [clientIP, setClientIP] = useState(null);
  // Estimator state
  const [category, setCategory] = useState(categories[0].name);
  const [contentTypeMultiplier, setContentTypeMultiplier] = useState(1.5);
  const [usageRightsFactor, setUsageRightsFactor] = useState(1.0);

  useEffect(() => {
    // Check authentication status
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsLoggedIn(!!token);

    // Fetch client IP using ipify
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Failed to fetch IP address');
        const data = await response.json();
        const ip = data.ip || 'unknown';
        setClientIP(ip);
        // Initialize request count for this IP if not exists
        if (!requestCountsByIP[ip]) {
          requestCountsByIP[ip] = 0;
        }
      } catch (err) {
        console.error('IP fetch error:', err);
        setError('Could not fetch IP address. Please try again.');
      } finally {
        setAuthLoading(false);
      }
    };

    fetchIP();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine request limit based on login status
    const requestLimit = isLoggedIn ? 5 : 2;

    // Check request limit for this IP
    if (clientIP && requestCountsByIP[clientIP] >= requestLimit) {
      if (!isLoggedIn) {
        setError("You've used 2/2 profile requests. Login to view more profiles.");
      } else {
        setError(`You've reached the maximum number of profile requests (${requestLimit}) for this IP. Please try again later.`);
      }
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const response = await fetch(`https://api.fluencerz.com/api/instagram/${username}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch profile data`);
      const data = await response.json();

      // Parse and process profile data
      data.average_likes = parseFloat(data.average_likes) || 0;
      data.average_comments = parseFloat(data.average_comments) || 0;
      data.engagement_rate = parseFloat(data.engagement_rate) || 0;
      data.comments_to_likes_ratio = parseFloat(data.comments_to_likes_ratio) || 0;
      data.followers_to_follows_ratio = parseFloat(data.followers_to_follows_ratio) || 0;

      // Parse profile_history_points
      data.profile_history_points = data.profile_history_points.map((point) => ({
        ...point,
        followers_count: parseInt(point.followers_count) || 0,
        engagement_rate: parseFloat(point.engagement_rate) || 0,
        average_likes: parseFloat(point.average_likes) || 0,
        average_comments: parseFloat(point.average_comments) || 0,
        weekly_posts: parseFloat(point.weekly_posts) || 0,
        comments_to_likes_ratio: parseFloat(point.comments_to_likes_ratio) || 0,
      }));

      // Parse similar_accounts_stats
      data.similar_accounts_stats = {
        ...data.similar_accounts_stats,
        average_likes: {
          ...data.similar_accounts_stats.average_likes,
          avg: parseFloat(data.similar_accounts_stats.average_likes.avg) || 0,
        },
        average_comments: {
          ...data.similar_accounts_stats.average_comments,
          avg: parseFloat(data.similar_accounts_stats.average_comments.avg) || 0,
        },
        weekly_posts: {
          ...data.similar_accounts_stats.weekly_posts,
          avg: parseFloat(data.similar_accounts_stats.weekly_posts.avg) || 0,
        },
        engagement_rate: {
          ...data.similar_accounts_stats.engagement_rate,
          avg: parseFloat(data.similar_accounts_stats.engagement_rate.avg) || 0,
        },
      };

      setProfile(data);

      // Increment request count for this IP
      if (clientIP) {
        requestCountsByIP[clientIP] = (requestCountsByIP[clientIP] || 0) + 1;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pay per post
  const calculatePay = () => {
    if (!profile) return 0;
    const baseRate = getBaseRate(profile.followers_count);
    const categoryMultiplier = categories.find((cat) => cat.name === category).multiplier;
    return (
      (baseRate * (profile.followers_count / 1000)) *
      (profile.engagement_rate / 100) *
      categoryMultiplier *
      contentTypeMultiplier *
      usageRightsFactor
    );
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-700">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-pink-400"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-20 w-20 border-4 border-indigo-300 opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-700 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl mb-10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]">
          <h2 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">Discover Instagram Profiles</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="Enter Instagram username (e.g., virat.kohli)"
              className="flex-grow p-4 border-2 border-pink-200 rounded-2xl bg-white/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300"
              disabled={loading || (clientIP && requestCountsByIP[clientIP] >= (isLoggedIn ? 5 : 2))}
            />
            <button
              type="submit"
              disabled={loading || !username || (clientIP && requestCountsByIP[clientIP] >= (isLoggedIn ? 5 : 2))}
              className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-indigo-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {loading ? 'Analyzing...' : 'Search'}
            </button>
          </form>
          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="relative mr-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-400"></div>
                <div className="absolute inset-0 animate-pulse rounded-full h-8 w-8 border-2 border-indigo-300 opacity-50"></div>
              </div>
              <p className="text-gray-900 text-lg font-semibold">
                We're diving deep into your Instagram profile, hang tight!
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 text-center">
              <p className="text-pink-500 font-medium text-lg">{error}</p>
              {!isLoggedIn && error.includes('Login to view more profiles') && (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-2xl font-semibold hover:from-pink-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
                >
                  Login
                </button>
              )}
            </div>
          )}
          {clientIP && requestCountsByIP[clientIP] > 0 && requestCountsByIP[clientIP] < (isLoggedIn ? 5 : 2) && (
            <p className="text-pink-500 mt-4 font-medium text-lg text-center">
              You've used {requestCountsByIP[clientIP]}/{isLoggedIn ? 5 : 2} profile requests for this IP.
            </p>
          )}
        </div>

        {profile && (
          <>
            <ProfileHeader profile={profile} />
            <ProfileStats profile={profile} />
            <ProfileGraphs profile={profile} />
            <SimilarAccountsStats stats={profile.similar_accounts_stats} />
            <ScoreCard score={profile.score} />
            <div className="relative">
              <div className={`bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl ${!isLoggedIn ? 'blur-sm' : ''}`}>
                <h2 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">Influencer Pay Estimator</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-4 border-2 border-pink-200 rounded-2xl bg-white/50 text-gray-900 focus:outline-none focus:ring-4 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300"
                      disabled={!isLoggedIn}
                    >
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">Content Type</label>
                    <select
                      value={contentTypeMultiplier}
                      onChange={(e) => setContentTypeMultiplier(parseFloat(e.target.value))}
                      className="w-full p-4 border-2 border-pink-200 rounded-2xl bg-white/50 text-gray-900 focus:outline-none focus:ring-4 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300"
                      disabled={!isLoggedIn}
                    >
                      <option value={0.4}>Story</option>
                      <option value={1.0}>Static Post</option>
                      <option value={1.2}>Carousel</option>
                      <option value={1.5}>Video/Reel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">Usage Rights</label>
                    <select
                      value={usageRightsFactor}
                      onChange={(e) => setUsageRightsFactor(parseFloat(e.target.value))}
                      className="w-full p-4 border-2 border-pink-200 rounded-2xl bg-white/50 text-gray-900 focus:outline-none focus:ring-4 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300"
                      disabled={!isLoggedIn}
                    >
                      <option value={1.0}>Organic Post Only</option>
                      <option value={2.0}>Paid Ad Usage</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-lg font-medium text-gray-800">
                    Estimated Pay per Post: <span className="text-pink-500 font-bold">${formatNumber(calculatePay())}</span>
                  </p>
                </div>
              </div>
              {!isLoggedIn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-3xl">
                  <Lock className="text-gray-800 mb-3" size={32} strokeWidth={1.5} />
                  <p className="text-gray-800 font-semibold mb-4 text-lg">
                    Unlock the estimator with your login
                  </p>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-2xl font-semibold hover:from-pink-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProfileHeader({ profile }) {
  return (
    <div className="flex items-center bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl mb-10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]">
      <div className="relative">
        <img
          src={profile.profile_picture_url}
          alt={profile.name || 'Profile'}
          className="w-32 h-32 rounded-full mr-8 object-cover border-4 border-pink-200/50 transition-transform duration-300 hover:scale-105"
          onError={(e) => (e.target.src = '/fallback-image.png')}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-300/30 to-indigo-300/30 animate-pulse-slow"></div>
      </div>
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{profile.name || 'Unknown'}</h1>
        <p className="text-gray-600 text-xl font-medium mt-1">@{profile.username}</p>
        <p className="text-gray-700 text-lg whitespace-pre-line mt-3 leading-relaxed">{profile.biography || 'No bio'}</p>
        {profile.website && (
          <a
            href={profile.website}
            className="text-pink-500 hover:text-pink-600 font-semibold text-lg mt-2 inline-block transition-colors duration-300"
          >
            {profile.website}
          </a>
        )}
      </div>
    </div>
  );
}

function ProfileStats({ profile }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
      <StatCard label="Followers" value={formatNumber(profile.followers_count)} color="from-pink-400 to-indigo-400" />
      <StatCard label="Engagement Rate" value={profile.engagement_rate.toFixed(2) + '%'} color="from-purple-400 to-pink-400" />
      <StatCard label="Average Likes" value={formatNumber(profile.average_likes)} color="from-indigo-400 to-purple-400" />
      <StatCard label="Average Comments" value={formatNumber(profile.average_comments)} color="from-pink-400 to-indigo-400" />
      <StatCard label="Weekly Posts" value={formatNumber(profile.weekly_posts)} color="from-purple-400 to-pink-400" />
      <StatCard label="Media Count" value={formatNumber(profile.media_count)} color="from-indigo-400 to-purple-400" />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      className={`bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl text-center transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-gradient-to-br ${color}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 tracking-wide">{label}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function ProfileGraphs({ profile }) {
  const historyPoints = profile.profile_history_points.slice(0, 7);
  const dates = historyPoints.map((point) => point.date);
  const followersData = historyPoints.map((point) => point.followers_count);
  const engagementData = historyPoints.map((point) => point.engagement_rate);
  const likesData = historyPoints.map((point) => point.average_likes);
  const commentsData = historyPoints.map((point) => point.average_comments);

  const followersChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Followers Count',
        data: followersData,
        borderColor: 'rgba(236, 72, 153, 1)',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(236, 72, 153, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      },
    ],
  };

  const engagementChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Engagement Rate (%)',
        data: engagementData,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      },
    ],
  };

  const likesCommentsChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Average Likes',
        data: likesData,
        borderColor: 'rgba(236, 72, 153, 1)',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(236, 72, 153, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      },
      {
        label: 'Average Comments',
        data: commentsData,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1F2937',
          font: { size: 16, weight: '600', family: 'Inter, sans-serif' },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: (ctx) => ctx.chart.data.datasets[0].label,
        color: '#1F2937',
        font: { size: 18, weight: '700', family: 'Inter, sans-serif' },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 14, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatNumber(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Date', color: '#1F2937', font: { size: 14, family: 'Inter, sans-serif' } },
        grid: { display: false },
        ticks: { color: '#1F2937', font: { size: 12, family: 'Inter, sans-serif' } },
      },
      y: {
        title: { display: true, text: 'Value', color: '#1F2937', font: { size: 14, family: 'Inter, sans-serif' } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: '#1F2937',
          font: { size: 12, family: 'Inter, sans-serif' },
          callback: (value) => formatNumber(value),
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl mb-10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">Profile Trends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96 relative">
          <Line
            data={followersChartData}
            options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, title: { display: true, text: 'Followers Over Time' } },
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pink-50/50 to-transparent rounded-2xl pointer-events-none"></div>
        </div>
        <div className="h-96 relative">
          <Line
            data={engagementChartData}
            options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, title: { display: true, text: 'Engagement Rate Over Time' } },
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-50/50 to-transparent rounded-2xl pointer-events-none"></div>
        </div>
        <div className="md:col-span-2 h-96 relative">
          <Line
            data={likesCommentsChartData}
            options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, title: { display: true, text: 'Likes and Comments Over Time' } },
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-50/50 to-transparent rounded-2xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}

function SimilarAccountsStats({ stats }) {
  return (
    <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl mb-10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">Similar Accounts Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard label="Avg Likes" value={formatNumber(stats.average_likes.avg)} color="from-pink-400 to-indigo-400" />
        <StatCard label="Avg Comments" value={formatNumber(stats.average_comments.avg)} color="from-purple-400 to-pink-400" />
        <StatCard
          label="Avg Weekly Posts"
          value={formatNumber(stats.weekly_posts.avg.toFixed(2))}
          color="from-indigo-400 to-purple-400"
        />
        <StatCard
          label="Avg Engagement Rate"
          value={`${formatNumber(stats.engagement_rate.avg.toFixed(2))}%`}
          color="from-pink-400 to-indigo-400"
        />
      </div>
    </div>
  );
}

function ScoreCard({ score }) {
  return (
    <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl mb-10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">Performance Scores</h2>
      <p className="text-lg font-medium mb-4 text-gray-800">
        Overall Score: <span className="text-pink-500 font-bold">{formatNumber(score.overall_score.toFixed(2))}</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Object.entries(score.areas_scores).map(([key, value]) =>
          value ? (
            <StatCard
              key={key}
              label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              value={formatNumber(value.toFixed(2))}
              color="from-purple-400 to-pink-400"
            />
          ) : null
        )}
      </div>
    </div>
  );
}
