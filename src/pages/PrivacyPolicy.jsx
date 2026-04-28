import React from 'react';
;

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
     
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 mb-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-black bg-clip-text text-transparent mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your privacy matters. We protect your personal information and explain how we collect, use, and safeguard your data.
            </p>
          </div>
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">1. Information We Collect</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              We collect information you provide directly, such as your name, email, phone number, and location when you create an account, post ads, or contact us.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">2. How We Use Your Information</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Your data helps us provide services, improve our platform, communicate with you, and prevent fraud. We never sell your personal information.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">3. Data Sharing</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              We share data only with service providers under strict agreements and when required by law. Your ads may be visible to other users.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">4. Your Rights</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-12">
              You can access, update, or delete your information anytime. Contact us at <a href="mailto:support@dealkro.com" className="text-orange-600 hover:underline font-semibold">support@dealkro.com</a>.
            </p>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">Last Updated</h3>
              <p className="text-lg">January 1, 2025</p>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm space-y-2">
          <p>© 2025 DealKro. All rights reserved.</p>
        </div>
      </main>
     
    </div>
  );
};

export default PrivacyPolicy;

