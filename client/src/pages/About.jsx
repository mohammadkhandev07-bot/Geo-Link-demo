import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Zap, Shield, Heart, Rocket } from 'lucide-react';
import Logo from '../components/Logo';

const About = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Create & Earn",
      description: "Turn your creativity into income. Reach 5000 subscribers and start earning ₹500 monthly plus reward points."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Connect",
      description: "Chat with friends, discover creators, and build your community on a platform that values genuine connections."
    },
    {
      icon: <Globe className="w-8 h-8 text-green-500" />,
      title: "Explore",
      description: "Discover content from around the world with our interactive map feature and personalized recommendations."
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: "Safe & Secure",
      description: "Your data is protected with enterprise-grade security. We never sell your personal information."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <Logo size="xl" animated />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              GeoLink
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              The next-generation social platform where creativity meets opportunity. 
              Connect, create, and earn like never before.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            GeoLink was founded with a simple belief: creators should be rewarded for their passion. 
            We're building a platform that puts power back in the hands of content creators while 
            fostering genuine human connections across the globe.
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl inline-block">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How GeoLink Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-2">Create Your Channel</h3>
              <p className="text-white/80">Sign up and create your public channel to start uploading videos and photos.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-2">Build Your Audience</h3>
              <p className="text-white/80">Share great content, engage with your community, and grow your subscriber base.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-2">Start Earning</h3>
              <p className="text-white/80">Hit 5000 subscribers for monthly bonuses and earn points from every interaction.</p>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
              MK
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Created by Mohammad Khan</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Founded in 2024, GeoLink represents a vision for a more creator-friendly social media landscape. 
                Built with passion in India for the world.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Made with love for creators everywhere</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-1">2024</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Founded</div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-1">Global</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Reach</div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-1">₹500</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Min. Monthly</div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-pink-600 mb-1">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>
          <p className="text-gray-400 mb-4">© 2024 GeoLink. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="/legal/terms" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</a>
            <a href="/legal/disclaimer" className="text-gray-400 hover:text-white transition-colors">Disclaimer</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
