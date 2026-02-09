import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LogIn, Feather, Layout, Shield, Mic, Bot } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) await login(email);
  };

  const handleGoogleLogin = async () => {
    // Simulating Google Login
    // Note to User: Real Google Auth requires a GCP Project Client ID and a library like @react-oauth/google.
    // This simulated delay represents the auth process.
    await login('google_user@cabin.app');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 flex flex-col transition-colors">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-wood-500 rounded-lg flex items-center justify-center text-white">
            <Feather size={18} />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight">Cabin</span>
        </div>
        <button 
          onClick={handleGoogleLogin}
          className="text-stone-600 dark:text-stone-400 hover:text-wood-500 dark:hover:text-wood-400 font-medium transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-10 pb-20">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 dark:text-stone-50 mb-6 leading-tight max-w-3xl">
          Bring your scattered study life into <span className="text-wood-500 italic">one place</span>.
        </h1>
        <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 mb-10 max-w-2xl leading-relaxed">
          Stop digging through WhatsApp, emails, and gallery screenshots. 
          Cabin is your private sanctuary for documents, diagrams, and notes.
        </p>

        {/* Login Form */}
        <div className="w-full max-w-md bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300 text-left mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-wood-500 focus:ring-2 focus:ring-wood-500/20 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-wood-600 dark:hover:bg-wood-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? 'Entering Cabin...' : <>Enter Cabin <LogIn size={18} /></>}
            </button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-stone-900 text-stone-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" />
              <path fill="#EA4335" d="M12 4.62c1.61 0 3.1.56 4.28 1.69l3.21-3.21C17.45 1.2 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </main>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-stone-50 dark:bg-stone-800 rounded-xl">
            <div className="w-10 h-10 bg-wood-500/10 text-wood-600 dark:text-wood-500 rounded-lg flex items-center justify-center mb-4">
              <Layout size={20} />
            </div>
            <h3 className="font-serif text-lg font-bold mb-2 text-stone-900 dark:text-stone-100">Centralized Hub</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm">One home for your PDFs, images, and quick text notes.</p>
          </div>
          <div className="p-6 bg-stone-50 dark:bg-stone-800 rounded-xl">
            <div className="w-10 h-10 bg-wood-500/10 text-wood-600 dark:text-wood-500 rounded-lg flex items-center justify-center mb-4">
              <Shield size={20} />
            </div>
            <h3 className="font-serif text-lg font-bold mb-2 text-stone-900 dark:text-stone-100">Private & Secure</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm">Your data is yours. Authenticated access ensures privacy.</p>
          </div>
          <div className="p-6 bg-stone-50 dark:bg-stone-800 rounded-xl">
            <div className="w-10 h-10 bg-wood-500/10 text-wood-600 dark:text-wood-500 rounded-lg flex items-center justify-center mb-4">
              <Feather size={20} />
            </div>
            <h3 className="font-serif text-lg font-bold mb-2 text-stone-900 dark:text-stone-100">Distraction Free</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm">Designed for reading and studying, not for doom-scrolling.</p>
          </div>
        </div>
      </section>

      {/* Upcoming Features */}
      <section className="py-16 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="text-wood-600 dark:text-wood-500 text-sm font-bold tracking-wider uppercase mb-4 block">Coming Soon</span>
            <h2 className="font-serif text-3xl font-bold mb-10 text-stone-900 dark:text-stone-100">The Future of Cabin</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col items-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4">
                        <Bot size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-stone-800 dark:text-stone-100">Advanced AI Tutor</h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm">
                        Interactive quizzes generated from your notes and personalized study plans.
                    </p>
                 </div>

                 <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col items-center">
                    <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-4">
                        <Mic size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-stone-800 dark:text-stone-100">Voice Mode</h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm">
                        Record lectures and have them transcribed and summarized automatically.
                    </p>
                 </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;