import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    contactMethod: 'email', // 'email' or 'phone'
    otp: '',
    password: '',
    confirmPassword: '',
    accountType: 'private',
    tempId: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const contact = formData.contactMethod === 'email' ? formData.email : formData.phone;
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [formData.contactMethod]: contact
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, tempId: data.tempId }));
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength < 4) {
      setError('Please use a stronger password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-and-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: formData.tempId,
          otp: formData.otp,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          accountType: formData.accountType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        signup(data.token, data.user);
        navigate('/home');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" animated />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOTP}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Contact Method Toggle */}
              <div className="flex bg-white/5 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, contactMethod: 'email'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.contactMethod === 'email' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, contactMethod: 'phone'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.contactMethod === 'phone' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Phone
                </button>
              </div>

              {/* Contact Input */}
              <div className="relative">
                {formData.contactMethod === 'email' ? (
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                ) : (
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                )}
                <input
                  type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                  placeholder={formData.contactMethod === 'email' ? 'email@example.com' : '+91 98765 43210'}
                  value={formData.contactMethod === 'email' ? formData.email : formData.phone}
                  onChange={(e) => setFormData({
                    ...formData, 
                    [formData.contactMethod]: e.target.value
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, accountType: 'private'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.accountType === 'private'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-white font-medium">Private</div>
                    <div className="text-xs text-gray-400 mt-1">Chat only</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, accountType: 'public'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.accountType === 'public'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-white font-medium">Public</div>
                    <div className="text-xs text-gray-400 mt-1">Create & Earn</div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-gray-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300">Login</Link>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyAndSignup}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white text-center mb-6">Verify & Secure</h2>
              
              {/* OTP Input */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Enter 6-digit OTP</label>
                <div className="flex gap-2 justify-center">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      value={formData.otp[i] || ''}
                      onChange={(e) => {
                        const newOtp = formData.otp.split('');
                        newOtp[i] = e.target.value;
                        setFormData({...formData, otp: newOtp.join('')});
                        if (e.target.value && e.target.nextSibling) {
                          e.target.nextSibling.focus();
                        }
                      }}
                      className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl text-white font-bold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Code sent to {formData.contactMethod === 'email' ? formData.email : formData.phone}
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, uppercase, number, symbol"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      checkPasswordStrength(e.target.value);
                    }}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                <div className="space-y-1">
                  <div className="flex gap-1 h-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength > 0 ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Password strength'}
                  </p>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.otp.length !== 6}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" /> Create Account
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Signup;
