import React, { useState } from "react";
import { useStore } from "../lib/store";

export default function AuthModal() {
  const { isAuthOpen, toggleAuth, login, loginWithGoogle, signup, resetPassword, logout } = useStore();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isAuthOpen) return null;

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'signup') {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        setLoading(false);
        return;
      }
    }

    let res;
    if (mode === 'login') {
      res = await login(email, password);
    } else if (mode === 'signup') {
      res = await signup(name, email, password);
    } else {
      res = await resetPassword(email);
    }

    if (!res.success) {
      setError(res.message);
    } else {
      // Success handling with redirection
      if ((res as any).role === 'admin') {
        const event = new CustomEvent('navigate', { detail: { view: 'dashboard' } });
        window.dispatchEvent(event);
      } else if (mode === 'signup') {
        const event = new CustomEvent('navigate', { detail: { view: 'home' } });
        window.dispatchEvent(event);
      } else {
        const event = new CustomEvent('navigate', { detail: { view: 'home' } });
        window.dispatchEvent(event);
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await loginWithGoogle();
    if (!res.success) {
      setError(res.message);
    } else {
      // Check if trying to signup but user already exists
      if (mode === 'signup' && !res.isNewUser) {
        setError("User already exists. Please log in.");
        // Logout immediately to clear the session
        await logout();
      } else {
        // Success handling with redirection to home
        if (res.role === 'admin') {
          const event = new CustomEvent('navigate', { detail: { view: 'dashboard' } });
          window.dispatchEvent(event);
        } else {
          const event = new CustomEvent('navigate', { detail: { view: 'home' } });
          window.dispatchEvent(event);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="fixed inset-0 bg-brand-page/95 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#2A1B4A_0%,_transparent_50%)] opacity-60"></div>
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4">

        <div className="w-full max-w-[480px] bg-brand-card border border-brand-border rounded-[2.5rem] p-10 md:p-12 shadow-auth-card animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              {mode === 'login' ? 'Log in to your account.' : mode === 'signup' ? 'Join SB Tech Solution today.' : 'Enter your email to reset password.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] text-center font-black uppercase tracking-widest animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-black/40 border border-brand-border rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-gray-700 font-medium"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-black/40 border border-brand-border rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-gray-700 font-medium"
              />
            </div>

            {mode === 'login' && (
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => { setMode('forgot-password'); setError(null); }} className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-bold">Forgot Password?</button>
              </div>
            )}

            {mode !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-brand-border rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-gray-700 font-medium pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary hover:text-white transition-colors p-2 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cta-gradient hover:brightness-110 text-white font-black text-[11px] uppercase tracking-[0.4em] py-5 rounded-xl transition-all active:scale-95 shadow-glow flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link')}
            </button>
          </form>

          {mode !== 'forgot-password' && (
            <>
              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/5"></div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">OR</span>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em] py-5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {mode === 'login' ? "Don't have an account?" : mode === 'signup' ? "Already have an account?" : "Remember your password?"}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                className="ml-2 text-brand-primary font-black hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>

        <button
          onClick={() => toggleAuth(false)}
          className="fixed top-8 right-8 z-50 p-2 text-gray-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-3xl font-light">close</span>
        </button>
      </div>
    </div>
  );
}