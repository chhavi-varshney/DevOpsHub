import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DeploymentChart = ({ deployments }) => {
  const deploymentChartData = [
    {
      name: "Success",
      value: deployments?.success || 0,
    },
    {
      name: "Failed",
      value: deployments?.failed || 0,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-400">
          Deployment Status
        </h2>

        <p className="mt-1 text-gray-400">
          Distribution of deployments by status.
        </p>
      </div>

      <div className="h-80 w-full">
        {deploymentChartData.some(
          (item) => item.value > 0
        ) ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deploymentChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {deploymentChartData.map(
                  (entry, index) => (
                    <Cell key={`cell-${index}`} />
                  )
                )}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No deployment data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentChart;