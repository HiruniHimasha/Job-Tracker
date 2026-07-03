// StatsChart component — shows a pie chart of application statuses
// Uses the Recharts library (already listed in your dependencies)
// Install if not yet: npm install recharts

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Color for each status
const STATUS_COLORS = {
  Applied:   '#3b82f6', // blue
  Interview: '#f59e0b', // yellow
  Offer:     '#22c55e', // green
  Rejected:  '#ef4444', // red
  Withdrawn: '#9ca3af', // gray
};

// Custom label shown on each slice — shows percentage
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  // Only show label if slice is big enough (more than 5%)
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={13} fontWeight={500}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Props:
//   stats → object from backend: { total, applied, interview, offer, rejected }
export default function StatsChart({ stats }) {

  // Build chart data — only include statuses with count > 0
  const data = [
    { name: 'Applied',   value: stats.applied   || 0 },
    { name: 'Interview', value: stats.interview  || 0 },
    { name: 'Offer',     value: stats.offer      || 0 },
    { name: 'Rejected',  value: stats.rejected   || 0 },
  ].filter(item => item.value > 0); // remove zeros so chart looks clean

  // Don't show chart if no data yet
  if (!stats.total || stats.total === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">📊</div>
        <p className="text-gray-400 text-sm">Add applications to see your chart</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="text-base font-semibold text-gray-700 mb-4">
        Application Overview
      </h3>

      {/* ResponsiveContainer makes chart fill its parent width */}
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {/* Each Cell gets the color for its status */}
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={STATUS_COLORS[entry.name]}
              />
            ))}
          </Pie>

          {/* Tooltip shown when hovering a slice */}
          <Tooltip
            formatter={(value, name) => [`${value} applications`, name]}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '13px',
            }}
          />

          {/* Legend below the chart */}
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary numbers below chart */}
      <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div
              className="text-xl font-bold"
              style={{ color: STATUS_COLORS[item.name] }}
            >
              {item.value}
            </div>
            <div className="text-xs text-gray-500">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
