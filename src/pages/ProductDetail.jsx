import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, MapPin, MessageCircle, ArrowLeft, Clock, Eye, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CONDITIONS, PRODUCT_STATUS } from '../utils';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactMethod, setContactMethod] = useState('');

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
      toast.error('Select contact method');
      return;
    }
    toast.success(`Contacting seller via ${contactMethod}`);
    // TODO: Start chat with seller
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error loading product</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back & Title */}
        <div className="flex items-center mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={24} className="mr-2" />
            Back to listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images & Details */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img 
                src={product.images?.[0]?.url || '/placeholder.jpg'} 
                alt={product.title}
                className="w-full h-96 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <span>{CONDITIONS.find(c => c === product.condition) || product.condition}</span>
                  <span>•</span>
                  <Clock size={16} />
                  <span>{formatDistanceToNow(new Date(product.createdAt))} ago</span>
                  <span>•</span>
                  <Eye size={16} />
                  <span>{product.views || 0} views</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <div className="flex items-center mb-6">
                  <span className="text-4xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                  {product.status !== 'approved' && (
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {PRODUCT_STATUS[product.status] || product.status}
                    </span>
                  )}
                </div>
                <div className="space-y-2 mb-8">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              </div>
            </div>

            {/* Contact Seller */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-bold mb-6">Contact Seller</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={() => setContactMethod('phone')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center ${
                    contactMethod === 'phone' 
                      ? 'border-primary-500 bg-primary-50 text-primary-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Phone size={28} />
                  <span className="font-medium mt-1">Call</span>
                </button>
                <button 
                  onClick={() => setContactMethod('message')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center ${
                    contactMethod === 'message' 
                      ? 'border-primary-500 bg-primary-50 text-primary-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageCircle size={28} />
                  <span className="font-medium mt-1">Message</span>
                </button>
              </div>
              <button 
                onClick={handleContact}
                disabled={!contactMethod}
                className="w-full bg-primary-600 text-white py-4 px-8 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Mail size={20} />
                <span>Send Message to Seller</span>
              </button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-xl">{product.sellerName || 'Seller'}</h3>
                  <p className="text-gray-500">{product.sellerEmail}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <MapPin size={20} />
                  <span>{product.location}</span>
                </div>
                {product.phone && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Phone size={20} />
                    <span>{product.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Product Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-medium">{product.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span>{formatDistanceToNow(new Date(product.createdAt))} ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

