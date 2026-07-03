// pages/JobSuggestionsPage.jsx
// Real job suggestions (Sri Lanka + International) via JSearch API,
// AI-ranked by relevance to the user's tracked applications.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications, getJobSuggestions, createApplication } from '../services/api';
import Navbar from '../components/Navbar';

// ─── Score badge colours ───────────────────────────────────────────────────────
function getMatchColor(score) {
  if (score >= 90) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  if (score >= 80) return { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    bar: 'bg-blue-500' };
  if (score >= 70) return { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   bar: 'bg-amber-500' };
  return                  { bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200',    bar: 'bg-gray-400' };
}

const LOGO_GRADIENTS = [
  'from-blue-500 to-indigo-600', 'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600', 'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600', 'from-cyan-500 to-blue-500',
  'from-yellow-500 to-orange-500', 'from-indigo-500 to-purple-600',
];
function logoGradient(company) {
  return LOGO_GRADIENTS[(company?.charCodeAt(0) || 0) % LOGO_GRADIENTS.length];
}

const TYPE_COLORS = {
  'Full-time': 'bg-blue-100 text-blue-700',
  'Remote':    'bg-violet-100 text-violet-700',
  'Hybrid':    'bg-teal-100 text-teal-700',
  'Contract':  'bg-orange-100 text-orange-700',
  'Part-time': 'bg-pink-100 text-pink-700',
};

// Region badge: Sri Lanka vs International
function RegionBadge({ region }) {
  if (region === 'Sri Lanka') {
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full
                       bg-orange-50 text-orange-700 border border-orange-200">
        🇱🇰 Sri Lanka
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full
                     bg-sky-50 text-sky-700 border border-sky-200">
      🌍 International
    </span>
  );
}

// ─── Single suggestion card ────────────────────────────────────────────────────
function SuggestionCard({ job, onAdd, added, adding }) {
  const c = getMatchColor(job.matchScore);

  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl border shadow-sm
                     hover:shadow-md transition-all duration-200 overflow-hidden group
                     ${added ? 'border-emerald-200' : 'border-gray-100'}`}>
      <div className="h-1 w-full bg-gray-100">
        <div className={`h-full ${c.bar} transition-all duration-700`} style={{ width: `${job.matchScore}%` }} />
      </div>

      <div className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${logoGradient(job.company)}
                           flex-shrink-0 flex items-center justify-center text-white
                           font-extrabold text-base shadow-sm`}>
            {job.logo || job.company?.charAt(0)?.toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base truncate leading-tight">
                  {job.company}
                </h3>
                <p className="text-indigo-600 font-semibold text-sm truncate">{job.role}</p>
              </div>
              <div className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1
                               rounded-full border text-xs font-bold ${c.bg} ${c.text} ${c.border}`}>
                <span>🎯</span> {job.matchScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Region + meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pl-[52px]">
          <RegionBadge region={job.region} />
          {job.type && (
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[job.type] || 'bg-gray-100 text-gray-600'}`}>
              {job.type}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3 pl-[52px]">
          {job.location  && <span>📍 {job.location}</span>}
          {job.salary    && <span>💰 {job.salary}</span>}
          {job.postedAgo && <span>🕐 {job.postedAgo}</span>}
        </div>

        {/* AI reason */}
        {job.reason && (
          <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100
                          rounded-xl p-3 mb-3 pl-[52px]">
            <span className="flex-shrink-0 text-sm">✨</span>
            <p className="text-xs text-indigo-700 leading-relaxed">{job.reason}</p>
          </div>
        )}

        {/* Tags */}
        {job.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 pl-[52px]">
            {job.tags.map((tag, i) => (
              <span key={i}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full
                           bg-gray-100 text-gray-600 border border-gray-200">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="pl-[52px] flex flex-col sm:flex-row gap-2">
          {job.jobUrl && (
            <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-indigo-200
                         text-indigo-700 px-4 py-2.5 rounded-2xl text-sm font-bold
                         hover:bg-indigo-50 transition-all">
              🔗 View & Apply
            </a>
          )}

          {added ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold py-2 px-2">
              <span className="text-lg">✅</span> Added to tracker!
            </div>
          ) : (
            <button onClick={() => onAdd(job)}
              disabled={adding}
              className="flex items-center justify-center gap-2
                         bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                         px-5 py-2.5 rounded-2xl text-sm font-bold
                         hover:opacity-90 hover:-translate-y-0.5 transform transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed
                         shadow-md shadow-indigo-500/20">
              {adding ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </>
              ) : (
                <>+ Add to Tracker</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded-full w-32 mb-2" />
          <div className="h-3 bg-gray-100 rounded-full w-24" />
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2 ml-14">
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      </div>
      <div className="flex gap-2 mt-4 ml-14">
        {[1,2,3].map(i => <div key={i} className="h-6 w-16 bg-gray-100 rounded-full" />)}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function JobSuggestionsPage() {
  const [applications, setApplications]   = useState([]);
  const [suggestions, setSuggestions]     = useState([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [counts, setCounts]               = useState({ sriLanka: 0, international: 0 });
  const [loading, setLoading]             = useState(false);
  const [loadingApps, setLoadingApps]     = useState(true);
  const [error, setError]                 = useState('');
  const [addedIds, setAddedIds]           = useState([]);
  const [addingId, setAddingId]           = useState(null);
  const [sortBy, setSortBy]               = useState('match');
  const [filterRegion, setFilterRegion]   = useState('All'); // All | Sri Lanka | International
  const [filterType, setFilterType]       = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getApplications();
        setApplications(res.data.applications || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingApps(false);
      }
    })();
  }, []);

  const handleGenerate = async () => {
    if (applications.length === 0) {
      setError('Add at least one application to your tracker first so AI knows what to suggest.');
      return;
    }
    setLoading(true);
    setError('');
    setSuggestions([]);
    setAddedIds([]);
    try {
      const res = await getJobSuggestions({
        applications: applications.map(a => ({ company: a.company, role: a.role, status: a.status })),
      });
      setSuggestions(res.data.suggestions || []);
      setSearchQuery(res.data.searchQuery || '');
      setCounts(res.data.counts || { sriLanka: 0, international: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTracker = async (job) => {
    setAddingId(job.id);
    try {
      await createApplication({
        company:  job.company,
        role:     job.role,
        location: job.location || 'Not specified',
        salary:   job.salary   || '',
        status:   'Applied',
        jobUrl:   job.jobUrl   || '',
        notes:    `Found via Job Suggestions (${job.region}) · Match score: ${job.matchScore}% · ${job.reason || ''}`,
      });
      setAddedIds(prev => [...prev, job.id]);
    } catch (err) {
      console.error('Failed to add:', err);
    } finally {
      setAddingId(null);
    }
  };

  const displayedSuggestions = [...suggestions]
    .filter(j => filterRegion === 'All' || j.region === filterRegion)
    .filter(j => filterType   === 'All' || j.type   === filterType)
    .sort((a, b) => sortBy === 'match' ? b.matchScore - a.matchScore : 0);

  const types = ['All', ...Array.from(new Set(suggestions.map(s => s.type).filter(Boolean)))];
  const avgScore = suggestions.length
    ? Math.round(suggestions.reduce((s, j) => s + j.matchScore, 0) / suggestions.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/10">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">

        {/* ── Page header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center
                       text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all shadow-sm flex-shrink-0">
            ←
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Job Suggestions</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Real, live job listings — mixed Sri Lanka 🇱🇰 + International 🌍
            </p>
          </div>
        </div>

        {/* ── Generate card ── */}
        <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700
                        rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-64 h-64 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">💼</span>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    Live Listings
                  </span>
                </div>
                <h2 className="text-white text-xl sm:text-2xl font-extrabold mb-1">
                  Find your next real job
                </h2>
                <p className="text-white/70 text-sm">
                  {loadingApps ? 'Loading your profile...'
                    : applications.length === 0
                      ? 'Add applications to your tracker first'
                      : `Based on your ${applications.length} tracked application${applications.length !== 1 ? 's' : ''}`}
                </p>
              </div>

              {suggestions.length > 0 && (
                <div className="flex-shrink-0 bg-white/10 border border-white/20 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-extrabold text-white">{avgScore}%</div>
                  <div className="text-white/60 text-[10px] font-semibold uppercase tracking-wide">Avg Match</div>
                </div>
              )}
            </div>

            {/* Region count pills */}
            {suggestions.length > 0 && (
              <div className="flex gap-2 mb-5">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  🇱🇰 {counts.sriLanka} Sri Lanka
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  🌍 {counts.international} International
                </span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || loadingApps || applications.length === 0}
              className="flex items-center gap-2.5 bg-white text-indigo-700 font-extrabold
                         px-6 py-3.5 rounded-2xl text-sm shadow-lg hover:shadow-xl
                         hover:-translate-y-0.5 transform transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching live job boards...
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  {suggestions.length > 0 ? 'Search Again' : 'Find Real Jobs'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <span className="text-xl flex-shrink-0">❌</span>
            <div>
              <p className="font-semibold text-red-700 text-sm">Could not fetch job suggestions</p>
              <p className="text-red-600 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium">Fetching live listings from Sri Lanka & worldwide...</p>
            </div>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Results ── */}
        {!loading && suggestions.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">
                  {displayedSuggestions.length} Job{displayedSuggestions.length !== 1 ? 's' : ''} Found
                </h3>
                {searchQuery && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    🔍 Searched: <span className="font-semibold text-indigo-600">{searchQuery}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Region filter */}
                <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1">
                  {['All', 'Sri Lanka', 'International'].map(r => (
                    <button key={r} onClick={() => setFilterRegion(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                  ${filterRegion === r ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                      {r === 'Sri Lanka' ? '🇱🇰 SL' : r === 'International' ? '🌍 Intl' : r}
                    </button>
                  ))}
                </div>

                {/* Type filter */}
                <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1">
                  {types.map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                  ${filterType === t ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedSuggestions.map((job, i) => (
                <div key={job.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s`, animationFillMode: 'both' }}>
                  <SuggestionCard
                    job={job}
                    onAdd={handleAddToTracker}
                    added={addedIds.includes(job.id)}
                    adding={addingId === job.id}
                  />
                </div>
              ))}
            </div>

            {displayedSuggestions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-400 text-sm">No jobs match this filter. Try a different region or type.</p>
              </div>
            )}

            <div className="text-center mt-8">
              <p className="text-sm text-gray-400 mb-3">
                🔗 These are real, currently open job listings. Click "View & Apply" to apply directly.
              </p>
              <button onClick={handleGenerate}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800
                           border border-indigo-200 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all">
                🔄 Refresh listings
              </button>
            </div>
          </>
        )}

        {/* ── Empty state (no apps in tracker) ── */}
        {!loading && suggestions.length === 0 && !error && applications.length === 0 && !loadingApps && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No applications yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Add some job applications to your tracker first. Then we'll search real job boards for similar roles.
            </p>
            <button onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                         px-5 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition-all
                         shadow-md shadow-indigo-500/25">
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ── Initial prompt ── */}
        {!loading && suggestions.length === 0 && !error && applications.length > 0 && (
          <div className="text-center py-14 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">🔭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to explore?</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              We'll search live job boards for roles similar to your {applications.length} tracked application{applications.length !== 1 ? 's' : ''} —
              mixing Sri Lankan and international openings.
            </p>
            <button onClick={handleGenerate}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white
                         px-6 py-3.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-all
                         shadow-lg shadow-violet-500/25 flex items-center gap-2 mx-auto">
              <span className="text-lg">✨</span> Find Real Jobs Now
            </button>
          </div>
        )}

        <div className="h-10" />
      </div>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up   { animation: fade-in-up 0.4s ease-out; }
      `}</style>
    </div>
  );
}
