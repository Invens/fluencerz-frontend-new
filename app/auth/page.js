'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AuthPage({ initialHash = '#brandLogin' }) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialHash.includes('Login'));
  const [userType, setUserType] = useState(
    initialHash.includes('brand') ? 'brand' : 'influencer'
  );
  const [step, setStep] = useState(1);
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
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE = 'http://localhost:4004/api';

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

  const handleNextStep = () => {
    if (step === 1 && (!fullName || !email || !password)) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(''); // Clear error when moving to the next step
    if (isLogin || (userType === 'brand' && step < 4) || (userType === 'influencer' && step < 4)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setError(''); // Clear error when moving to the previous step
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation for registration (step 4 includes profile image)
      if (!isLogin && step === 4 && !profileImage) {
        setError('Please upload a profile image to complete registration.');
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email,
          password,
          userType,
        });
        const { token } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userType);
        router.push(userType === 'brand' ? '/dashboard/brand/campaigns' : '/dashboard/influencer/campaigns');
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

        // Upload profile image if provided (already validated above for step 4)
        if (profileImage) {
          const uploadUrl =
            userType === 'brand'
              ? `${API_BASE}/brand/upload-profile`
              : `${API_BASE}/influencer/upload-profile`;
          const formData = new FormData();
          formData.append('image', profileImage);
          await axios.patch(uploadUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });
        }

        // Redirect based on userType
        if (userType === 'brand') {
          router.push('/dashboard/brand');
        } else {
          router.push('/connect-instagram');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = isLogin ? 1 : userType === 'brand' ? 4 : 4;

  const renderStep = () => {
    if (isLogin) {
      return (
        <div className="">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {userType === 'brand' ? 'Company Name' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={userType === 'brand' ? 'Company Name' : 'Full Name'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp / LinkedIn / Telegram
              </label>
              <input
                type="text"
                placeholder="Link"
                value={skype}
                onChange={(e) => setSkype(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        );
      case 3:
        return userType === 'influencer' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Followers Count</label>
                <input
                  type="number"
                  placeholder="Followers Count"
                  value={followersCount}
                  onChange={(e) => setFollowersCount(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Engagement Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Engagement Rate"
                  value={engagementRate}
                  onChange={(e) => setEngagementRate(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Reach</label>
                <input
                  type="number"
                  placeholder="Total Reach"
                  value={totalReach}
                  onChange={(e) => setTotalReach(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Social Platforms</label>
              {socialPlatforms.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <select
                    value={item.platform}
                    onChange={(e) => handlePlatformChange(index, 'platform', e.target.value)}
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                    className="w-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlatform(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddPlatform}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                + Add Platform
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Followers by Country</label>
              {followersByCountry.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Country"
                    value={item.country}
                    onChange={(e) => handleCountryChange(index, 'country', e.target.value)}
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Percentage"
                    value={item.percentage}
                    onChange={(e) => handleCountryChange(index, 'percentage', e.target.value)}
                    className="w-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCountry(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddCountry}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                + Add Country
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audience Age Group</label>
                <select
                  value={audienceAgeGroup}
                  onChange={(e) => setAudienceAgeGroup(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Audience Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Male %</label>
                    <input
                      type="number"
                      placeholder="Male"
                      value={audienceGender.male}
                      onChange={(e) => handleGenderChange('male', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Female %</label>
                    <input
                      type="number"
                      placeholder="Female"
                      value={audienceGender.female}
                      onChange={(e) => handleGenderChange('female', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Other %</label>
                    <input
                      type="number"
                      placeholder="Other"
                      value={audienceGender.other}
                      onChange={(e) => handleGenderChange('other', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
              <textarea
                placeholder="Describe your portfolio, past collaborations, etc."
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                rows="4"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="available">Available for collaborations</option>
                <option value="unavailable">Not available</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <input
                type="text"
                placeholder="Industry (e.g., adtech)"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image <span className="text-red-500">*</span>
              </label>
              {profileImage && (
                <img
                  src={URL.createObjectURL(profileImage)}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded-full mb-3 border border-gray-200 shadow-sm"
                />
              )}
              <label
                htmlFor="profile-image"
                className="inline-block px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
              >
                Choose Image
              </label>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
                className="hidden"
                required
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col mt-[200px]">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12 pt-16">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {isLogin ? 'Login' : 'Register'} as{' '}
              <span className={userType === 'brand' ? 'text-blue-600' : 'text-red-600'}>
                {userType === 'brand' ? 'Brand' : 'Influencer'}
              </span>
            </h2>
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                updateHash('login', userType);
                setStep(1);
              }}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                isLogin
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                updateHash('register', userType);
                setStep(1);
              }}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                !isLogin
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input
                type="radio"
                value="brand"
                checked={userType === 'brand'}
                onChange={() => {
                  setUserType('brand');
                  updateHash(isLogin ? 'login' : 'register', 'brand');
                  setStep(1);
                }}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
              />
              Brand
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input
                type="radio"
                value="influencer"
                checked={userType === 'influencer'}
                onChange={() => {
                  setUserType('influencer');
                  updateHash(isLogin ? 'login' : 'register', 'influencer');
                  setStep(1);
                }}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
              />
              Influencer
            </label>
          </div>

          {!isLogin && (
            <div className="mb-8">
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Step {step} of {totalSteps}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={step === totalSteps ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
            {renderStep()}
            <div className="flex justify-between mt-8">
              {step > 1 && !isLogin && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-2.5 rounded-full font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  Previous
                </button>
              )}
              {step < totalSteps && !isLogin ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-full font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center transition-all ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    isLogin ? 'Login' : 'Register'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}