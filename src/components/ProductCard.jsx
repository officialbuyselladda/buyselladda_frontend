import { Link } from 'react-router-dom';
import { Eye, MapPin, Tag } from 'lucide-react';
import { cn } from '../utils';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product._id}`} className="group block p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden">
      <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
        {product.images && product.images[0]?.url && (
          <img 
            src={product.images[0].url} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="font-bold text-xl text-gray-900">₹{product.price.toLocaleString()}</span>
          <div className="flex items-center space-x-1">
            <Tag size={16} />
            <span>{product.category}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Eye size={14} />
            <span>{product.views || 0} views</span>
          </div>
          <span>{product.condition}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
          <MapPin size={16} />
          <span>{product.location}</span>
        </div>
      </div>
      
      {product.status !== 'approved' && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
          {product.status === 'pending' ? 'Pending Approval' : 'Rejected'}
        </div>
      )}
    </Link>
  );
};

export default ProductCard;

