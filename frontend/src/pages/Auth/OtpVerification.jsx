import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyOtpRequest, sendOtpRequest, signupRequest } from '../../lib/authApi';
import { saveAuthSession } from '../../lib/authSession';

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state?.signupData;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!signupData) {
      navigate('/signup', { replace: true });
      return;
    }
  }, [signupData, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }

    setSubmitting(true);
    try {
      // First verify OTP
      const verifyData = await verifyOtpRequest({ email: signupData.email, otp: otpString });

      if (!verifyData.success) {
        toast.error(verifyData.message || 'Invalid or expired OTP.');
        return;
      }

      // If OTP verified, create the account
      const data = await signupRequest(signupData);

      if (!data.success) {
        toast.error(data.message || 'Unable to create account.');
        return;
      }

      saveAuthSession(data);
      toast.success(data.message || `Account created successfully for ${signupData.fullName}!`);
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const data = await sendOtpRequest({ email: signupData.email });
      if (data.success) {
        toast.success('A new OTP has been sent to your email.');
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  if (!signupData) return null;

  const email = signupData.email || '';
  const maskedEmail = email.length > 3
    ? email.slice(0, 3) + '******' + email.slice(email.indexOf('@'))
    : email;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FBFBFC] font-sans antialiased">
      {/* Left Column */}
      <section 
        className="hidden md:flex md:w-1/2 bg-cover bg-center relative flex-col justify-between p-16 text-left overflow-hidden"
        style={{ backgroundImage: 'url("/signup.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/60 to-slate-950/85 z-0" />
        <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay z-0" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10 flex-shrink-0 p-1.5">
            <img src="/logo.svg" className="w-full h-full object-contain" alt="AssetFlow Logo" />
          </div>
          <div>
            <div className="text-lg font-black text-white tracking-tight leading-none">AssetFlow</div>
            <div className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Enterprise ERP</div>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-5 mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
            One last step.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            Verify your email address to activate your organization account and unlock the full AssetFlow suite.
          </p>
        </div>
      </section>

      {/* Right Column */}
      <section className="flex-1 flex flex-col items-center justify-between p-6 sm:p-12 md:p-16 bg-[#FBFBFC] min-h-screen">
        <div className="w-full max-w-md my-auto space-y-8 text-left">
          
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 sm:p-10 space-y-6">
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-100 rounded-full bg-slate-50 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
              <span className="material-symbols-outlined text-xs text-slate-500">verified</span>
              Email Verification
            </div>

            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check Your Inbox</h1>
              <p className="text-xs text-slate-400 mt-2 font-semibold leading-relaxed">
                We sent a 6-digit verification code to{' '}
                <span className="text-slate-700 font-extrabold">{maskedEmail}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP Inputs */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3 text-center">
                  Verification Code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-black border border-slate-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50/30 focus:bg-white transition-all duration-150"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Verifying...' : 'Verify & Create Account'}
                <span className="material-symbols-outlined text-lg font-bold transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
              </button>
            </form>

            {/* Resend */}
            <div className="text-center pt-2">
              {timer > 0 ? (
                <p className="text-xs text-slate-400 font-semibold">
                  Resend code in <span className="text-slate-700 font-extrabold">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-xs font-extrabold text-black hover:text-indigo-600 hover:underline transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'Resending...' : 'Resend verification code'}
                </button>
              )}
            </div>

          </div>

          {/* Back to Signup */}
          <div className="text-center text-xs font-semibold text-slate-400">
            Wrong email?{' '}
            <button 
              onClick={() => navigate('/signup')}
              className="text-black hover:text-indigo-600 hover:underline font-extrabold transition-colors cursor-pointer"
            >
              Go back
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}