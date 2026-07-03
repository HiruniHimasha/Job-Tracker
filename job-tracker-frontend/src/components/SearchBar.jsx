// SearchBar.jsx — Clean redesigned search + filter bar
const STATUSES = ['All', 'Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

const STATUS_COLORS = {
  All:       'bg-gray-800 text-white border-gray-800',
  Applied:   'bg-blue-600 text-white border-blue-600',
  Interview: 'bg-amber-500 text-white border-amber-500',
  Offer:     'bg-green-600 text-white border-green-600',
  Rejected:  'bg-red-500 text-white border-red-500',
  Withdrawn: 'bg-gray-500 text-white border-gray-500',
};

export default function SearchBar({ searchTerm, onSearch, filter, onFilter }) {
  return (
    <div className="mb-4 space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search by company or role..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                     placeholder-gray-400 transition-all"
        />
        {searchTerm && (
          <button onClick={() => onSearch('')}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
            <span className="text-lg">×</span>
          </button>
        )}
      </div>

      {/* Filter pills — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUSES.map(status => (
          <button
            key={status}
            onClick={() => onFilter(status)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border
                        transition-all duration-150
                        ${filter === status
                          ? STATUS_COLORS[status]
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}