import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { mockBackend } from '../services/mockBackend';
import { LogIn, Feather, Layout, Shield, Mic, Bot, Loader2, User as UserIcon } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [fetchedName, setFetchedName] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  
  // State for google redirect simulation
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const handleEmailBlur = async () => {
    if (email && email.includes('@') && !fetchedName) {
        setIsCheckingUser(true);
        try {
            const name = await mockBackend.getUserName(email);
            setFetchedName(name);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCheckingUser(false);
        }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) await login(email);
  };

  const handleGoogleLogin = async () => {
    // Simulate a redirect experience as requested
    setIsRedirecting(true);
    
    // Simulate network delay for redirect (2 seconds)
    setTimeout(async () => {
        // Log in with a google-like email
        await login('ankito@gmail.com');
        setIsRedirecting(false);
    }, 2000);
  };

  if (isRedirecting) {
      return (
          <div className="min-h-screen bg-white dark:bg-stone-950 flex flex-col items-center justify-center animate-fade-in-up">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-500 mb-6"></div>
              <p className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">Redirecting to Google...</p>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">Please wait while we authenticate your account.</p>
          </div>
      );
  }

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
              <div className="relative">
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (!e.target.value) setFetchedName(null);
                    }}
                    onBlur={handleEmailBlur}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-wood-500 focus:ring-2 focus:ring-wood-500/20 outline-none transition-all"
                    required
                />
                {isCheckingUser && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-stone-400" />
                    </div>
                )}
              </div>
            </div>

            {/* Found User Display */}
            <div className={`overflow-hidden transition-all duration-300 ease-out ${fetchedName ? 'max-h-24 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}>
                <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-100 dark:border-stone-800 animate-fade-in-up">
                    <div className="w-10 h-10 rounded-full bg-wood-100 dark:bg-wood-900/30 text-wood-600 dark:text-wood-400 flex items-center justify-center font-bold text-sm shrink-0 border border-wood-200 dark:border-wood-800">
                        {fetchedName?.charAt(0)}
                    </div>
                    <div className="text-left overflow-hidden">
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">Welcome back,</p>
                        <p className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">{fetchedName}</p>
                    </div>
                    <div className="ml-auto">
                         <UserIcon size={16} className="text-wood-500" />
                    </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isCheckingUser}
              className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-wood-600 dark:hover:bg-wood-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? 'Entering Cabin...' : fetchedName ? 'Enter Cabin' : <>Enter Cabin <LogIn size={18} /></>}
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
              <path fill="#EA4335" d="M12 4.62c1.61 0 3.1.56 4.28 1.61l3.21-3.21C17.45 1.2 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">Voice Memos & Transcription</h2>
            <div className="flex items-center justify-center gap-4 text-stone-500 dark:text-stone-400">
                <div className="flex items-center gap-2">
                    <Mic size={18} />
                    <span>Record Audio</span>
                </div>
                <span className="w-1 h-1 bg-stone-400 rounded-full"></span>
                <div className="flex items-center gap-2">
                    <Bot size={18} />
                    <span>AI Summaries</span>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;