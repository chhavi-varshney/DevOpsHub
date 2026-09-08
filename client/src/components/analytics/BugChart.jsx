import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BugChart = ({ issues }) => {
  const bugChartData = [
    {
      name: "Open",
      bugs: issues?.open || 0,
    },
    {
      name: "Resolved",
      bugs: issues?.resolved || 0,
    },
    {
      name: "Closed",
      bugs: issues?.closed || 0,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-red-400">
          Bug Status
        </h2>

        <p className="mt-1 text-gray-400">
          Distribution of bugs by current status.
        </p>
      </div>

      <div className="h-80 w-full">
        {bugChartData.some((item) => item.bugs > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bugChartData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="bugs"
                name="Bugs"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No bug data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default BugChart;