import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col lg:flex-row">

      {/* ── LEFT HERO PANEL (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid lines background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            JT
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Job Tracker</span>
        </div>

        {/* Hero content */}
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Land your<br />
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              dream job
            </span><br />
            faster.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-10">
            Track applications, schedule interviews, and use AI to craft the perfect cover letter — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: '📋', text: 'Track Applications' },
              { icon: '🤖', text: 'AI Cover Letters' },
              { icon: '📄', text: 'Resume Analyzer' },
              { icon: '🎯', text: 'Interview Prep' },
            ].map((f) => (
              <div key={f.text}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                           text-white px-4 py-2 rounded-full text-sm font-medium">
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 flex gap-8">
          {[
            { value: '10K+', label: 'Jobs Tracked' },
            { value: '95%', label: 'Accuracy' },
            { value: 'Free', label: 'Forever' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL ── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header — normal document flow, never overlaps the card */}
        <div className="flex lg:hidden items-center gap-2 px-5 pt-5 pb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            JT
          </div>
          <span className="text-white font-bold">Job Tracker</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50">

              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back 👋</h2>
                <p className="text-gray-500 text-sm sm:text-base">Sign in to continue your job search journey</p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">✉️</span>
                    <input
                      name="email" type="email" placeholder="you@example.com"
                      autoComplete="email" inputMode="email"
                      value={form.email} onChange={handleChange} required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl
                                 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔒</span>
                    <input
                      name="password" type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••" autoComplete="current-password"
                      value={form.password} onChange={handleChange} required
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl
                                 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 transition-all placeholder-gray-400"
                    />
                    <button type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                                 w-9 h-9 flex items-center justify-center text-base">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl
                             font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all
                             disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30
                             active:translate-y-0 active:scale-[0.99]">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In →'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">New here?</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Register link */}
              <Link to="/register"
                className="block w-full py-3.5 border-2 border-gray-200 text-gray-700 rounded-2xl
                           font-semibold text-sm text-center hover:border-indigo-400 hover:text-indigo-600
                           transition-all hover:bg-indigo-50 active:scale-[0.99]">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}