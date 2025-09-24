'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useEffect } from 'react';

export default function ConnectInstagramPage() {
  const router = useRouter();

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login first");
        router.push('/auth#influencerLogin');
        return;
      }

      // Ask backend for Instagram login URL
      const res = await axios.get("http://localhost:4004/connect/auth/instagram", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Redirect user to Instagram
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Failed to connect Instagram:", err);
      alert("Error starting Instagram connect");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Connect Your Instagram</h1>
      <p className="text-gray-600 mb-6">
        Link your Instagram account to fetch profile, followers, and insights.
      </p>

      <button
        onClick={handleConnect}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow hover:opacity-90"
      >
        Connect Instagram
      </button>

      <button
        onClick={() => router.push('/dashboard/influencer/campaigns')}
        className="mt-4 text-gray-500 hover:text-gray-700"
      >
        Skip for now →
      </button>
    </div>
  );
}
