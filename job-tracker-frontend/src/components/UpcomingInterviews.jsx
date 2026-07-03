// UpcomingInterviews.jsx
// Shows a list of upcoming interviews sorted by date
// Only shows applications that have an interviewDate set
// Props:
//   applications → full list of applications from dashboard

// Badge color for each interview type
const TYPE_STYLES = {
  Phone:     'bg-blue-100 text-blue-700',
  Online:    'bg-purple-100 text-purple-700',
  'In-Person': 'bg-green-100 text-green-700',
  Technical: 'bg-orange-100 text-orange-700',
  HR:        'bg-pink-100 text-pink-700',
};

// How many days until interview
const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const interview = new Date(dateStr);
  interview.setHours(0, 0, 0, 0);
  const diff = Math.round((interview - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return { label: 'Today!', color: 'text-green-600 font-bold' };
  if (diff === 1) return { label: 'Tomorrow', color: 'text-yellow-600 font-semibold' };
  if (diff < 0) return { label: `${Math.abs(diff)}d ago`, color: 'text-gray-400' };
  return { label: `In ${diff} days`, color: 'text-blue-600' };
};

const formatDateTime = (dateStr, timeStr) => {
  const date = new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  return timeStr ? `${date} at ${timeStr}` : date;
};

export default function UpcomingInterviews({ applications }) {
  // Filter only apps with interview date, sort by soonest first
  const interviews = applications
    .filter(app => app.interviewDate)
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));

  if (interviews.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="text-base font-semibold text-gray-700 mb-3">📅 Upcoming Interviews</h3>
        <p className="text-gray-400 text-sm text-center py-4">
          No interviews scheduled yet. Edit an application to add interview details.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <h3 className="text-base font-semibold text-gray-700 mb-4">
        📅 Upcoming Interviews
        <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          {interviews.length}
        </span>
      </h3>

      <div className="space-y-3">
        {interviews.map(app => {
          const daysUntil = getDaysUntil(app.interviewDate);
          return (
            <div key={app._id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">

              {/* Date countdown box */}
              <div className="flex-shrink-0 text-center bg-white border border-gray-200 rounded-lg p-2 w-14">
                <div className="text-lg font-bold text-gray-800">
                  {new Date(app.interviewDate).getDate()}
                </div>
                <div className="text-xs text-gray-500 uppercase">
                  {new Date(app.interviewDate).toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>

              {/* Interview details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800 text-sm truncate">{app.company}</p>
                  {/* Interview type badge */}
                  {app.interviewType && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[app.interviewType] || 'bg-gray-100 text-gray-600'}`}>
                      {app.interviewType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{app.role}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDateTime(app.interviewDate, app.interviewTime)}
                </p>
                {app.interviewNotes && (
                  <p className="text-xs text-gray-500 mt-1 italic truncate">
                    📝 {app.interviewNotes}
                  </p>
                )}
              </div>

              {/* Days until */}
              <div className={`flex-shrink-0 text-xs ${daysUntil.color}`}>
                {daysUntil.label}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
