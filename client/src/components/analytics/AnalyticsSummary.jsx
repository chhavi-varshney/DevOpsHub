const AnalyticsSummary = ({ analytics }) => {
  const totalTasks =
    (analytics?.tasks?.todo || 0) +
    (analytics?.tasks?.inProgress || 0) +
    (analytics?.tasks?.review || 0) +
    (analytics?.tasks?.done || 0);

  const todayCommits =
    analytics?.commits?.length > 0
      ? analytics.commits[analytics.commits.length - 1]?.commits || 0
      : 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {/* Total Tasks */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-gray-400">Total Tasks</p>

        <h2 className="mt-3 text-4xl font-bold text-blue-400">
          {totalTasks}
        </h2>
      </div>

      {/* Open Bugs */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-gray-400">Open Bugs</p>

        <h2 className="mt-3 text-4xl font-bold text-red-400">
          {analytics?.issues?.open || 0}
        </h2>
      </div>

      {/* Completed Tasks */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-gray-400">Completed Tasks</p>

        <h2 className="mt-3 text-4xl font-bold text-green-400">
          {analytics?.tasks?.done || 0}
        </h2>
      </div>

      {/* Today's Commits */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-gray-400">Today's Commits</p>

        <h2 className="mt-3 text-4xl font-bold text-purple-400">
          {todayCommits}
        </h2>
      </div>

      {/* Successful Deployments */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-gray-400">
          Successful Deployments
        </p>

        <h2 className="mt-3 text-4xl font-bold text-cyan-400">
          {analytics?.deployments?.success || 0}
        </h2>
      </div>
    </div>
  );
};

export default AnalyticsSummary;