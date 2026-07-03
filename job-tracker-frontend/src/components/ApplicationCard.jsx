// ApplicationCard.jsx — Beautiful redesigned card

const STATUS_CONFIG = {
  Applied:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   bar: 'bg-blue-500',   dot: '🔵' },
  Interview: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  bar: 'bg-amber-500',  dot: '🟡' },
  Offer:     { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',bar: 'bg-emerald-500',dot: '🟢' },
  Rejected:  { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    bar: 'bg-red-400',    dot: '🔴' },
  Withdrawn: { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   bar: 'bg-gray-400',   dot: '⚫' },
};

const TYPE_COLORS = {
  Phone:       'bg-blue-100 text-blue-700',
  Online:      'bg-violet-100 text-violet-700',
  'In-Person': 'bg-green-100 text-green-700',
  Technical:   'bg-orange-100 text-orange-700',
  HR:          'bg-pink-100 text-pink-700',
};

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '';

const formatInterviewDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  : '';

const getDaysUntil = (dateStr) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const iv = new Date(dateStr); iv.setHours(0,0,0,0);
  const diff = Math.round((iv - today) / 86400000);
  if (diff === 0) return { label: '🔥 Today!',    cls: 'bg-red-100 text-red-700' };
  if (diff === 1) return { label: '⚡ Tomorrow',  cls: 'bg-amber-100 text-amber-700' };
  if (diff < 0)  return { label: `${Math.abs(diff)}d ago`, cls: 'bg-gray-100 text-gray-500' };
  if (diff <= 7) return { label: `In ${diff}d`,   cls: 'bg-blue-100 text-blue-700' };
  return               { label: `In ${diff}d`,    cls: 'bg-gray-100 text-gray-600' };
};

// Generate company initial logo
function CompanyLogo({ company }) {
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-500',
  ];
  const idx = (company.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[idx]} flex-shrink-0
                     flex items-center justify-center text-white font-extrabold text-base shadow-sm`}>
      {company.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ApplicationCard({ app, onDelete, onEdit, onAIClick }) {
  const s = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied;
  const hasInterview = app.interviewDate;
  const countdown = hasInterview ? getDaysUntil(app.interviewDate) : null;
  const isUpcoming = hasInterview && new Date(app.interviewDate) >= new Date();

  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl border shadow-sm hover:shadow-md
                     transition-all duration-200 overflow-hidden group
                     ${isUpcoming ? 'border-amber-200' : 'border-gray-100'}`}>

      {/* Top accent bar */}
      <div className={`h-1 w-full ${s.bar}`} />

      <div className="p-4 sm:p-5">
        {/* Main row */}
        <div className="flex items-start gap-3 mb-3">
          <CompanyLogo company={app.company} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-gray-900 truncate leading-tight">
                  {app.company}
                </h3>
                <p className="text-indigo-600 font-semibold text-sm truncate">{app.role}</p>
              </div>
              <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border
                                ${s.bg} ${s.text} ${s.border}`}>
                {app.status}
              </span>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3 pl-[52px]">
          {app.location    && <span className="flex items-center gap-1">📍 {app.location}</span>}
          {app.appliedDate && <span className="flex items-center gap-1">📅 {formatDate(app.appliedDate)}</span>}
          {app.salary      && <span className="flex items-center gap-1">💰 {app.salary}</span>}
        </div>

        {/* Interview card */}
        {hasInterview && (
          <div className={`rounded-2xl p-3 mb-3 flex items-center gap-3
                           ${isUpcoming ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
            {/* Date box */}
            <div className={`flex-shrink-0 rounded-xl p-2 text-center min-w-[44px]
                             ${isUpcoming ? 'bg-white border border-amber-200' : 'bg-white border border-gray-200'}`}>
              <div className={`text-lg font-extrabold leading-none ${isUpcoming ? 'text-amber-700' : 'text-gray-500'}`}>
                {new Date(app.interviewDate).getDate()}
              </div>
              <div className={`text-[10px] uppercase font-bold ${isUpcoming ? 'text-amber-500' : 'text-gray-400'}`}>
                {new Date(app.interviewDate).toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold ${isUpcoming ? 'text-amber-800' : 'text-gray-600'}`}>
                  🎯 {formatInterviewDate(app.interviewDate)}
                  {app.interviewTime && ` · ${app.interviewTime}`}
                </span>
                {app.interviewType && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                                    ${TYPE_COLORS[app.interviewType] || 'bg-gray-100 text-gray-600'}`}>
                    {app.interviewType}
                  </span>
                )}
              </div>
              {app.interviewNotes && (
                <p className={`text-[11px] truncate mt-0.5 ${isUpcoming ? 'text-amber-700' : 'text-gray-400'}`}>
                  📝 {app.interviewNotes}
                </p>
              )}
            </div>

            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${countdown.cls}`}>
              {countdown.label}
            </span>
          </div>
        )}

        {/* Notes */}
        {app.notes && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5 mb-3 line-clamp-2 border border-gray-100">
            💬 {app.notes}
          </p>
        )}

        {/* Job URL */}
        {app.jobUrl && (
          <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline flex items-center gap-1.5 mb-3 w-fit">
            🔗 View Job Posting
          </a>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
          <button onClick={() => onEdit(app)}
            className="flex items-center justify-center gap-1.5 text-xs py-2.5 px-3
                       bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors
                       font-semibold border border-gray-200 hover:border-gray-300">
            <span>✏️</span>
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button onClick={() => onAIClick(app)}
            className="flex items-center justify-center gap-1.5 text-xs py-2.5 px-3
                       bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition-colors
                       font-semibold border border-violet-200 hover:border-violet-300">
            <span>🤖</span>
            <span className="hidden sm:inline">Cover Letter</span>
          </button>
          <button onClick={() => onDelete(app._id)}
            className="flex items-center justify-center gap-1.5 text-xs py-2.5 px-3
                       bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors
                       font-semibold border border-red-200 hover:border-red-300">
            <span>🗑️</span>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
