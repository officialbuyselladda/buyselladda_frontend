import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setStep('otp');
      toast.success(data.message || 'If this email exists, a password reset OTP has been sent.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error('Please enter the 6 digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-reset-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      const resetToken = data.data?.resetToken;
      if (!resetToken) throw new Error('Reset token missing');
      toast.success(data.message || 'OTP verified');
      navigate(`/reset-password/${resetToken}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl grid-cols-1 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl lg:grid-cols-[minmax(0,1fr)_460px]">
        <section className="hidden bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-10 lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="inline-flex w-fit flex-col items-start">
            <img src="/logo-1.png" alt="BuySellAdda" className="h-16 w-auto object-contain" />
            <span className="mt-2 text-sm font-bold text-gray-700">Har Deal, Ek Nayi Shuruaat</span>
          </Link>

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-700 shadow-sm">
              <ShieldCheck size={18} />
              Secure account recovery
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight text-gray-950">
              Recover access to your BuySellAdda account smoothly.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-gray-600">
              Enter your registered email, verify the OTP sent to your inbox, and create a fresh password safely.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm font-semibold text-gray-700">
            <div className="rounded-lg bg-white p-4 shadow-sm">Secure reset</div>
            <div className="rounded-lg bg-white p-4 shadow-sm">Account safe</div>
            <div className="rounded-lg bg-white p-4 shadow-sm">Fast access</div>
          </div>
        </section>

        <section className="flex flex-col justify-center p-6 sm:p-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 text-center lg:hidden">
              <Link to="/" className="inline-flex justify-center">
                <img src="/logo-1.png" alt="BuySellAdda" className="h-20 w-auto object-contain" />
              </Link>
              <p className="mt-3 text-sm font-bold text-gray-600">Har Deal, Ek Nayi Shuruaat</p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-950">Forgot password?</h2>
              <p className="mt-2 text-sm text-gray-600">
                {step === 'email'
                  ? 'Enter your email to receive a reset OTP.'
                  : `Enter the OTP sent to ${email.trim().toLowerCase()}.`}
              </p>
            </div>

            {step === 'otp' && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="font-semibold">OTP sent. Check inbox or spam folder, then continue here.</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={step === 'email' ? handleEmailSubmit : handleOtpSubmit}>
              {step === 'email' ? (
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Reset OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-center text-xl font-black tracking-[0.35em] text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="000000"
                      autoComplete="one-time-code"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Please wait...' : step === 'email' ? 'Send reset OTP' : 'Verify OTP'}
              </button>

              {step === 'otp' && (
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Resend OTP
                </button>
              )}
            </form>

            <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700">
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;
