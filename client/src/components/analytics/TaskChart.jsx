import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TaskChart = ({ tasks }) => {
  const taskChartData = [
    {
      name: "Todo",
      value: tasks?.todo || 0,
    },
    {
      name: "In Progress",
      value: tasks?.inProgress || 0,
    },
    {
      name: "Review",
      value: tasks?.review || 0,
    },
    {
      name: "Done",
      value: tasks?.done || 0,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-400">
          Task Status
        </h2>

        <p className="mt-1 text-gray-400">
          Distribution of tasks by current status.
        </p>
      </div>

      <div className="h-80 w-full">
        {taskChartData.some((item) => item.value > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={taskChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {taskChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No task data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskChart;