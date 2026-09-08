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

const SprintChart = ({ sprints }) => {
  const sprintChartData = [
    {
      name: "Planned",
      sprints: sprints?.planned || 0,
    },
    {
      name: "Active",
      sprints: sprints?.active || 0,
    },
    {
      name: "Completed",
      sprints: sprints?.completed || 0,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-400">
          Sprint Status
        </h2>

        <p className="mt-1 text-gray-400">
          Distribution of sprints by current status.
        </p>
      </div>

      <div className="h-80 w-full">
        {sprintChartData.some(
          (item) => item.sprints > 0
        ) ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sprintChartData}
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
                dataKey="sprints"
                name="Sprints"
                fill="#a855f7"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No sprint data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintChart;