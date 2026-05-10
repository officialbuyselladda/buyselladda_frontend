import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Share2,
  Tag,
  User,
  ZoomIn,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { PRODUCT_STATUS } from '../utils';
import { getImageUrl, placeholderImage } from '../utils/image';
import toast from 'react-hot-toast';

const formatPrice = (price) => `Rs. ${Number(price || 0).toLocaleString('en-IN')}`;

const Gallery = ({ images = [], title }) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const list = images.length ? images : [{ url: placeholderImage }];
  const activeImage = getImageUrl(list[active]);

  const prev = () => setActive((index) => (index - 1 + list.length) % list.length);
  const next = () => setActive((index) => (index + 1) % list.length);

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid bg-white md:grid-cols-[96px_minmax(0,1fr)]">
          {list.length > 1 && (
            <div className="hidden max-h-[560px] flex-col gap-2 overflow-y-auto border-r border-gray-200 bg-white p-3 md:flex">
              {list.map((image, index) => (
                <button
                  key={`${getImageUrl(image)}-side-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-md border-2 bg-gray-100 transition ${
                    active === index ? 'border-gray-950' : 'border-gray-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = placeholderImage;
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex h-[340px] items-center justify-center bg-[#111111] sm:h-[460px] lg:h-[560px]">
            <img
              src={activeImage}
              alt={title}
              className="h-full w-full cursor-zoom-in object-contain p-2 sm:p-4"
              onClick={() => setZoomed(true)}
              onError={(event) => {
                event.currentTarget.src = placeholderImage;
              }}
            />

            {list.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-950 shadow transition hover:bg-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-950 shadow transition hover:bg-white"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setZoomed(true)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-950 shadow"
            >
              <ZoomIn size={14} />
              {active + 1}/{list.length}
            </button>
          </div>
        </div>

        {list.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-gray-200 p-3 md:hidden">
            {list.map((image, index) => (
              <button
                key={`${getImageUrl(image)}-bottom-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1}`}
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 bg-gray-100 transition ${
                  active === index ? 'border-gray-950' : 'border-gray-200 opacity-75'
                }`}
              >
                <img
                  src={getImageUrl(image)}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = placeholderImage;
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={activeImage}
            alt={title}
            className="max-h-full max-w-full rounded-lg object-contain"
            onError={(event) => {
              event.currentTarget.src = placeholderImage;
            }}
          />
          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold text-white"
            onClick={() => setZoomed(false)}
            aria-label="Close preview"
          >
            x
          </button>
        </div>
      )}
    </>
  );
};

const Skeleton = () => (
  <div className="min-h-screen bg-gray-50 py-5 sm:py-8">
    <div className="mx-auto max-w-7xl animate-pulse space-y-5 px-4 sm:px-6">
      <div className="h-5 w-32 rounded-full bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="h-[420px] rounded-xl bg-white" />
          <div className="h-44 rounded-xl bg-white" />
        </div>
        <div className="space-y-4">
          <div className="h-72 rounded-xl bg-white" />
          <div className="h-32 rounded-xl bg-white" />
        </div>
      </div>
    </div>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactMethod, setContactMethod] = useState('message');
  const [wishlisted, setWishlisted] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((res) => res.data.data),
  });

  const { data: relatedProducts = [], isLoading: relatedLoading } = useQuery({
    queryKey: ['related-products', product?.category, id],
    enabled: Boolean(product?.category && id),
    queryFn: async () => {
      const params = new URLSearchParams({
        category: product.category,
        limit: '8',
        page: '1',
      });
      const { data } = await api.get(`/products?${params}`);
      return (data.data?.products || []).filter((item) => item?._id && item._id !== id).slice(0, 4);
    },
  });

  const detailRows = useMemo(() => {
    if (!product) return [];
    return [
      { label: 'Category', value: product.category, icon: Layers },
      { label: 'Condition', value: product.condition, icon: Tag },
      { label: 'Location', value: product.location, icon: MapPin },
      {
        label: 'Posted',
        value: product.createdAt ? `${formatDistanceToNow(new Date(product.createdAt))} ago` : '',
        icon: CalendarDays,
      },
    ].filter((row) => row.value);
  }, [product]);

  const handleContact = async () => {
    if (!user) {
      toast.error('Please login to contact seller');
      navigate('/login');
      return;
    }

    if (contactMethod === 'message') {
      try {
        const { data } = await api.post(`/products/${id}/contact`);
        if (data.success) {
          toast.success('Chat started with seller');
          navigate(`/chats/${data.data.chat._id}`);
        }
      } catch (contactError) {
        toast.error(contactError.response?.data?.message || 'Failed to start chat');
      }
      return;
    }

    toast.success('Phone number is visible below');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    } catch {
      toast.error('Could not share this listing');
    }
  };

  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 text-center">
        <p className="font-semibold text-red-500">Failed to load listing</p>
        <Link to="/" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
          Back to listings
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const isSold = product.status === 'sold';
  const statusLabel = PRODUCT_STATUS[product.status] || product.status;

  return (
    <div className="min-h-screen bg-gray-50 py-5 sm:py-8">
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <Gallery images={product.images} title={product.title} />

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                    {product.condition && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
                        {product.condition}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Eye size={14} />
                      {product.views || 0} views
                    </span>
                    {product.createdAt && (
                      <span>{formatDistanceToNow(new Date(product.createdAt))} ago</span>
                    )}
                  </div>
                  <h1 className="text-2xl font-black leading-tight text-gray-950 sm:text-4xl">
                    {product.title}
                  </h1>
                  <p className="mt-3 text-3xl font-black text-orange-600 sm:text-4xl">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWishlisted((value) => !value)}
                    aria-label="Save listing"
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                      wishlisted
                        ? 'border-red-200 bg-red-50 text-red-500'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    <Heart size={20} className={wishlisted ? 'fill-red-500' : ''} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share listing"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-orange-300 hover:text-orange-600"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {product.status && product.status !== 'approved' && (
                <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
                  Status: {statusLabel}
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-gray-950">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-650">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-950">Details</h2>
                <div className="mt-3 divide-y divide-gray-100">
                  {detailRows.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between gap-4 py-3">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <Icon size={16} />
                        {label}
                      </span>
                      <span className="max-w-[55%] truncate text-right text-sm font-semibold capitalize text-gray-900">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-orange-100 bg-orange-50 p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-orange-600" />
                <div>
                  <h2 className="font-bold text-orange-900">Stay safe while buying</h2>
                  <div className="mt-2 grid gap-2 text-sm text-orange-800 sm:grid-cols-3">
                    <p>Meet in a public place.</p>
                    <p>Inspect the item before payment.</p>
                    <p>Avoid advance transfers.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
            {isSold && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">
                This item is already sold
              </div>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Seller</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
                  <User size={26} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-gray-950">
                    {product.sellerName || product.user?.name || 'Seller'}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <BadgeCheck size={14} />
                    Verified profile
                  </p>
                </div>
              </div>

              {product.location && (
                <div className="mt-5 flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                  <span>{product.location}</span>
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContactMethod('message')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold transition ${
                    contactMethod === 'message'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}
                >
                  <MessageCircle size={18} />
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod('phone')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-bold transition ${
                    contactMethod === 'phone'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}
                >
                  <Phone size={18} />
                  Call
                </button>
              </div>

              <button
                type="button"
                onClick={handleContact}
                disabled={isSold}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {contactMethod === 'phone' ? <Phone size={18} /> : <Mail size={18} />}
                {contactMethod === 'phone' ? 'Show phone number' : 'Message seller'}
              </button>

              {product.phone && contactMethod === 'phone' && user && (
                <a
                  href={`tel:${product.phone}`}
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-lg font-black text-orange-700"
                >
                  <Phone size={18} />
                  {product.phone}
                </a>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Ad ID</p>
              <p className="mt-2 break-all font-mono text-xs text-gray-700">{product._id}</p>
            </section>
          </aside>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-950">Related ads</h2>
              <p className="mt-1 text-sm text-gray-500">
                More listings from {product.category || 'this category'}
              </p>
            </div>
            {product.category && (
              <Link
                to={`/?category=${encodeURIComponent(product.category)}`}
                className="hidden text-sm font-bold text-orange-600 hover:text-orange-700 sm:inline"
              >
                View all
              </Link>
            )}
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-80 animate-pulse rounded-xl bg-white" />
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related._id} product={related} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center text-sm text-gray-500">
              No related ads found right now.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProductDetail;
