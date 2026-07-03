// InterviewsPage.jsx — Dedicated full interviews page
// Shows all applications that have interviewDate set
// Features: timeline view, countdown badges, type filters, prep notes

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications } from '../services/api';
import Navbar from '../components/Navbar';

const TYPE_CONFIG = {
  Phone:       { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: '📞' },
  Online:      { bg: 'bg-violet-100', text: 'text-violet-700', icon: '💻' },
  'In-Person': { bg: 'bg-green-100',  text: 'text-green-700',  icon: '🏢' },
  Technical:   { bg: 'bg-orange-100', text: 'text-orange-700', icon: '⚙️' },
  HR:          { bg: 'bg-pink-100',   text: 'text-pink-700',   icon: '👥' },
};

const getDaysUntil = (dateStr) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const iv = new Date(dateStr); iv.setHours(0,0,0,0);
  const diff = Math.round((iv - today) / 86400000);
  if (diff === 0) return { label: '🔥 Today!',     cls: 'bg-red-100 text-red-700 border-red-200',    urgent: true };
  if (diff === 1) return { label: '⚡ Tomorrow',   cls: 'bg-amber-100 text-amber-700 border-amber-200', urgent: true };
  if (diff < 0)  return { label: `${Math.abs(diff)}d ago`, cls: 'bg-gray-100 text-gray-500 border-gray-200', past: true };
  if (diff <= 7) return { label: `In ${diff} days`,  cls: 'bg-blue-100 text-blue-700 border-blue-200', soon: true };
  return { label: `In ${diff} days`, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
};

const formatFullDate = (d, t) => {
  const date = new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return t ? `${date} · ${t}` : date;
};

const formatShortDate = (d) => new Date(d).toLocaleDateString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric',
});

const FILTER_TABS = ['Upcoming', 'Past', 'All'];

export default function InterviewsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState('Upcoming');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [expanded, setExpanded]         = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getApplications();
        setApplications(res.data.applications);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter: only applications with an interview date
  const allInterviews = applications
    .filter(app => app.interviewDate)
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));

  const today = new Date(); today.setHours(0,0,0,0);

  const upcoming = allInterviews.filter(app => new Date(app.interviewDate) >= today);
  const past     = allInterviews.filter(app => new Date(app.interviewDate) < today);

  const byTab = tab === 'Upcoming' ? upcoming
              : tab === 'Past'     ? past
              : allInterviews;

  const filtered = typeFilter === 'All'
    ? byTab
    : byTab.filter(app => app.interviewType === typeFilter);

  const types = ['All', ...Array.from(new Set(allInterviews.map(a => a.interviewType).filter(Boolean)))];

  // Summary stats
  const thisWeek = upcoming.filter(app => {
    const diff = Math.round((new Date(app.interviewDate) - today) / 86400000);
    return diff <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500
                            flex items-center justify-center text-white text-lg shadow-sm">
              🎯
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Interviews</h1>
              <p className="text-xs text-gray-500">
                {upcoming.length} upcoming · {past.length} completed
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        {!loading && allInterviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm text-center">
              <div className="text-2xl font-bold text-amber-600">{upcoming.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Upcoming</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm text-center">
              <div className="text-2xl font-bold text-red-500">{thisWeek}</div>
              <div className="text-xs text-gray-500 mt-0.5">This Week</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm text-center">
              <div className="text-2xl font-bold text-gray-400">{past.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Completed</div>
            </div>
          </div>
        )}

        {/* Tab row + type filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl self-start">
            {FILTER_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t}
                {t === 'Upcoming' && upcoming.length > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {upcoming.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Type filter pills */}
          {types.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {types.map(type => {
                const cfg = TYPE_CONFIG[type];
                return (
                  <button key={type} onClick={() => setTypeFilter(type)}
                    className={`flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold
                                px-2.5 py-1.5 rounded-full border transition-all
                                ${typeFilter === type
                                  ? (cfg ? `${cfg.bg} ${cfg.text} border-transparent` : 'bg-gray-800 text-white border-gray-800')
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                    {cfg && <span>{cfg.icon}</span>}
                    {type}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin text-4xl mb-3">⚙️</div>
            <p className="text-gray-400 text-sm">Loading interviews...</p>
          </div>
        )}

        {/* Empty state — no interviews at all */}
        {!loading && allInterviews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No interviews scheduled yet</h3>
            <p className="text-gray-400 text-sm mb-5">
              When you set an application's status to Interview<br/>and add a date, it appears here.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                         px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all">
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Empty state — filtered */}
        {!loading && allInterviews.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 text-sm">No interviews match this filter.</p>
            <button onClick={() => { setTab('All'); setTypeFilter('All'); }}
              className="mt-3 text-indigo-600 text-sm underline">Clear filters</button>
          </div>
        )}

        {/* Interview list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(app => {
              const countdown = getDaysUntil(app.interviewDate);
              const typeCfg = TYPE_CONFIG[app.interviewType] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: '🎤' };
              const isExpanded = expanded === app._id;

              return (
                <div key={app._id}
                  className={`bg-white border rounded-2xl shadow-sm transition-all duration-200
                              ${countdown.urgent ? 'border-amber-200' : countdown.past ? 'border-gray-100 opacity-70' : 'border-gray-100'}
                              ${isExpanded ? 'shadow-md' : 'hover:shadow-md'}`}>

                  {/* Card header — always visible */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : app._id)}
                    className="w-full text-left p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">

                      {/* Date box */}
                      <div className={`flex-shrink-0 rounded-xl p-2.5 text-center min-w-[52px]
                                       ${countdown.urgent ? 'bg-amber-50 border border-amber-200'
                                         : countdown.past ? 'bg-gray-50 border border-gray-200'
                                         : 'bg-indigo-50 border border-indigo-100'}`}>
                        <div className={`text-xl font-bold leading-none
                                         ${countdown.urgent ? 'text-amber-700' : countdown.past ? 'text-gray-400' : 'text-indigo-700'}`}>
                          {new Date(app.interviewDate).getDate()}
                        </div>
                        <div className={`text-[10px] uppercase font-semibold mt-0.5
                                         ${countdown.urgent ? 'text-amber-500' : countdown.past ? 'text-gray-400' : 'text-indigo-500'}`}>
                          {new Date(app.interviewDate).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-gray-900 text-sm sm:text-base">{app.company}</p>
                            <p className="text-indigo-600 text-xs sm:text-sm font-medium truncate">{app.role}</p>
                          </div>
                          <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border
                                           ${countdown.cls}`}>
                            {countdown.label}
                          </span>
                        </div>

                        <div className="flex items-center flex-wrap gap-2 mt-2">
                          {/* Type badge */}
                          {app.interviewType && (
                            <span className={`flex items-center gap-1 text-[11px] font-semibold
                                              px-2.5 py-1 rounded-full ${typeCfg.bg} ${typeCfg.text}`}>
                              {typeCfg.icon} {app.interviewType}
                            </span>
                          )}
                          {/* Time */}
                          {app.interviewTime && (
                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                              🕐 {app.interviewTime}
                            </span>
                          )}
                          {/* Location */}
                          {app.location && (
                            <span className="text-[11px] text-gray-500">📍 {app.location}</span>
                          )}
                        </div>
                      </div>

                      {/* Expand icon */}
                      <div className={`flex-shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 border-t border-gray-100 pt-3 space-y-3">

                      {/* Full date/time */}
                      <div className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3">
                        <span className="font-semibold text-gray-700">📅 </span>
                        {formatFullDate(app.interviewDate, app.interviewTime)}
                      </div>

                      {/* Prep notes */}
                      {app.interviewNotes && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1.5">📝 Preparation Notes</p>
                          <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100
                                        rounded-xl p-3 leading-relaxed">
                            {app.interviewNotes}
                          </p>
                        </div>
                      )}

                      {/* Job URL */}
                      {app.jobUrl && (
                        <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">
                          🔗 View original job posting
                        </a>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="flex-1 py-2 text-xs font-semibold bg-gray-100 text-gray-700
                                     rounded-xl hover:bg-gray-200 transition-colors">
                          ✏️ Edit in Dashboard
                        </button>
                        {app.salary && (
                          <div className="flex items-center px-3 py-2 bg-green-50 text-green-700
                                          text-xs font-semibold rounded-xl border border-green-100">
                            💰 {app.salary}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom spacer for mobile */}
        <div className="h-8" />
      </div>
    </div>
  );
}