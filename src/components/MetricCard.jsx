import React from 'react';
import { Link } from 'react-router-dom';

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  link, 
  change = null,
  className = '' 
}) => {
  const gradientClass = `from-${color}-500 to-${color}-600`;

  const content = (
    <div className={`group bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-white/50 hover:border-${color}-200/50 transition-all hover:-translate-y-2 h-full ${className}`}>
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg group-hover:scale-105 transition-all`}>
          <Icon size={28} className="text-white drop-shadow-lg" />
        </div>
        <div>
          <p className="text-sm text-gray-600 uppercase tracking-wide font-medium group-hover:text-primary-600 transition-colors">
            {title}
          </p>
          <p className="text-4xl font-bold text-gray-900 mt-2 leading-tight">
            {value}
          </p>
          {change && (
            <p className={`text-sm font-semibold mt-1 flex items-center gap-1 ${
              change > 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return link ? <Link to={link} className="block h-full">{content}</Link> : content;
};

export default MetricCard;

