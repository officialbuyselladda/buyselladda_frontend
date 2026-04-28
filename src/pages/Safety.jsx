import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Lock, EyeOff } from 'lucide-react';


const Safety = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-8 py-4 rounded-full mb-8">
            <Shield className="w-8 h-8 mr-3" />
            <span className="font-bold text-xl">Safer Transactions Guaranteed</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-6">
            Stay Safe
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn how to buy and sell securely on India's #1 local marketplace.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Safety Tips */}
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 flex items-center gap-4">
              <Shield className="w-12 h-12 text-emerald-600" />
              Top Safety Tips
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <CheckCircle className="w-12 h-12 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-3">Meet in Public</h4>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Always meet in busy public places like malls, cafes, or police stations during daylight hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <CheckCircle className="w-12 h-12 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-3">Inspect Before Paying</h4>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Test products thoroughly and verify condition before making payment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <CheckCircle className="w-12 h-12 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-3">Use Safe Payments</h4>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Prefer cash on delivery or bank transfer. Never pay in advance to strangers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Avoid */}
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-10 rounded-3xl shadow-2xl">
              <AlertTriangle className="w-20 h-20 mx-auto mb-6 opacity-90" />
              <h3 className="text-3xl font-bold text-center mb-6">Common Scams</h3>
              <ul className="space-y-3 text-lg opacity-95">
                <li>• Too-good-to-be-true deals</li>
                <li>• Requests for advance payment</li>
                <li>• Pressure to decide quickly</li>
                <li>• Fake payment confirmations</li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Lock className="w-8 h-8 text-green-600" />
                  <span>AI fraud detection</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <EyeOff className="w-8 h-8 text-blue-600" />
                  <span>Anonymous browsing</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Shield className="w-8 h-8 text-emerald-600" />
                  <span>Verified badges</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                  <span>24/7 monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a href="/report" className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-5 px-12 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg">
            <Shield className="w-6 h-6" />
            Report Suspicious Activity
          </a>
        </div>
      </main>
      
    </div>
  );
};

export default Safety;

