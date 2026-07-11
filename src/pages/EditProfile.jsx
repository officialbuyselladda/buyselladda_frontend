import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Image, Mail, MapPin, Phone, Save, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  name: yup.string().trim().min(2, 'Name must be at least 2 characters').max(30, 'Name cannot exceed 30 characters').required('Name is required'),
  phone: yup.string().trim().matches(/^$|^[6-9]\d{9}$/, 'Enter a valid 10 digit Indian mobile number'),
  location: yup.string().trim().max(80, 'Location cannot exceed 80 characters'),
  avatarUrl: yup.string().trim().url('Enter a valid image URL').nullable().transform((value) => value || ''),
});

const getAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (typeof avatar === 'string') return avatar;
  return avatar.url || '';
};

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo(() => ({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    avatarUrl: getAvatarUrl(user?.avatar),
  }), [user]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  if (!user) return null;

  const avatarUrl = watch('avatarUrl');
  const name = watch('name') || user.name || 'User';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

  const onSubmit = async (values) => {
    setSaving(true);
    const payload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      location: values.location.trim(),
    };

    if (values.avatarUrl.trim()) {
      payload.avatar = { url: values.avatarUrl.trim() };
    } else if (getAvatarUrl(user.avatar)) {
      payload.avatar = {};
    }

    const result = await updateProfile(payload);
    setSaving(false);
    if (result?.success) navigate('/profile');
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link to="/profile" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700">
            <ArrowLeft size={17} />
            Back
          </Link>
          <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
            <CheckCircle2 size={14} className="mr-1" />
            Account settings
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
          <div className="border-b border-gray-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Edit Profile</p>
            <h1 className="mt-2 text-3xl font-black text-gray-950 sm:text-4xl">Keep your seller profile updated</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Your name, phone, and location help buyers connect with confidence across ads and chats.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-0 lg:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="border-b border-gray-100 bg-gray-50 p-6 lg:border-b-0 lg:border-r">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-3xl font-black text-orange-700 ring-4 ring-white">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="mt-5 text-center">
                  <p className="truncate text-lg font-black text-gray-950">{name}</p>
                  <p className="mt-1 truncate text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                  Profile info updates instantly on your navbar, profile page, seller cards, and account menu.
                </div>
              </div>
            </aside>

            <section className="p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full name" error={errors.name?.message} className="sm:col-span-2">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('name')}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Enter full name"
                    autoComplete="name"
                  />
                </Field>

                <Field label="Email address">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={user.email || ''}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-500 outline-none"
                  />
                </Field>

                <Field label="Phone number" error={errors.phone?.message}>
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('phone')}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="9876543210"
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </Field>

                <Field label="Location" error={errors.location?.message} className="sm:col-span-2">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('location')}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="City, area, or state"
                    autoComplete="address-level2"
                  />
                </Field>

                <Field label="Profile image URL" error={errors.avatarUrl?.message} className="sm:col-span-2">
                  <Image className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('avatarUrl')}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="https://example.com/profile.jpg"
                    autoComplete="url"
                  />
                </Field>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
                <Link to="/profile" className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-50">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </main>
  );
};

const Field = ({ label, error, className = '', children }) => (
  <div className={className}>
    <label className="mb-2 block text-sm font-black text-gray-800">{label}</label>
    <div className="relative">{children}</div>
    {error && <p className="mt-1.5 text-sm font-semibold text-red-600">{error}</p>}
  </div>
);

export default EditProfile;
