import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, AlertTriangle } from 'lucide-react';

const Legal = () => {
  const { page } = useParams();

  const content = {
    privacy: {
      icon: <Shield className="w-12 h-12 text-blue-500" />,
      title: 'Privacy Policy',
      lastUpdated: 'April 8, 2024',
      sections: [
        {
          heading: 'Information We Collect',
          text: `We collect information you provide directly to us, including name, email, phone number, profile information, and content you upload. We also collect usage data, device information, and location data (with your permission) to provide our map features.`
        },
        {
          heading: 'How We Use Your Information',
          text: `We use your information to provide and improve our services, process payments, communicate with you, ensure platform security, and comply with legal obligations. We analyze usage patterns to enhance user experience and personalize content recommendations.`
        },
        {
          heading: 'Information Sharing',
          text: `We do not sell your personal information. We may share data with service providers who assist in platform operations, when required by law, or to protect our rights and safety. Public content is visible to all users as per your privacy settings.`
        },
        {
          heading: 'Data Security',
          text: `We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no internet transmission is completely secure, and we cannot guarantee absolute security.`
        },
        {
          heading: 'Your Rights',
          text: `You have the right to access, correct, or delete your personal information. You can manage your privacy settings in your account dashboard. Contact us for data-related requests.`
        },
        {
          heading: 'Cookies & Tracking',
          text: `We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookie preferences through your browser settings.`
        },
        {
          heading: 'Children\'s Privacy',
          text: `Our platform is not intended for users under 13 years of age. We do not knowingly collect information from children under 13. If we discover such data, we will delete it immediately.`
        },
        {
          heading: 'Changes to This Policy',
          text: `We may update this Privacy Policy periodically. We will notify you of significant changes through the platform or via email. Continued use after changes constitutes acceptance.`
        }
      ]
    },
    terms: {
      icon: <FileText className="w-12 h-12 text-purple-500" />,
      title: 'Terms & Conditions',
      lastUpdated: 'April 8, 2024',
      sections: [
        {
          heading: 'Acceptance of Terms',
          text: `By accessing or using GeoLink, you agree to be bound by these Terms. If you disagree with any part, you may not access the platform. These terms constitute a legally binding agreement between you and GeoLink.`
        },
        {
          heading: 'User Accounts',
          text: `You must provide accurate information when creating an account. You are responsible for maintaining password confidentiality and all activities under your account. Notify us immediately of unauthorized access.`
        },
        {
          heading: 'Content Guidelines',
          text: `Users retain ownership of their content but grant GeoLink a license to use, distribute, and display it. Content must not violate laws, infringe rights, contain hate speech, violence, adult content, or misinformation.`
        },
        {
          heading: 'Monetization & Payments',
          text: `Creators become eligible for monetization at 5000 subscribers. Monthly payments of ₹500 are subject to tax deductions and platform fees. Reward points have no cash value until redeemed. Minimum withdrawal is ₹1000.`
        },
        {
          heading: 'Prohibited Activities',
          text: `Users may not use bots, manipulate engagement metrics, harass others, distribute malware, attempt unauthorized access, or engage in fraudulent activities. Violation may result in account termination.`
        },
        {
          heading: 'Intellectual Property',
          text: `GeoLink's trademarks, logos, and platform code are protected. Users may not copy, modify, or distribute platform materials without written permission. Respect others' intellectual property rights.`
        },
        {
          heading: 'Limitation of Liability',
          text: `GeoLink is provided "as is" without warranties. We are not liable for indirect, incidental, or consequential damages. Our total liability shall not exceed amounts paid to you in the preceding 12 months.`
        },
        {
          heading: 'Termination',
          text: `We may suspend or terminate accounts for violations without notice. Users may delete their accounts at any time. Upon termination, your content may remain visible if shared by others.`
        },
        {
          heading: 'Governing Law',
          text: `These Terms are governed by the laws of India. Disputes shall be resolved in courts of [Your City], India. Users agree to attempt mediation before litigation.`
        }
      ]
    },
    disclaimer: {
      icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
      title: 'Disclaimer',
      lastUpdated: 'April 8, 2024',
      sections: [
        {
          heading: 'Platform Nature',
          text: `GeoLink is a social media platform connecting content creators with audiences. We do not guarantee specific earnings, follower growth, or content performance. Success depends on individual effort, content quality, and market conditions.`
        },
        {
          heading: 'Earnings Disclaimer',
          text: `Income figures mentioned (₹500/month, reward points) are potential earnings, not guarantees. Actual earnings vary based on engagement, advertiser rates, and platform policies. We are not responsible for tax obligations arising from your earnings.`
        },
        {
          heading: 'Third-Party Content',
          text: `We do not endorse or verify user-generated content. Views expressed by users are their own. We are not responsible for inaccurate, offensive, or illegal content posted by users, though we moderate per our guidelines.`
        },
        {
          heading: 'Technical Issues',
          text: `We strive for 99.9% uptime but do not guarantee uninterrupted service. We are not liable for data loss, service interruptions, or technical failures beyond our reasonable control.`
        },
        {
          heading: 'External Links',
          text: `Our platform may contain links to third-party websites. We are not responsible for their content, privacy practices, or terms of use. Access external links at your own risk.`
        },
        {
          heading: 'Investment Risk',
          text: `Building a presence on GeoLink requires time and effort. There is no guarantee of return on investment. Users should not rely on platform earnings as primary income without diversified revenue streams.`
        },
        {
          heading: 'Changes to Platform',
          text: `We reserve the right to modify features, monetization criteria, and policies. These changes may affect your earnings and platform experience. We will provide reasonable notice of significant changes.`
        },
        {
          heading: 'Contact Information',
          text: `For questions about this disclaimer, contact us at legal@geolink.com. By using GeoLink, you acknowledge that you have read, understood, and agree to this disclaimer.`
        }
      ]
    }
  };

  const currentContent = content[page] || content.privacy;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              {currentContent.icon}
              <div>
                <h1 className="text-3xl font-bold">{currentContent.title}</h1>
                <p className="text-white/80">Last updated: {currentContent.lastUpdated}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Welcome to GeoLink. This document outlines important information about our platform. 
                Please read carefully before using our services.
              </p>

              {currentContent.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-8"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    {section.heading}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-10">
                    {section.text}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Us</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have any questions about these {currentContent.title.toLowerCase()}, please contact us:
              </p>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>Email: legal@geolink.com</p>
                <p>Address: GeoLink Technologies Pvt. Ltd., [Your Address], India</p>
                <p>Business Hours: Monday - Friday, 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center gap-4">
          <a 
            href="/legal/privacy" 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              page === 'privacy' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Privacy Policy
          </a>
          <a 
            href="/legal/terms" 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              page === 'terms' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Terms & Conditions
          </a>
          <a 
            href="/legal/disclaimer" 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              page === 'disclaimer' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Disclaimer
          </a>
        </div>
      </div>
    </div>
  );
};

export default Legal;
