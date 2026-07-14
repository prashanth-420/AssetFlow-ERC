import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendOtpRequest, googleAuthRequest } from '../../lib/authApi';
import { hasAuthSession, saveAuthSession } from '../../lib/authSession';
import { requestGoogleAccessToken } from '../../lib/googleAuth';

const DEPARTMENTS = ['Select Department', 'Engineering', 'Operations', 'Marketing', 'Sales', 'HR', 'Audit'];

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [department, setDepartment] = useState('Select Department');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hasAuthSession()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'text-slate-400' };
    if (password.length < 6) return { label: 'Weak', color: 'text-red-500 font-bold' };
    if (password.length < 10) return { label: 'Medium', color: 'text-amber-500 font-bold' };
    return { label: 'Strong', color: 'text-green-500 font-bold' };
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (department === 'Select Department') {
      toast.error('Please select a department');
      return;
    }
    if (!agreed) {
      toast.error('Please agree to the Terms of Service & Privacy Policy');
      return;
    }

    setSubmitting(true);

    try {
      // First send OTP to email
      const otpData = await sendOtpRequest({ email });

      if (!otpData.success) {
        toast.error(otpData.message || 'Unable to send verification code.');
        return;
      }

      // Navigate to OTP verification page with signup data
      toast.success('Verification code sent to your email!');
      navigate('/verify-otp', {
        state: {
          signupData: {
            fullName,
            email,
            organizationName: orgName,
            department,
            password,
          },
        },
      });
    } catch (error) {
      toast.error(error?.message || 'Unable to send verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const accessToken = await requestGoogleAccessToken();
      const data = await googleAuthRequest({ accessToken });

      if (!data.success) {
        toast.error(data.message || 'Google sign-up failed.');
        return;
      }

      saveAuthSession(data);
      toast.success(data.message || 'Google account connected successfully.');
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Google sign-up failed.');
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FBFBFC] font-sans antialiased">
      
      {/* Left Column: Image backdrop & ERP text & Cards */}
      <section 
        className="hidden md:flex md:w-1/2 bg-cover bg-center relative flex-col justify-between p-16 text-left overflow-hidden"
        style={{ backgroundImage: 'url("/signup.png")' }}
      >
        {/* Soft dark-blue gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/60 to-slate-950/85 z-0" />
        <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay z-0" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10 flex-shrink-0 p-1.5">
            <img src="/logo.svg" className="w-full h-full object-contain" alt="AssetFlow Logo" />
          </div>
          <div>
            <div className="text-lg font-black text-white tracking-tight leading-none">AssetFlow</div>
            <div className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Enterprise ERP</div>
          </div>
        </div>

        {/* Overlay Feature Cards */}
        <div className="relative z-10 space-y-4 my-auto max-w-md">
          {/* Card 1 */}
          <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex gap-4 text-white hover:bg-slate-950/50 transition-all duration-300 shadow-lg shadow-black/5">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center flex-shrink-0 border border-white/10">
              <span className="material-symbols-outlined text-white text-lg">inventory_2</span>
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-white tracking-tight">Centralized Inventory</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Single source of truth for all physical and digital assets across multi-site operations.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex gap-4 text-white hover:bg-slate-950/50 transition-all duration-300 shadow-lg shadow-black/5">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center flex-shrink-0 border border-white/10">
              <span className="material-symbols-outlined text-white text-lg">event_available</span>
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-white tracking-tight">Conflict-free Booking</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Intelligent resource allocation preventing double-bookings and scheduling bottlenecks.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex gap-4 text-white hover:bg-slate-950/50 transition-all duration-300 shadow-lg shadow-black/5">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center flex-shrink-0 border border-white/10">
              <span className="material-symbols-outlined text-white text-lg">engineering</span>
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-white tracking-tight">Automated Maintenance</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Predictive lifecycle monitoring and automated service ticket generation.
              </p>
            </div>
          </div>
        </div>


      </section>

      {/* Right Column: Register Card */}
      <section className="flex-1 flex flex-col items-center justify-between p-6 sm:p-12 md:p-16 bg-[#FBFBFC] min-h-screen">
        <div className="w-full max-w-xl my-auto space-y-6 text-left">
          
          {/* Card Box */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 sm:p-10 space-y-6">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-100 rounded-full bg-slate-50 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs text-slate-500">domain</span>
              Enterprise Onboarding
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Organization Account</h1>
              <p className="text-xs text-slate-400 mt-2 font-semibold leading-relaxed">
                Scale your operations with precision tracking and unified resource management.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              
              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Marcus Aurelius"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50/30 focus:bg-white transition-all duration-150"
                  />
                </div>

                {/* Corporate Email */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                    Corporate Email
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="m.aurelius@company.com"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50/30 focus:bg-white transition-all duration-150"
                  />
                </div>

                {/* Organization Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                    Organization Name
                  </label>
                  <input 
                    type="text" 
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="AssetFlow Enterprise"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50/30 focus:bg-white transition-all duration-150"
                  />
                </div>

                {/* Department Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                    Department
                  </label>
                  <select 
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50/30 focus:bg-white transition-all duration-150 cursor-pointer"
                  >
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Password
                  </label>
                  <span className={`text-[10px] font-semibold ${strength.color}`}>
                    Strength: {strength.label}
                  </span>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-4 pr-11 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50/30 focus:bg-white transition-all duration-150"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-2 text-slate-400 hover:text-slate-600 flex items-center justify-center p-1.5 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-start gap-2.5 pt-2">
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  required
                  className="w-4.5 h-4.5 border-slate-300 rounded text-black focus:ring-black accent-black cursor-pointer mt-0.5 flex-shrink-0"
                />
                <label htmlFor="agree" className="text-[11px] text-slate-500 font-semibold cursor-pointer select-none leading-relaxed">
                  I agree to the <a href="#" className="text-black hover:text-indigo-600 hover:underline font-extrabold transition-colors">Terms of Service</a> and <a href="#" className="text-black hover:text-indigo-600 hover:underline font-extrabold transition-colors">Privacy Policy</a>. I understand that my data will be managed according to enterprise security standards.
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer group"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
                <span className="material-symbols-outlined text-base font-bold transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-slate-100" />
              <span className="px-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest">or continue with</span>
              <div className="flex-grow h-px bg-slate-100" />
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-extrabold transition-all active:scale-[0.98] cursor-pointer shadow-sm shadow-slate-100"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="text-center pt-2 text-xs font-semibold text-slate-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-black hover:text-indigo-600 hover:underline font-extrabold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
