import { Link, useNavigate } from 'react-router-dom';
import { Eye, MapPin, Tag, MessageCircle, Heart, User } from 'lucide-react';
import { OLXColors } from '../utils/olxTheme';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl, placeholderImage } from '../utils/image';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew =
    product.createdAt &&
    Date.parse(product.createdAt) > Date.now() - 24 * 60 * 60 * 1000;

  const imageUrl = getImageUrl(product?.images?.[0]);

  const requireLogin = () => {
    if (user) return false;
    toast.error('Please login first');
    navigate('/login');
    return true;
  };

  const handleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (requireLogin()) return;

    try {
      const { data } = await api.post('/favorites/toggle', { productId: product._id });
      toast.success(data.message || 'Favorite updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update favorite');
    }
  };

  const handleChat = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (requireLogin()) return;

    try {
      const { data } = await api.post(`/products/${product._id}/contact`);
      navigate(`/chats/${data.data.chat._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not start chat');
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block bg-white border border-gray-200 hover:border-orange-400 hover:shadow-lg rounded-xl transition-all duration-300 overflow-hidden h-full flex flex-col"
    >

      {/* 🔥 IMAGE */}
      <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(event) => {
            event.currentTarget.src = placeholderImage;
          }}
        />

        {/* NEW TAG */}
        {isNew && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </span>
          )}
      </div>

      {/* 🔥 CONTENT */}
      <div className="p-3 flex flex-col flex-grow">

        {/* PRICE */}
        <div className="flex items-center justify-between">
          <h3
            className="font-bold text-xl"
            style={{ color: OLXColors.orange }}
          >
            ₹{product.price?.toLocaleString()}
          </h3>

          <div className="flex items-center space-x-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            <Tag size={12} />
            <span>{product.category}</span>
          </div>
        </div>

        {/* TITLE */}
        <p className="text-sm text-gray-700 mt-1 line-clamp-2 min-h-[40px]">
          {product.title}
        </p>

        {/* SELLER */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={12} />
          </div>
          <span>{product.user?.name || 'Seller'}</span>
        </div>

        {/* VIEWS + CONDITION */}
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{product.views || 0}</span>
          </div>
          <span>{product.condition || "Used"}</span>
        </div>

        {/* LOCATION */}
        <div className="flex items-center text-xs text-gray-500 mt-2">
          <MapPin size={14} />
          <span className="truncate ml-1">
            {product.location || "India"}
          </span>
        </div>

        {/* STATUS */}
        {product.status !== 'approved' && (
          <div className="mt-2 p-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 text-center">
            {product.status === 'pending' ? 'Pending Approval' : 'Rejected'}
          </div>
        )}

        {/* 🔥 ACTION BUTTONS */}
        <div className="flex gap-2 mt-auto pt-3">
          <button
            onClick={handleFavorite}
            className="flex-1 py-2 border rounded-lg hover:bg-gray-100 text-sm flex items-center justify-center gap-1"
          >
            <Heart size={16} />
          </button>

          <button
            onClick={handleChat}
            className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm flex items-center justify-center gap-1"
          >
            <MessageCircle size={16} />
            Chat
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
