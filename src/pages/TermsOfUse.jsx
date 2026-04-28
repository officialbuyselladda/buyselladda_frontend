import React from 'react';


const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 mb-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-black bg-clip-text text-transparent mb-6">
              Terms of Use
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              By using DealKro, you agree to these terms. Please read carefully.
            </p>
          </div>
          <div className="prose prose-lg max-w-none space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                These Terms govern your use of DealKro platform. Continued use means acceptance.
              </p>
            </section>
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">2. User Conduct</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                No spam, illegal content, scams. Respect other users.
              </p>
              <ul className="text-lg text-gray-700 space-y-2 ml-6 mb-4">
                <li>Prohibited: Fraud, harassment, counterfeit goods</li>
                <li>Allowed: Genuine local buying/selling</li>
              </ul>
            </section>
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Account Responsibility</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Keep login secure. You're responsible for all activity.
              </p>
            </section>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">Questions?</h3>
              <p><a href="/contact" className="underline hover:no-underline">Contact us</a> | Last updated: January 1, 2025</p>
            </div>
          </div>
        </div>
      </main>
    \
    </div>
  );
};

export default TermsOfUse;

