import React from 'react';
import { Search, Mail, Phone, Shield, FileText, MessageCircle } from 'lucide-react';

import { cn } from '../utils';

const Help = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or get help fast.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="group cursor-pointer">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group-hover:-translate-y-2">
              <Search className="w-16 h-16 opacity-80 mb-6 mx-auto" />
              <h3 className="text-2xl font-bold mb-4">Search Help</h3>
              <p className="opacity-90">Search 1000+ articles</p>
            </div>
          </div>
          
          <a href="/contact" className="group">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group-hover:-translate-y-2">
              <Mail className="w-16 h-16 opacity-80 mb-6 mx-auto" />
              <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
              <p className="opacity-90">Email support team</p>
            </div>
          </a>
          
          <a href="/support" className="group">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group-hover:-translate-y-2">
              <MessageCircle className="w-16 h-16 opacity-80 mb-6 mx-auto" />
              <h3 className="text-2xl font-bold mb-4">Live Support</h3>
              <p className="opacity-90">Chat with agent</p>
            </div>
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <FileText className="w-10 h-10 text-orange-600" />
              Popular Articles
            </h2>
            <div className="space-y-4">
              <a href="#" className="block p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all">
                <h4 className="font-semibold text-gray-900 mb-2">How to post an ad?</h4>
                <p className="text-gray-600 text-sm">Step-by-step guide...</p>
              </a>
              <a href="/safety" className="block p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all">
                <h4 className="font-semibold text-gray-900 mb-2">Stay safe on DealKro</h4>
                <p className="text-gray-600 text-sm">Safety tips & guidelines</p>
              </a>
              <a href="/report" className="block p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all">
                <h4 className="font-semibold text-gray-900 mb-2">Report a problem</h4>
                <p className="text-gray-600 text-sm">How to report violations</p>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-10 rounded-3xl shadow-2xl">
            <Phone className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl p-4 mb-6 mx-auto" />
            <h2 className="text-3xl font-bold mb-6">Still Need Help?</h2>
            <p className="opacity-90 mb-8 leading-relaxed">Our support team responds within 24 hours.</p>
            <div className="space-y-4">
              <a href="/contact" className="block bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-2xl hover:bg-opacity-30 transition-all">
                ✉️ Email Support
              </a>
              <a href="/support" className="block bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-2xl hover:bg-opacity-30 transition-all">
                💬 Live Chat
              </a>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Help;

