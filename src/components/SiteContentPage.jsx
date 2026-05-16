import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../services/api';

const fallbackPages = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Your privacy matters. We protect your personal information and explain how we collect, use, and safeguard your data.',
    accent: 'orange',
    updatedText: 'January 1, 2025',
    sections: [
      { heading: '1. Information We Collect', body: 'We collect information you provide directly, such as your name, email, phone number, and location when you create an account, post ads, or contact us.' },
      { heading: '2. How We Use Your Information', body: 'Your data helps us provide services, improve our platform, communicate with you, and prevent fraud. We never sell your personal information.' },
    ],
  },
  terms: {
    title: 'Terms of Use',
    subtitle: 'By using BuySellAdda, you agree to these terms. Please read carefully.',
    accent: 'emerald',
    updatedText: 'January 1, 2025',
    sections: [
      { heading: '1. Acceptance of Terms', body: 'These Terms govern your use of BuySellAdda platform. Continued use means acceptance.' },
      { heading: '2. User Conduct', body: 'No spam, illegal content, scams. Respect other users.' },
    ],
  },
};

const accentClasses = {
  emerald: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  blue: 'from-blue-500 to-blue-600',
  red: 'from-red-500 to-red-600',
};

const SiteContentPage = ({ pageKey }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['siteContent'],
    queryFn: contentApi.getSiteContent,
    staleTime: 5 * 60 * 1000,
  });

  const page = data?.pages?.[pageKey] || fallbackPages[pageKey] || {
    title: 'Page',
    subtitle: '',
    accent: 'emerald',
    updatedText: '',
    sections: [],
  };
  const accent = accentClasses[page.accent] || accentClasses.emerald;

  if (isLoading && !page.title) {
    return <div className="min-h-screen bg-gray-50 px-4 py-16 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl sm:p-12">
          <div className="mb-12 text-center">
            <h1 className="mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-black bg-clip-text text-4xl font-black text-transparent md:text-6xl">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600 md:text-xl">
                {page.subtitle}
              </p>
            )}
          </div>

          <div className="space-y-10">
            {(page.sections || []).map((section, index) => (
              <section key={`${section.heading}-${index}`}>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">{section.heading}</h2>
                <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">{section.body}</p>
              </section>
            ))}
          </div>

          {page.updatedText && (
            <div className={`mt-12 rounded-2xl bg-gradient-to-r ${accent} p-8 text-white shadow-2xl`}>
              <h3 className="mb-4 text-2xl font-bold">Last Updated</h3>
              <p className="text-lg">{page.updatedText}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SiteContentPage;
