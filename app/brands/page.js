'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Target, Zap, BarChart2, CheckCircle, Sparkles, Rocket } from 'lucide-react';
import api from '@/utils/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ForBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get('/brand/list');
        const data = res.data?.data;
        if (Array.isArray(data)) {
          setBrands(data);
        } else {
          console.error('Brands data is not an array:', data);
          setBrands([]);
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
    <Header/>
    <section className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16 px-4 overflow-hidden pt-[200px]">
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-5xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
              For Brands – Find the Right <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Influencer</span>. Every Time.
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Welcome to Fluencerz, the collaboration platform designed for brands to create meaningful, results-driven influencer campaigns.
            </p>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative rounded-xl overflow-hidden shadow-lg max-w-md"
            >
              <Image
                src="/brand.svg" // Replace with actual image
                alt="Brand Campaign"
                width={500}
                height={300}
                className="object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Key Benefits */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4"
            >
              <Target className="text-blue-600" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800">Reach the Right Audience</h3>
                <p className="text-gray-600">
                  Collaborate with purpose. Our intelligent search tools match you with influencers based on niche, location, engagement, and audience demographics.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4"
            >
              <Zap className="text-purple-600" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800">Fast & Easy Campaign Setup</h3>
                <p className="text-gray-600">
                  Manage everything from discovery to execution in one dashboard. Send requests, track deliverables, and review performance effortlessly.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4"
            >
              <BarChart2 className="text-pink-600" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800">Data-Driven Insights</h3>
                <p className="text-gray-600">
                  Monitor reach, engagement, and ROI with real-time analytics to optimize your strategy and scale what works.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Additional Features */}
          <motion.div variants={itemVariants} className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
              Why Brands Love Fluencerz
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-blue-600" size={20} />
                <p className="text-gray-700">Simplified influencer discovery</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-blue-600" size={20} />
                <p className="text-gray-700">Real-time communication & brief sharing</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-blue-600" size={20} />
                <p className="text-gray-700">Collaboration history & performance tracking</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-blue-600" size={20} />
                <p className="text-gray-700">Scalable campaigns from nano to mega influencers</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-blue-600" size={20} />
                <p className="text-gray-700">Secure, streamlined platform with human support</p>
              </div>
            </div>
          </motion.div>

          {/* Verified Influencers & Campaign Types */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Verified Influencers Only</h3>
              <p className="text-gray-600">
                Quality over quantity. All influencers on Fluencerz are verified and categorized, ensuring you connect with genuine, reliable creators aligned with your brand values.
              </p>
            </div>
            <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Campaign Types We Support</h3>
              <p className="text-gray-600">
                Product launches, unboxing reels, testimonial videos, giveaways, or awareness campaigns—Fluencerz adapts to your needs for smooth execution.
              </p>
            </div>
          </motion.div>

          {/* Brand Showcase */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
              Explore Our Trusted Brands
            </h2>
            {loading ? (
              <p className="text-center text-gray-600">Loading brands...</p>
            ) : brands.length === 0 ? (
              <p className="text-center text-gray-500">No brands found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {brands.map((brand, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition"
                  >
                    <Image
                      src={brand.profile_image ? `https://api.fluencerz.com${brand.profile_image}` : '/default-brand.png'}
                      alt={brand.company_name}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-full mb-4 border"
                    />
                    <h3 className="text-lg font-semibold text-gray-700">
                      {brand.company_name}
                    </h3>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            variants={itemVariants}
            className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Start Your First Campaign Today
            </h2>
            <p className="max-w-3xl mx-auto mb-6">
              Ready to boost your brand with influencer marketing? Sign up now and explore thousands of verified influencers excited to promote your brand.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-semibold flex items-center gap-2 mx-auto hover:shadow-lg transition-shadow"
            >
              <Rocket size={20} />
              Start Collaborating
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
    </>
  );
}