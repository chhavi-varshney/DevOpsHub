const GitHubOverview = ({
  selectedRepo,
  commits,
  pullRequests,
  issues,
}) => {
  return (
    <div className="space-y-6">
      {/* Repository Overview */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-2xl font-semibold text-blue-400 mb-3">
          Repository Overview
        </h3>

        <p className="text-gray-300 mb-6">
          {selectedRepo.description || "No description available."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stars */}
          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-gray-400">Stars</p>

            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {selectedRepo.stargazers_count || 0}
            </p>
          </div>

          {/* Forks */}
          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-gray-400">Forks</p>

            <p className="text-3xl font-bold text-purple-400 mt-2">
              {selectedRepo.forks_count || 0}
            </p>
          </div>

          {/* Language */}
          <div className="rounded-xl border border-slate-800 p-5">
            <p className="text-gray-400">Language</p>

            <p className="text-3xl font-bold text-blue-400 mt-2">
              {selectedRepo.language || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Repository Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Commits */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <p className="text-gray-400">Commits</p>

          <p className="text-4xl font-bold text-green-400 mt-2">
            {commits.length}
          </p>
        </div>

        {/* Pull Requests */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <p className="text-gray-400">Pull Requests</p>

          <p className="text-4xl font-bold text-purple-400 mt-2">
            {pullRequests.length}
          </p>
        </div>

        {/* Issues */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <p className="text-gray-400">Open Issues</p>

          <p className="text-4xl font-bold text-red-400 mt-2">
            {issues.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubOverview;