import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── 6 real-feeling testimonials ──────────────────────────────────────────────
const REVIEWS = [
  {
    name: 'Ashan Perera',
    role: 'Software Engineer · WSO2',
    avatar: 'A',
    color: 'from-blue-500 to-indigo-600',
    stars: 5,
    text: 'Job Tracker completely changed how I manage my applications. The AI cover letter feature saved me hours every week. Landed my dream job within 3 months!',
  },
  {
    name: 'Nimasha Silva',
    role: 'UI/UX Designer · 99X',
    avatar: 'N',
    color: 'from-pink-500 to-rose-600',
    stars: 5,
    text: 'The resume analyzer gave me feedback I never got from human reviewers. My interview callback rate jumped from 10% to 40% after applying those tips.',
  },
  {
    name: 'Kavindu Jayawardena',
    role: 'Data Analyst · Dialog',
    avatar: 'K',
    color: 'from-emerald-500 to-teal-600',
    stars: 5,
    text: "I was applying to 20+ jobs and losing track of everything. Now I can see exactly where each application stands. The interview countdown is a lifesaver!",
  },
  {
    name: 'Hiruni Fernando',
    role: 'Full Stack Dev · Sysco Labs',
    avatar: 'H',
    color: 'from-purple-500 to-violet-600',
    stars: 5,
    text: "The AI cover letter is scarily good. I just paste the job description and get a fully tailored letter in seconds. Recruiters actually comment on how well-written it is.",
  },
  {
    name: 'Dulith Wickramasinghe',
    role: 'DevOps Engineer · IFS',
    avatar: 'D',
    color: 'from-orange-500 to-amber-600',
    stars: 4,
    text: "Clean, fast, and actually useful. I love the stats dashboard — seeing my application pipeline visually keeps me motivated to keep applying.",
  },
  {
    name: 'Sathmi Ratnayake',
    role: 'QA Engineer · Virtusa',
    avatar: 'S',
    color: 'from-cyan-500 to-blue-600',
    stars: 5,
    text: "Finally an app that doesn't require a spreadsheet to track everything! The mobile experience is smooth and I can update applications on the go.",
  },
];

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= count ? 'text-amber-400' : 'text-white/20'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Review carousel (desktop hero panel only) ─────────────────────────────────
function ReviewCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' | 'prev'
  const timerRef = useRef(null);

  const goTo = (idx, dir = 'next') => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 350);
  };

  // Auto-advance every 4 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      goTo((current + 1) % REVIEWS.length, 'next');
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [current, animating]);

  const prev = () => {
    clearInterval(timerRef.current);
    goTo((current - 1 + REVIEWS.length) % REVIEWS.length, 'prev');
  };
  const next = () => {
    clearInterval(timerRef.current);
    goTo((current + 1) % REVIEWS.length, 'next');
  };

  const r = REVIEWS[current];

  const slideStyle = {
    opacity: animating ? 0 : 1,
    transform: animating
      ? `translateX(${direction === 'next' ? '-24px' : '24px'})`
      : 'translateX(0)',
    transition: 'opacity 0.35s ease, transform 0.35s ease',
  };

  return (
    <div className="relative">
      {/* Card */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 min-h-[180px]"
        style={slideStyle}>
        {/* Quote mark */}
        <div className="text-white/20 text-5xl font-serif leading-none mb-2 select-none">"</div>
        <p className="text-slate-200 text-sm leading-relaxed mb-5">{r.text}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${r.color}
                            flex items-center justify-center text-white font-extrabold text-sm shadow-md`}>
              {r.avatar}
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">{r.name}</p>
              <p className="text-slate-400 text-xs mt-0.5">{r.role}</p>
            </div>
          </div>
          <Stars count={r.stars} />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between mt-4">
        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {REVIEWS.map((_, i) => (
            <button key={i} onClick={() => goTo(i, i > current ? 'next' : 'prev')}
              className={`rounded-full transition-all duration-300
                          ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>

        {/* Prev / Next arrows */}
        <div className="flex gap-2">
          <button onClick={prev}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20
                       flex items-center justify-center text-white transition-all text-sm">
            ‹
          </button>
          <button onClick={next}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20
                       flex items-center justify-center text-white transition-all text-sm">
            ›
          </button>
        </div>
      </div>

      {/* Review count label */}
      <p className="text-white/30 text-xs mt-3 text-center">
        {current + 1} of {REVIEWS.length} reviews
      </p>
    </div>
  );
}

// ── Main RegisterPage ─────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6  ? 1
    : form.password.length < 10 ? 2 : 3;
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-400'][strength];
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950
                    flex flex-col lg:flex-row">

      {/* ── LEFT HERO PANEL (desktop only) ──────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">

        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] rounded-full
                          bg-purple-600/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-[5%] left-[-5%] w-[360px] h-[360px] rounded-full
                          bg-indigo-600/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[45%] right-[20%] w-[200px] h-[200px] rounded-full
                          bg-blue-500/10 blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>

        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500
                          flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
            JT
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">Job Tracker</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20
                          text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            🚀 Free forever · No credit card needed
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-5">
            Start your<br />
            <span className="bg-gradient-to-r from-purple-300 via-indigo-300 to-blue-300
                             bg-clip-text text-transparent">
              job search
            </span><br />
            journey.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Join thousands of job seekers who use Job Tracker to stay organized,
            prepared, and confident throughout their search.
          </p>

          {/* Feature list */}
          <div className="space-y-3 mb-10">
            {[
              { icon: '✅', text: 'Track all applications in one place' },
              { icon: '🤖', text: 'AI-powered cover letters in seconds' },
              { icon: '📊', text: 'Visual stats to track your progress' },
              { icon: '🎯', text: 'Interview scheduling & prep notes' },
              { icon: '📄', text: 'Smart resume analyzer with score' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-base w-6 text-center">{f.icon}</span>
                <span className="text-slate-300 text-sm">{f.text}</span>
              </div>
            ))}
          </div>

          {/* ── REVIEW CAROUSEL ── */}
          <ReviewCarousel />
        </div>

        {/* Bottom spacer for layout balance */}
        <div />
      </div>

      {/* ── RIGHT REGISTER PANEL ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header — normal document flow, never overlaps the card */}
        <div className="flex lg:hidden items-center gap-2 px-5 pt-5 pb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500
                          flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            JT
          </div>
          <span className="text-white font-bold">Job Tracker</span>
        </div>

        {/* Mobile testimonial strip — normal flow, sits above the card */}
        <div className="lg:hidden px-4 pb-4">
          <MobileReviewStrip />
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center px-4 pb-8 sm:px-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50">

              {/* Header */}
              <div className="mb-6 sm:mb-7">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1.5">Create account 🚀</h2>
                <p className="text-gray-500 text-sm">Start tracking your job hunt today — it's free!</p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                    <input name="name" type="text" placeholder="Your full name"
                      autoComplete="name"
                      value={form.name} onChange={handleChange} required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl
                                 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                                 focus:border-transparent transition-all placeholder-gray-400" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                    <input name="email" type="email" placeholder="you@example.com"
                      autoComplete="email" inputMode="email"
                      value={form.email} onChange={handleChange} required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl
                                 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                                 focus:border-transparent transition-all placeholder-gray-400" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input name="password" type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters" autoComplete="new-password"
                      value={form.password} onChange={handleChange} required
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl
                                 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                                 focus:border-transparent transition-all placeholder-gray-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                                 w-9 h-9 flex items-center justify-center text-base">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {form.password.length > 0 && (
                    <div className="mt-2.5">
                      <div className="flex gap-1 mb-1.5">
                        {[1, 2, 3].map((i) => (
                          <div key={i}
                            className={`flex-1 h-1.5 rounded-full transition-all duration-300
                                        ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold
                                     ${strength === 1 ? 'text-red-500'
                                       : strength === 2 ? 'text-yellow-500'
                                       : 'text-green-500'}`}>
                        {strengthLabel} password
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                             rounded-2xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700
                             transition-all disabled:opacity-60 disabled:cursor-not-allowed
                             shadow-lg shadow-indigo-500/30 active:translate-y-0 active:scale-[0.99]">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : 'Get Started Free →'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  By registering you agree to our Terms of Service
                </p>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">Have an account?</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <Link to="/login"
                className="block w-full py-3.5 border-2 border-gray-200 text-gray-700 rounded-2xl
                           font-semibold text-sm text-center hover:border-indigo-400 hover:text-indigo-600
                           transition-all hover:bg-indigo-50 active:scale-[0.99]">
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile review strip: single rotating testimonial pill, normal flow ────────
function MobileReviewStrip() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % REVIEWS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const r = REVIEWS[idx];
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3
                    flex items-center gap-3 transition-all duration-500">
      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${r.color} flex-shrink-0
                       flex items-center justify-center text-white font-extrabold text-xs`}>
        {r.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white text-xs font-semibold leading-none truncate">{r.name}</p>
        <p className="text-white/60 text-[11px] mt-0.5 truncate">{r.text.slice(0, 60)}…</p>
      </div>
      <Stars count={r.stars} />
    </div>
  );
}