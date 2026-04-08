import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Earnings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [earnings, setEarnings] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await fetch('/api/earnings/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setEarnings(data);
      }
    } catch (error) {
      console.error('Failed to fetch earnings');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/earnings/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          method: withdrawMethod,
          details: withdrawMethod === 'upi' 
            ? { upiId: e.target.upiId.value }
            : {
                accountNumber: e.target.accountNumber.value,
                ifscCode: e.target.ifscCode.value,
                accountName: e.target.accountName.value
              }
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setWithdrawAmount('');
        fetchEarnings();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Withdrawal request failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    try {
      const response = await fetch('/api/earnings/redeem-points', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchEarnings();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to redeem points' });
    }
  };

  // Mock data for chart
  const chartData = [
    { name: 'Jan', earnings: 4000, views: 2400 },
    { name: 'Feb', earnings: 3000, views: 1398 },
    { name: 'Mar', earnings: 2000, views: 9800 },
    { name: 'Apr', earnings: 2780, views: 3908 },
    { name: 'May', earnings: 1890, views: 4800 },
    { name: 'Jun', earnings: 2390, views: 3800 },
    { name: 'Jul', earnings: 3490, views: 4300 },
  ];

  if (!earnings) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const canWithdraw = earnings.earnings.total >= 1000;
  const pointsValue = Math.floor(earnings.rewardPoints.current / 100) * 10;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Creator Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your earnings and performance</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'overview' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'withdraw' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Withdraw
            </button>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}

        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Earnings */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Lifetime</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{earnings.earnings.total.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className={`flex items-center gap-1 ${canWithdraw ? 'text-green-600' : 'text-orange-600'}`}>
                    {canWithdraw ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    {canWithdraw ? 'Ready to withdraw' : `₹${1000 - earnings.earnings.total} more needed`}
                  </span>
                </div>
              </motion.div>

              {/* Reward Points */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Convertible</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {earnings.rewardPoints.current.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reward Points</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-purple-600 dark:text-purple-400">
                    = ₹{pointsValue}
                  </span>
                  <button
                    onClick={handleRedeemPoints}
                    disabled={earnings.rewardPoints.current < 1000}
                    className="text-sm px-3 py-1 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                  >
                    Redeem
                  </button>
                </div>
              </motion.div>

              {/* Subscribers */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Monthly</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.channel?.subscriberCount || 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
                <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                  {user?.channel?.isMonetized ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> ₹500/month active
                    </span>
                  ) : (
                    <span>{5000 - (user?.channel?.subscriberCount || 0)} more for monetization</span>
                  )}
                </div>
              </motion.div>

              {/* Views */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {earnings.stats?.totalViews?.toLocaleString() || 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              </motion.div>
            </div>

            {/* Points Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Earnings Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Points Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Likes</p>
                        <p className="text-sm text-gray-500">1 like = 1 point</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {earnings.stats?.totalLikes || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Views</p>
                        <p className="text-sm text-gray-500">5 views = 1 point</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {Math.floor((earnings.stats?.totalViews || 0) / 5)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Comments</p>
                        <p className="text-sm text-gray-500">1 comment = 2 points</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {(earnings.stats?.totalComments || 0) * 2}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Shares</p>
                        <p className="text-sm text-gray-500">1 share = 5 points</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {(earnings.stats?.totalShares || 0) * 5}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Points Value</span>
                    <span className="text-2xl font-bold">₹{pointsValue}</span>
                  </div>
                  <p className="text-sm text-white/80 mt-1">1000 points = ₹10</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Withdraw Tab */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Withdraw Earnings</h2>
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Available Balance</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{earnings.earnings.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-500">Minimum withdrawal</span>
                  <span className="text-gray-700 dark:text-gray-300">₹1,000</span>
                </div>
              </div>

              {!canWithdraw ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Withdrawal Locked</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You need ₹{1000 - earnings.earnings.total} more to reach the minimum withdrawal amount.
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdraw} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount to Withdraw (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="500"
                        max={earnings.earnings.total}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Max: ₹{earnings.earnings.total}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Withdrawal Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('upi')}
                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                          withdrawMethod === 'upi'
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">UPI</div>
                        <div className="text-sm text-gray-500">Google Pay, PhonePe, etc.</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('bank_transfer')}
                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                          withdrawMethod === 'bank_transfer'
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">Bank Transfer</div>
                        <div className="text-sm text-gray-500">NEFT/IMPS</div>
                      </button>
                    </div>
                  </div>

                  {withdrawMethod === 'upi' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        name="upiId"
                        placeholder="name@upi"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Number
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          name="ifscCode"
                          placeholder="SBIN0001234"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          name="accountName"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !withdrawAmount}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Request Withdrawal <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    Processing time: 3-5 business days
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
