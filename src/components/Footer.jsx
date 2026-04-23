import { Link } from 'react-router-dom';
import { CATEGORIES } from '../utils';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '../utils';

const Footer = () => {
  const popularCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 border-t border-gray-700">
      {/* Top Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center mb-10">
          <img
            src="https://i.ibb.co/d4v1q3jZ/logo.jpg"
            alt="DealKro Logo"
            className="h-20 w-auto object-contain"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Popular Categories */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              Popular Categories
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link 
                    to="/" 
                    className="hover:text-white hover:underline text-sm transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      const url = new URL(window.location);
                      url.searchParams.set('category', cat.toLowerCase());
                      window.location = url.toString();
                    }}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  View All →
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">About DealKro</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Investors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">DealKro Stories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Media Center</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Sell on DealKro</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Help & Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Report a Problem</a></li>
              <li><a href="#" className="hover:text-white transition-colors">24x7 Help</a></li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Download App</h3>
            <p className="text-sm mb-4 opacity-90">Your easier way to buy &amp; sell</p>
            <div className="space-y-3">
              <a href="#" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                Get App Store
              </a>
              <a href="#" className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                Get Google Play
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Contact Us</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-primary-400 flex-shrink-0" />
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-4 w-4 text-primary-400 flex-shrink-0" />
                <span>support@dealkro.in</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-primary-400 flex-shrink-0" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
            
            {/* Social */}
            <div className="flex gap-4">
              <a href="#" className="p-2 hover:bg-gray-800 rounded-lg transition-all"><Facebook size={18} /></a>
              <a href="#" className="p-2 hover:bg-gray-800 rounded-lg transition-all"><Twitter size={18} /></a>
              <a href="#" className="p-2 hover:bg-gray-800 rounded-lg transition-all"><Instagram size={18} /></a>
              <a href="#" className="p-2 hover:bg-gray-800 rounded-lg transition-all"><Youtube size={18} /></a>
            </div>

            {/* Cities */}
            <div className="flex flex-wrap gap-4 justify-center">
              {popularCities.map((city) => (
                <Link
                  key={city}
                  to="/"
                  className="hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const url = new URL(window.location);
                    url.searchParams.set('city', city.toLowerCase());
                    window.location = url.toString();
                  }}
                >
                  {city}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p>&copy; 2024 DealKro. All rights reserved | <a href="#" className="hover:text-white">Privacy</a> | <a href="#" className="hover:text-white">Terms</a></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

