import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Phone, Mail, MapPin, MessageCircle, ArrowLeft,
  Clock, Eye, User, Heart, Share2, ShieldCheck,
  ChevronLeft, ChevronRight, ZoomIn, Tag, Layers
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CONDITIONS, PRODUCT_STATUS } from '../utils';
import toast from 'react-hot-toast';

/* ─── Image Gallery ─── */
const Gallery = ({ images = [], title }) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const list = images.length ? images : [{ url: '/placeholder.jpg' }];

  const prev = () => setActive(i => (i - 1 + list.length) % list.length);
  const next = () => setActive(i => (i + 1) % list.length);

  return (
    <>
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden select-none">
        <img
          src={list[active]?.url}
          alt={title}
          className="w-full h-64 sm:h-80 md:h-96 object-cover cursor-zoom-in"
          onClick={() => setZoomed(true)}
        />
        {list.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <ZoomIn className="w-3 h-3" />
          {active + 1}/{list.length}
        </div>
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                active === i ? 'border-orange-500 scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={list[active]?.url}
            alt={title}
            className="max-h-full max-w-full object-contain rounded-xl"
          />
          <button className="absolute top-4 right-4 text-white text-2xl font-bold">✕</button>
        </div>
      )}
    </>
  );
};

/* ─── Skeleton Loader ─── */
const Skeleton = () => (
  <div className="min-h-screen bg-[#F5F5F5] py-4 sm:py-8">
    <div className="max-w-6xl mx-auto px-3 sm:px-6 animate-pulse space-y-4">
      <div className="h-5 w-32 bg-gray-200 rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-80 bg-white rounded-2xl" />
          <div className="h-48 bg-white rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-44 bg-white rounded-2xl" />
          <div className="h-36 bg-white rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

/* ─── Main Component ─── */
const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactMethod, setContactMethod] = useState('');
  const [wishlisted, setWishlisted] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(res => res.data.data),
  });

  const handleContact = () => {
    if (!user) {
      toast.error('Please login to contact seller');
      navigate('/login');
      return;
    }
    if (!contactMethod) {
      toast.error('Please select a contact method');
      return;
    }
    toast.success(`Contacting seller via ${contactMethod}`);
    // TODO: Start chat / call with seller
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product?.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (isLoading) return <Skeleton />;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-3 bg-[#F5F5F5]">
      <p className="text-red-500 font-semibold">Failed to load listing</p>
      <Link to="/" className="text-orange-500 text-sm underline">← Back to listings</Link>
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <p className="text-gray-500">Product not found</p>
    </div>
  );

  const isSold = product.status === 'sold';

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-4">

        {/* ── Back ── */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* ══ LEFT COLUMN ══ */}
          <div className="lg:col-span-2 space-y-4">

            {/* ── Gallery Card ── */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              {isSold && (
                <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-3 py-2 rounded-xl text-center">
                  🚫 This item is already sold
                </div>
              )}
              <Gallery images={product.images} title={product.title} />
            </div>

            {/* ── Title & Price ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(product.createdAt))} ago
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {product.views || 0} views
                    </span>
                    {product.condition && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{product.condition}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                    {product.title}
                  </h1>
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </p>
                  {product.status && product.status !== 'approved' && (
                    <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {PRODUCT_STATUS[product.status] || product.status}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setWishlisted(w => !w)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      wishlisted
                        ? 'bg-red-50 border-red-300 text-red-500'
                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 flex items-center justify-center transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Description ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3 text-base">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description || 'No description provided.'}
              </p>
            </div>

            {/* ── Details Table ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4 text-base">Product Details</h2>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Category', value: product.category, icon: <Layers className="w-4 h-4" /> },
                  { label: 'Condition', value: product.condition, icon: <Tag className="w-4 h-4" /> },
                  { label: 'Location', value: product.location, icon: <MapPin className="w-4 h-4" /> },
                  { label: 'Posted', value: `${formatDistanceToNow(new Date(product.createdAt))} ago`, icon: <Clock className="w-4 h-4" /> },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2.5">
                    <span className="text-gray-400 text-sm flex items-center gap-2">
                      {row.icon}
                      {row.label}
                    </span>
                    <span className="text-gray-800 text-sm font-medium capitalize text-right max-w-[55%] truncate">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Safety Tips ── */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-700 mb-1">Safety Tips</p>
                  <ul className="text-xs text-orange-600 space-y-0.5 list-disc list-inside">
                    <li>Meet seller in a public place</li>
                    <li>Check the item before paying</li>
                    <li>Don't pay in advance or transfer money</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT SIDEBAR ══ */}
          <div className="space-y-4">

            {/* ── Seller Card ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Seller Info</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{product.sellerName || 'Seller'}</p>
                  {product.sellerEmail && (
                    <p className="text-xs text-gray-400 truncate">{product.sellerEmail}</p>
                  )}
                </div>
              </div>
              {product.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-xl">
                  <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span className="truncate">{product.location}</span>
                </div>
              )}

              {/* ── Contact Method ── */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setContactMethod('phone')}
                  className={`py-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all text-sm font-medium ${
                    contactMethod === 'phone'
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  Call
                </button>
                <button
                  onClick={() => setContactMethod('message')}
                  className={`py-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all text-sm font-medium ${
                    contactMethod === 'message'
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </button>
              </div>

              <button
                onClick={handleContact}
                disabled={!contactMethod || isSold}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                  bg-orange-500 hover:bg-orange-600 text-white
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contactMethod === 'phone'
                  ? <><Phone className="w-4 h-4" /> Show Phone Number</>
                  : <><Mail className="w-4 h-4" /> Send Message</>
                }
              </button>

              {product.phone && contactMethod === 'phone' && user && (
                <a
                  href={`tel:${product.phone}`}
                  className="mt-2 flex items-center justify-center gap-2 text-orange-600 font-bold text-lg"
                >
                  <Phone className="w-5 h-5" />
                  {product.phone}
                </a>
              )}
            </div>

            {/* ── Ad ID ── */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-xs text-gray-400">Ad ID</p>
              <p className="text-xs font-mono text-gray-600 mt-0.5 break-all">{product._id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;