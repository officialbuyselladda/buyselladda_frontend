import React, { useState } from 'react';
import { AlertTriangle, User, MessageCircle, Link2, Image, Send, Shield,Mail } from 'lucide-react';

import { toast } from 'react-hot-toast';
import { contactApi } from '../services/api';

const ReportProblem = () => {
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    problemType: '',
    description: '',
    adUrl: '',
    screenshot: null,
    adId: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const problemTypes = [
    { value: 'spam', label: 'Spam / Duplicate Ad' },
    { value: 'fraud', label: 'Scam / Fraud' },
    { value: 'fake', label: 'Fake / Counterfeit Item' },
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'harassment', label: 'Harassment / Abuse' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const problemLabel = problemTypes.find((t) => t.value === formData.problemType)?.label || formData.problemType;
      const adReference = [formData.adUrl, formData.adId].filter(Boolean).join(' / ');

      if (formData.screenshot) {
        const body = new FormData();
        body.append('type', 'report');
        body.append('name', formData.reporterName);
        body.append('email', formData.reporterEmail);
        body.append('message', formData.description);
        body.append('problemType', problemLabel);
        body.append('adReference', adReference);
        body.append('screenshot', formData.screenshot);
        await contactApi.sendWithFile(body);
      } else {
        await contactApi.send({
          type: 'report',
          name: formData.reporterName,
          email: formData.reporterEmail,
          message: formData.description,
          problemType: problemLabel,
          adReference,
        });
      }

      toast.success('Report submitted! Our team will review within 24 hours.');
      setFormData({ reporterName: '', reporterEmail: '', problemType: '', description: '', adUrl: '', screenshot: null, adId: '' });
      setStep(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, screenshot: e.target.files[0] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50 to-white">
      
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full mb-8 shadow-2xl">
            <AlertTriangle className="w-8 h-8 mr-3" />
            <span className="font-bold text-xl">Report Issue</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 to-orange-800 bg-clip-text text-transparent mb-6">
            Report a Problem
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us keep the platform safe. Report violations quickly.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-200 p-12 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Details</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.reporterName}
                      onChange={(e) => setFormData({...formData, reporterName: e.target.value})}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500 focus:border-orange-400 shadow-sm transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.reporterEmail}
                      onChange={(e) => setFormData({...formData, reporterEmail: e.target.value})}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500 focus:border-orange-400 shadow-sm transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  Problem Type *
                </label>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {problemTypes.map((type) => (
                    <label key={type.value} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 cursor-pointer transition-all hover:bg-orange-50 group">
                      <input
                        type="radio"
                        name="problemType"
                        value={type.value}
                        required
                        onChange={(e) => setFormData({...formData, problemType: e.target.value})}
                        className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-900 group-hover:text-orange-800">{type.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Problem Details</h2>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Description *
                  </label>
                  <textarea
                    required
                    rows="5"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500 focus:border-orange-400 shadow-sm transition-all resize-vertical"
                    placeholder="Describe the problem in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Ad URL or ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.adUrl}
                    onChange={(e) => setFormData({...formData, adUrl: e.target.value})}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500 shadow-sm transition-all"
                    placeholder="https://buyselladda.com/ads/abc123 or ad ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Screenshot (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-5 py-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-orange-400 transition-all file:mr-5 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
                  />
                </div>

                <div className="flex gap-4 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-4 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl border border-orange-200">
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="w-20 h-20 text-orange-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You for Reporting</h3>
            <p className="text-lg text-gray-700 mb-8">
              Our team reviews reports within 24 hours. You can check status in your profile.
            </p>
            <a href="/help" className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all font-bold text-gray-900">
              Help Center
            </a>
          </div>
        </div>
      </main>
   
    </div>
  );
};

export default ReportProblem;

