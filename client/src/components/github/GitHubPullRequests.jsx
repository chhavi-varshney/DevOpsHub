const GitHubPullRequests = ({ pullRequests }) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-purple-400 mb-5">
        Pull Requests
      </h3>

      {pullRequests.length === 0 ? (
        <p className="text-gray-400">
          No pull requests found.
        </p>
      ) : (
        <div className="space-y-3">
          {pullRequests.map((pr) => (
            <div
              key={pr.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <p className="text-white font-semibold">
                #{pr.number} {pr.title}
              </p>

              <p className="text-gray-400 text-sm mt-2">
                {pr.user?.login || "Unknown user"}
              </p>

              <p className="text-gray-500 text-xs mt-2">
                State: {pr.state}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GitHubPullRequests;