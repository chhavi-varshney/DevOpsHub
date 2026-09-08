const GitHubIssues = ({ issues }) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-red-400 mb-5">
        Open Issues
      </h3>

      {issues.length === 0 ? (
        <p className="text-gray-400">
          No open issues found.
        </p>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <p className="text-white font-semibold">
                #{issue.number} {issue.title}
              </p>

              <p className="text-gray-400 text-sm mt-2">
                {issue.user?.login || "Unknown user"}
              </p>

              <p className="text-gray-500 text-xs mt-2">
                State: {issue.state}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GitHubIssues;