import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-6">
            Secure Recruitment
            <span className="block gradient-accent bg-clip-text text-transparent">
              Verification Platform
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Connect employers with verified talent through encrypted referee communication.
            No referee accounts required.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/register"
              className="gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <Link
              href="/jobs"
              className="glass text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform">
            <div className="w-12 h-12 gradient-primary rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">End-to-End Encryption</h3>
            <p className="text-gray-300">
              AES-256 encrypted messages ensure complete privacy between recruiters and referees.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform">
            <div className="w-12 h-12 gradient-primary rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Referee Signup</h3>
            <p className="text-gray-300">
              Referees access secure chats via email links. No account creation needed.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform">
            <div className="w-12 h-12 gradient-primary rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Verified References</h3>
            <p className="text-gray-300">
              Streamlined verification process with real-time communication and status tracking.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass p-12 rounded-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your hiring process?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join hundreds of companies using our platform to verify candidates securely and efficiently.
          </p>
          <Link
            href="/auth/register"
            className="gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold inline-block hover:opacity-90 transition-opacity"
          >
            Start Free Trial
          </Link>
        </div>
      </main>
    </div>
  );
}
