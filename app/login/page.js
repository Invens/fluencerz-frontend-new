'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AuthPage({ initialHash = '#brandLogin' }) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialHash.includes('Login'));
  const [userType, setUserType] = useState(
    initialHash.includes('brand') ? 'brand' : 'influencer'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [skype, setSkype] = useState('');
  const [niche, setNiche] = useState('');
  const [industry, setIndustry] = useState('');
  const [followersCount, setFollowersCount] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [socialPlatforms, setSocialPlatforms] = useState([{ platform: '', followers: '' }]);
  const [followersByCountry, setFollowersByCountry] = useState([{ country: '', percentage: '' }]);
  const [audienceAgeGroup, setAudienceAgeGroup] = useState('');
  const [audienceGender, setAudienceGender] = useState({ male: '', female: '', other: '' });
  const [totalReach, setTotalReach] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [availability, setAvailability] = useState('available');
  const [error, setError] = useState('');
  const API_BASE = 'https://api.fluencerz.com/api';

  const categories = [
    'Art', 'Beauty', 'Business', 'Comedy', 'Dance', 'Education', 'Entertainment',
    'Fashion', 'Fitness', 'Food & Beverage', 'Gaming', 'Health & Wellness',
    'Home & Garden', 'Kids & Family', 'Lifestyle', 'Music', 'Parenting',
    'Pets & Animals', 'Photography', 'Sports', 'Tech', 'Travel', 'Vlogging',
  ];

  const socialMediaPlatforms = [
    'BeReal', 'Discord', 'Facebook', 'Flickr', 'Instagram', 'LinkedIn', 'Mastodon',
    'Medium', 'Patreon', 'Pinterest', 'Reddit', 'Snapchat', 'Substack', 'Telegram',
    'Threads', 'TikTok', 'Tumblr', 'Twitch', 'Twitter', 'Vimeo', 'WhatsApp', 'YouTube',
  ];

  useEffect(() => {
    const hash = window.location.hash?.toLowerCase() || initialHash.toLowerCase();
    if (hash === '#brandregister') {
      setIsLogin(false);
      setUserType('brand');
    } else if (hash === '#influencerregister') {
      setIsLogin(false);
      setUserType('influencer');
    } else if (hash === '#brandlogin') {
      setIsLogin(true);
      setUserType('brand');
    } else if (hash === '#influencerlogin') {
      setIsLogin(true);
      setUserType('influencer');
    }
  }, [initialHash]);

  const updateHash = (loginMode, type) => {
    const hashMap = {
      login: {
        brand: '#brandLogin',
        influencer: '#influencerLogin',
      },
      register: {
        brand: '#brandRegister',
        influencer: '#influencerRegister',
      },
    };
    const newHash = hashMap[loginMode][type];
    window.history.replaceState(null, '', `/auth/${newHash}`);
  };

  const handleAddPlatform = () => {
    setSocialPlatforms([...socialPlatforms, { platform: '', followers: '' }]);
  };

  const handlePlatformChange = (index, field, value) => {
    const updated = [...socialPlatforms];
    updated[index][field] = value;
    setSocialPlatforms(updated);
  };

  const handleRemovePlatform = (index) => {
    const updated = socialPlatforms.filter((_, i) => i !== index);
    setSocialPlatforms(updated);
  };

  const handleAddCountry = () => {
    setFollowersByCountry([...followersByCountry, { country: '', percentage: '' }]);
  };

  const handleCountryChange = (index, field, value) => {
    const updated = [...followersByCountry];
    updated[index][field] = value;
    setFollowersByCountry(updated);
  };

  const handleRemoveCountry = (index) => {
    const updated = followersByCountry.filter((_, i) => i !== index);
    setFollowersByCountry(updated);
  };

  const handleGenderChange = (field, value) => {
    setAudienceGender({ ...audienceGender, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email,
          password,
          userType,
        });
        const { token } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userType);
        router.push(userType === 'brand' ? '/dashboard/brand' : '/dashboard/influencer');
      } else {
        const endpoint =
          userType === 'brand'
            ? `${API_BASE}/auth/register/brand`
            : `${API_BASE}/auth/register/influencer`;

        const payload =
          userType === 'brand'
            ? {
                company_name: fullName,
                contact_person: fullName,
                email,
                phone,
                skype,
                password,
                industry: industry || 'general',
              }
            : {
                full_name: fullName,
                email,
                phone,
                skype,
                password,
                niche: niche || 'general',
                followers_count: parseInt(followersCount) || 0,
                engagement_rate: parseFloat(engagementRate) || 0,
                social_platforms: socialPlatforms.filter((p) => p.platform && p.followers),
                followers_by_country: followersByCountry.filter((c) => c.country && c.percentage),
                audience_age_group: audienceAgeGroup,
                audience_gender: audienceGender,
                total_reach: parseInt(totalReach) || 0,
                portfolio,
                availability,
              };

        await axios.post(endpoint, payload);
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
          email,
          password,
          userType,
        });
        const { token } = loginRes.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userType);

        if (profileImage) {
          const uploadUrl =
            userType === 'brand'
              ? `${API_BASE}/brand/upload-profile`
              : `${API_BASE}/influencer/upload-profile`; // Fixed typo in endpoint
          const formData = new FormData();
          formData.append('image', profileImage);
          await axios.patch(uploadUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });
        }

        router.push(userType === 'brand' ? '/dashboard/brand' : '/dashboard/influencer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  // Apply gradient based on userType, consistent with SSR
  const containerClassName = `p-8 rounded-2xl shadow-lg w-full max-w-2xl bg-gradient-to-br ${
    userType === 'brand' ? 'from-blue-500 to-blue-200' : 'from-red-600 to-red-100'
  }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className={containerClassName}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {isLogin ? 'Login' : 'Register'} as {userType === 'brand' ? 'Brand' : 'Influencer'}
          </h2>
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4 bg-red-50 p-2 rounded-lg">{error}</p>
        )}

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              updateHash('login', userType);
            }}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isLogin
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              updateHash('register', userType);
            }}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              !isLogin
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Register
          </button>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="radio"
              value="brand"
              checked={userType === 'brand'}
              onChange={() => {
                setUserType('brand');
                updateHash(isLogin ? 'login' : 'register', 'brand');
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            Brand
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="radio"
              value="influencer"
              checked={userType === 'influencer'}
              onChange={() => {
                setUserType('influencer');
                updateHash(isLogin ? 'login' : 'register', 'influencer');
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            Influencer
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {userType === 'brand' ? 'Company Name' : 'Full Name'}
              </label>
              <input
                type="text"
                placeholder={userType === 'brand' ? 'Company Name' : 'Full Name'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp / LinkedIn / Telegram
                </label>
                <input
                  type="text"
                  placeholder="Link"
                  value={skype}
                  onChange={(e) => setSkype(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {userType === 'influencer' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Followers Count</label>
                      <input
                        type="number"
                        placeholder="Followers Count"
                        value={followersCount}
                        onChange={(e) => setFollowersCount(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Engagement Rate"
                        value={engagementRate}
                        onChange={(e) => setEngagementRate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Reach</label>
                      <input
                        type="number"
                        placeholder="Total Reach"
                        value={totalReach}
                        onChange={(e) => setTotalReach(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Social Platforms</label>
                    {socialPlatforms.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <select
                          value={item.platform}
                          onChange={(e) => handlePlatformChange(index, 'platform', e.target.value)}
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Platform</option>
                          {socialMediaPlatforms.map((platform) => (
                            <option key={platform} value={platform}>
                              {platform}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Followers"
                          value={item.followers}
                          onChange={(e) => handlePlatformChange(index, 'followers', e.target.value)}
                          className="w-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePlatform(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddPlatform}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      + Add Platform
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Followers by Country</label>
                    {followersByCountry.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input
                          type="text"
                          placeholder="Country"
                          value={item.country}
                          onChange={(e) => handleCountryChange(index, 'country', e.target.value)}
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Percentage"
                          value={item.percentage}
                          onChange={(e) => handleCountryChange(index, 'percentage', e.target.value)}
                          className="w-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCountry(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddCountry}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      + Add Country
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Audience Age Group</label>
                      <select
                        value={audienceAgeGroup}
                        onChange={(e) => setAudienceAgeGroup(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Age Group</option>
                        <option value="13-17">13-17</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45-54">45-54</option>
                        <option value="55+">55+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Audience Gender</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Male %</label>
                          <input
                            type="number"
                            placeholder="Male"
                            value={audienceGender.male}
                            onChange={(e) => handleGenderChange('male', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Female %</label>
                          <input
                            type="number"
                            placeholder="Female"
                            value={audienceGender.female}
                            onChange={(e) => handleGenderChange('female', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sandbox-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Other %</label>
                          <input
                            type="number"
                            placeholder="Other"
                            value={audienceGender.other}
                            onChange={(e) => handleGenderChange('other', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                    <textarea
                      placeholder="Describe your portfolio, past collaborations, etc."
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available for collaborations</option>
                      <option value="unavailable">Currently unavailable</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    placeholder="Industry (e.g., adtech)"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                {profileImage && (
                  <img
                    src={URL.createObjectURL(profileImage)}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-full my-2 border border-gray-200 shadow-sm"
                  />
                )}
                <label
                  htmlFor="profile-image"
                  className="inline-block px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
                >
                  Choose Image
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}