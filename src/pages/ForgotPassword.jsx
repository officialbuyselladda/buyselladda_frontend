import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message || 'If this email exists, password reset instructions will be sent.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl lg:grid-cols-[minmax(0,1fr)_460px]">
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
              Enter your registered email and follow the reset instructions to get back to your ads, chats, and favorites.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm font-semibold text-gray-700">
            <div className="rounded-2xl bg-white p-4 shadow-sm">Secure reset</div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">Account safe</div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">Fast access</div>
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
              <p className="mt-2 text-sm text-gray-600">Enter your email to recover your BuySellAdda account.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
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

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>
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
