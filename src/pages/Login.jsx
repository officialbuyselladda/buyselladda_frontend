import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  email: yup.string().email('Valid email required').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);
    if (result.success) navigate('/');
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
              Trusted local marketplace
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight text-gray-950">
              Sign in to manage your ads, chats, favorites, and support tickets.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-gray-600">
              Buy and sell near you with safer conversations, verified activity, and a smoother BuySellAdda experience.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm font-semibold text-gray-700">
            <div className="rounded-lg bg-white p-4 shadow-sm">Post ads fast</div>
            <div className="rounded-lg bg-white p-4 shadow-sm">Chat securely</div>
            <div className="rounded-lg bg-white p-4 shadow-sm">Track listings</div>
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
              <h2 className="text-3xl font-black text-gray-950">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-600">Login to continue to your BuySellAdda account.</p>
              {new URLSearchParams(window.location.search).get('registered') === '1' && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  Account created. Please check your email and verify your account before login.
                </div>
              )}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm font-medium text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-bold text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password')}
                    type="password"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm font-medium text-red-600">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700">
                Create one
              </Link>
            </p>

            <p className="mt-8 border-t border-gray-100 pt-5 text-center text-xs leading-6 text-gray-500">
              By signing in, you agree to BuySellAdda's{' '}
              <Link to="/terms" className="font-bold text-gray-700 hover:text-orange-600">Terms of Use</Link>
              {' '}and acknowledge our{' '}
              <Link to="/privacy" className="font-bold text-gray-700 hover:text-orange-600">Privacy Policy</Link>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
