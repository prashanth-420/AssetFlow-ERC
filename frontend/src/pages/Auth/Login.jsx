import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { loginRequest } = await import('../../lib/authApi');
      const data = await loginRequest({ email, password });

      if (!data.success) {
        toast.error(data.message || 'Invalid credentials.');
        return;
      }

      const { saveAuthSession } = await import('../../lib/authSession');
      saveAuthSession(data);
      toast.success(data.message || 'Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { requestGoogleAccessToken } = await import('../../lib/googleAuth');
      const { googleAuthRequest } = await import('../../lib/authApi');
      const { saveAuthSession } = await import('../../lib/authSession');

      const accessToken = await requestGoogleAccessToken();
      const data = await googleAuthRequest({ accessToken });

      if (!data.success) {
        toast.error(data.message || 'Google sign-in failed.');
        return;
      }

      saveAuthSession(data);
      toast.success(data.message || 'Google sign-in successful!');
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FBFBFC] font-sans antialiased">
      
      {/* Left Column: Image backdrop & ERP text */}
      <section 
        className="hidden md:flex md:w-1/2 bg-cover bg-center relative flex-col justify-between p-16 text-left overflow-hidden"
        style={{ backgroundImage: 'url("/login.png")' }}
      >
        {/* Soft dark-blue gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/60 to-slate-950/80 z-0" />
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

        {/* Center Taglines */}
        <div className="relative z-10 max-w-md space-y-5 mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
            Precision tracking for the modern enterprise.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            Enterprise-grade asset management for modern organizations. Control lifecycle, maintenance, and logistics from a single, high-density interface.
          </p>
        </div>

        {/* Left side footer stats */}
        <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-widest font-mono border-t border-white/5 pt-4">
          <span>AES-256 ENCRYPTED</span>
          <span>V4.2.1-STABLE</span>
        </div>
      </section>

      {/* Right Column: Sign In Card */}
      <section className="flex-1 flex flex-col items-center justify-between p-6 sm:p-12 md:p-16 bg-[#FBFBFC] min-h-screen">
        <div className="w-full max-w-md my-auto space-y-8 text-left">
          
          {/* Card Box */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 sm:p-10 space-y-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h1>
              <p className="text-xs text-slate-400 mt-2 font-semibold">Enter your corporate credentials to continue.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                  Work Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-[13px] text-slate-400 text-lg">mail</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50/30 focus:bg-white transition-all duration-150"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-bold text-slate-900 hover:text-indigo-600 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-[13px] text-slate-400 text-lg">lock</span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50/30 focus:bg-white transition-all duration-150"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 flex items-center justify-center p-1.5 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Keep me signed in */}
              <div className="flex items-center gap-2.5 pt-1">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-4.5 h-4.5 border-slate-300 rounded text-black focus:ring-black accent-black cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-slate-500 font-semibold cursor-pointer select-none">
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full py-3.5 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer group"
              >
                Sign In
                <span className="material-symbols-outlined text-lg font-bold transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4.5">
              <div className="flex-grow h-px bg-slate-100" />
              <span className="px-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest">or continue with</span>
              <div className="flex-grow h-px bg-slate-100" />
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
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
              New to AssetFlow?{' '}
              <Link 
                to="/signup" 
                className="text-black hover:text-indigo-600 hover:underline font-extrabold ml-0.5 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Footer corporate links */}
          <div className="flex justify-center gap-6 text-[9px] text-slate-400 font-black tracking-widest pt-4">
            <a href="#" className="hover:text-slate-600 transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-slate-600 transition-colors">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-slate-600 transition-colors">SYSTEM STATUS</a>
          </div>

        </div>
      </section>

    </div>
  );
}
