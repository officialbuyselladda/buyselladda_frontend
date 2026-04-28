import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Shield } from 'lucide-react';

import { toast } from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent! We\'ll reply within 24 hours.');
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond fast.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl">
                  <Mail className="w-12 h-12 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Email Us</h4>
                    <p className="text-gray-600">support@dealkro.com</p>
                    <p className="text-sm text-gray-500">Best for technical issues</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl">
                  <Phone className="w-12 h-12 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Call Us</h4>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-sm text-gray-500">Mon-Sat 9AM-7PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl">
                  <MapPin className="w-12 h-12 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Visit Us</h4>
                    <p className="text-gray-600">Mumbai, Maharashtra</p>
                    <p className="text-sm text-gray-500">By appointment only</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-10 rounded-3xl shadow-2xl">
              <Shield className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h3 className="text-2xl font-bold mb-4 text-center">Safe & Secure</h3>
              <p className="text-center opacity-90 mb-8">All communications encrypted. Your data protected.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 sticky top-24">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Send Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows="6"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all resize-vertical"
                    placeholder="Tell us about your issue..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-5 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
  
    </div>
  );
};

export default Contact;

