export default function StatsCard({ label, value, gradient, emoji, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`${gradient} rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white text-left
                  cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg
                  hover:-translate-y-0.5 transform active:translate-y-0 w-full
                  ${active ? 'ring-3 ring-white/80 ring-offset-2 scale-[1.02]' : 'opacity-90 hover:opacity-100'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl sm:text-3xl">{emoji}</div>
        {active && (
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold leading-none mb-1">
        {value ?? 0}
      </div>
      <div className="text-white/80 text-xs sm:text-sm font-medium">{label}</div>
    </button>
  );
}
