'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLayout from '@/components/BrandLayout';
import api from '@/utils/api';

export default function BrandProfilePage() {
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/brand/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.data);
      } catch (err) {
        console.error('Failed to fetch brand profile:', err);
        setError('Failed to load profile. Please try again.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setMsgType('');

    try {
      // Update profile fields
      await api.put(
        '/brand/update',
        {
          phone: profile.phone,
          skype: profile.skype,
          industry: profile.industry,
          website: profile.website,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Upload profile image
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        await api.patch('/brand/upload-profile', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setMsg('Profile updated successfully!');
      setMsgType('success');
      setImageFile(null);
    } catch (err) {
      console.error('Update failed:', err);
      setMsg('Update failed. Please try again.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <BrandLayout>
        <div className="flex flex-col items-center justify-center h-full w-full gap-4">
          <p className="text-red-600 text-base sm:text-lg">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchProfile();
            }}
            className="px-4 py-2 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </BrandLayout>
    );
  }

  if (!profile) {
    return (
      <BrandLayout>
        <div className="flex items-center justify-center h-full w-full">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-gray-500 text-base sm:text-lg">Loading...</p>
        </div>
      </BrandLayout>
    );
  }

  return (
    <BrandLayout>
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]">
            Your Profile
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update your brand information below.
          </p>
        </div>

        <form
          onSubmit={handleUpdate}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-6 space-y-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : profile.profile_image
                    ? `https://api.fluencerz.com${profile.profile_image}`
                    : '/avatar.png'
                }
                alt="Brand Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/90 dark:border-gray-800/90 shadow-md"
              />
              <label className="relative flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Upload profile image"
                />
              </label>
            </div>

            <div className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                <input
                  value={profile.company_name || ''}
                  disabled
                  className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  aria-disabled="true"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person</label>
                <input
                  value={profile.contact_person || ''}
                  disabled
                  className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  aria-disabled="true"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  value={profile.email || ''}
                  disabled
                  className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  aria-disabled="true"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <input
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
                className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#833ab4] dark:bg-gray-700 dark:text-gray-100"
                aria-label="Phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skype</label>
              <input
                name="skype"
                value={profile.skype || ''}
                onChange={handleChange}
                className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#833ab4] dark:bg-gray-700 dark:text-gray-100"
                aria-label="Skype ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
              <input
                name="industry"
                value={profile.industry || ''}
                onChange={handleChange}
                className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#833ab4] dark:bg-gray-700 dark:text-gray-100"
                aria-label="Industry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
              <input
                name="website"
                value={profile.website || ''}
                onChange={handleChange}
                className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#833ab4] dark:bg-gray-700 dark:text-gray-100"
                aria-label="Website URL"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              disabled={loading}
              aria-label={loading ? 'Updating profile' : 'Update profile'}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userType');
                window.location.href = '/';
              }}
              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
              aria-label="Log out"
            >
              Logout
            </button>
          </div>

          {msg && (
            <p
              className={`mt-4 p-3 rounded-lg text-sm ${
                msgType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
              role="alert"
            >
              {msg}
            </p>
          )}
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Visit FluencerZ main site"
          >
            Visit FluencerZ
          </Link>
        </div>
      </div>
    </BrandLayout>
  );
}
