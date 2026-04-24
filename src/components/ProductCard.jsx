import { Link } from 'react-router-dom';
import { Eye, MapPin, Tag } from 'lucide-react';
import { cn } from '../utils';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product._id}`} className="group block p-4 bg-white border border-gray-200 hover:border-olx-orange-400 hover:shadow-md rounded-lg transition-all duration-200 overflow-hidden h-full flex flex-col"> 
      <div className="aspect-[4/3] bg-gray-100 rounded-md mb-3 overflow-hidden flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-200">
        {product.images && product.images[0]?.url && (
          <img 
            src={product.images[0].url} 
            alt={product.title}
            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
          />
        )}
      </div> 
      
      <div className="space-y-2">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span className="font-black text-2xl text-olx-orange-500 tracking-tight">₹{product.price.toLocaleString()}</span>
          <div className="flex items-center space-x-1 text-xs bg-olx-orange-100 text-olx-orange-700 px-2 py-1 rounded-full">
            <Tag size={12} />
            <span className="font-medium">{product.category}</span>
          </div>
        </div> 
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Eye size={14} />
            <span>{product.views || 0} views</span>
          </div>
          <span>{product.condition}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-auto">
          <MapPin size={14} />
          <span className="truncate">{product.location}</span>
        </div> 
      </div>
      {product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 24*60*60*1000) && (
        <div className="mt-2 self-start px-2 py-1 bg-olx-orange-100 border border-olx-orange-300 text-xs font-bold text-olx-orange-700 rounded">
          NEW
        </div>
      )}
      {product.status !== 'approved' && (
        <div className="mt-1 p-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          {product.status === 'pending' ? 'Pending' : 'Rejected'}
        </div>
      )}
    </Link>
  );
};

export default ProductCard;


