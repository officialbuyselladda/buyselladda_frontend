import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Phone, ShieldCheck, Store, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').max(30).required('Name is required'),
  email: yup.string().email('Valid email required').required('Email is required'),
  phone: yup.string().matches(/^[6-9]\d{9}$/, 'Enter a valid 10 digit mobile number').required('Phone number is required'),
  userType: yup.string().oneOf(['normal', 'dealer']).required(),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register: reg, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await register(data.name, data.email, data.password, data.phone, data.userType);
    setLoading(false);
    if (result.success) navigate('/login?registered=1');
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl grid-cols-1 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl lg:grid-cols-[460px_minmax(0,1fr)]">
        <section className="flex flex-col justify-center p-6 sm:p-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 text-center">
              <Link to="/" className="inline-flex justify-center lg:hidden">
                <img src="/logo-1.png" alt="BuySellAdda" className="h-20 w-auto object-contain" />
              </Link>
              <p className="mt-3 text-sm font-bold text-gray-600 lg:hidden">Har Deal, Ek Nayi Shuruaat</p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-950">Create account</h2>
              <p className="mt-2 text-sm text-gray-600">Join BuySellAdda and start buying or selling near you.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Full name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...reg('name')}
                    type="text"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm font-medium text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">10 digit phone number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...reg('phone')}
                    type="tel"
                    maxLength={10}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="9876543210"
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm font-medium text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Account type</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    {...reg('userType')}
                    defaultValue="normal"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="normal">Normal user</option>
                    <option value="dealer">Dealer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...reg('email')}
                    type="email"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm font-medium text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...reg('password')}
                    type="password"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm font-medium text-red-600">{errors.password.message}</p>}
              </div>

              <p className="text-xs leading-6 text-gray-500">
                By creating an account, you agree to BuySellAdda's{' '}
                <Link to="/terms" className="font-bold text-gray-700 hover:text-orange-600">Terms of Use</Link>
                {' '}and confirm that you have read our{' '}
                <Link to="/privacy" className="font-bold text-gray-700 hover:text-orange-600">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="hidden bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-10 lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="inline-flex w-fit flex-col items-start">
            <img src="/logo-1.png" alt="BuySellAdda" className="h-16 w-auto object-contain" />
            <span className="mt-2 text-sm font-bold text-gray-700">Har Deal, Ek Nayi Shuruaat</span>
          </Link>

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-700 shadow-sm">
              <ShieldCheck size={18} />
              Safer local selling
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight text-gray-950">
              Create your BuySellAdda account and post your first ad in minutes.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-gray-600">
              Manage listings, chat with buyers, save favorites, and raise support tickets from one secure account.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm font-semibold text-gray-700">
            <div className="rounded-lg bg-white p-4 shadow-sm">Free ad posting</div>
            <div className="rounded-lg bg-white p-4 shadow-sm">Buyer chats</div>
            <div className="rounded-lg bg-white p-4 shadow-sm">Support desk</div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
