'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import AuthPopup from './AuthPopup';
import { MessageCircle, Loader2, Lock } from 'lucide-react';
import api from '@/utils/api';

export default function InfluencerCard({ influencer, userType, onConnect }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [imgSrc, setImgSrc] = useState(
    influencer.profile_image
      ? `https://api.fluencerz.com${influencer.profile_image}`
      : '/default-avatar.png'
  );
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isLoggedIn = !!token;

  const handleImageError = () => {
    setImgSrc('/default-avatar.png');
  };

  const handleConnect = async () => {
    if (!token) {
      onConnect();
      return;
    }

    if (userType !== 'brand') {
      setError('Please create a brand account to connect as a brand.');
      setAuthMode('register');
      setIsAuthOpen(true);
      return;
    }

    const message = prompt('Enter your message for the influencer:');
    if (!message) return;

    setIsSending(true);
    setError('');

    try {
      await api.post(
        '/collab/send',
        { influencer_id: influencer.id, request_message: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Collaboration request sent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-xl transition-transform hover:scale-105 flex flex-col items-center"
    >
      {/* Profile Image */}
      <div className="relative mb-4">
        <Image
          src={imgSrc}
          alt={influencer.full_name}
          width={300}
          height={300}
          onError={handleImageError}
          className="h-60 w-60 object-cover rounded-full border-4 border-pink-700"
          loading="lazy"
        />
      </div>

      {/* Influencer Name */}
      <h3 className="text-xl font-bold text-pink-400 text-center">
        {influencer.full_name || 'Unknown'}
      </h3>

      {/* Influencer Niche and Followers */}
      <p className="text-sm text-gray-400 capitalize text-center">
        {influencer.niche || 'N/A'}
      </p>
      <p className="text-sm text-gray-400 text-center">
        {influencer.followers_count?.toLocaleString() || 'N/A'} Followers
      </p>

      {/* Social Platforms */}
      {influencer.social_platforms && (
        <div className={`mt-3 flex flex-wrap justify-center gap-2 relative ${!isLoggedIn ? 'blur-sm' : ''}`}>
          {JSON.parse(influencer.social_platforms).map((p, i) => (
            <span
              key={i}
              className="bg-gradient-to-r from-pink-700 to-blue-700 text-gray-200 px-2 py-1 rounded-full text-xs font-medium"
            >
              {p.platform}: {parseInt(p.followers).toLocaleString()}
            </span>
          ))}
          {!isLoggedIn && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <Lock size={18} className="text-white" />
            </div>
          )}
        </div>
      )}

      {/* Followers by Country */}
      {influencer.followers_by_country && (
        <div className={`mt-3 flex flex-wrap justify-center gap-2 relative ${!isLoggedIn ? 'blur-sm' : ''}`}>
          {JSON.parse(influencer.followers_by_country).map((c, i) => (
            <span
              key={i}
              className="bg-gradient-to-r from-pink-700 to-blue-700 text-gray-200 px-2 py-1 rounded-full text-xs font-medium"
            >
              {c.country}: {c.percentage}%
            </span>
          ))}
          {!isLoggedIn && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <Lock size={18} className="text-white" />
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm text-center mt-3">{error}</p>
      )}

      {/* Connect Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleConnect}
        disabled={isSending}
        className={`mt-6 w-full py-2.5 rounded-full text-white flex items-center justify-center gap-2 transition-colors ${
          isSending
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-pink-700 to-blue-700 hover:from-pink-800 hover:to-blue-800'
        }`}
      >
        {isSending ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <MessageCircle size={20} />
        )}
        {isSending ? 'Sending...' : 'Connect'}
      </motion.button>

      {/* Auth Popup */}
      <AuthPopup
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setError('');
        }}
        initialMode={authMode}
        initialUserType="brand"
      />
    </motion.div>
  );
}
