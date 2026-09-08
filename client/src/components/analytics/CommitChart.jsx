import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CommitChart = ({ commits }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-400">
          GitHub Commits
        </h2>

        <p className="mt-1 text-gray-400">
          Commits made over the last 7 days.
        </p>
      </div>

      <div className="h-80 w-full">
        {commits?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={commits}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);

                  return date.toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  );
                }}
              />

              <YAxis allowDecimals={false} />

              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value);

                  return date.toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  );
                }}
              />

              <Line
                type="monotone"
                dataKey="commits"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No commit data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitChart;