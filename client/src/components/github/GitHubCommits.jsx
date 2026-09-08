const GitHubCommits = ({ commits }) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-green-400 mb-5">
        Recent Commits
      </h3>

      {commits.length === 0 ? (
        <p className="text-gray-400">
          No commits found.
        </p>
      ) : (
        <div className="space-y-3">
          {commits.map((commit) => (
            <div
              key={commit.sha}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <p className="text-white font-semibold">
                {commit.commit?.message || "No commit message"}
              </p>

              <p className="text-gray-400 text-sm mt-2">
                {commit.author?.login ||
                  commit.commit?.author?.name ||
                  "Unknown author"}
              </p>

              <p className="text-gray-500 text-xs mt-2">
                {commit.commit?.author?.date
                  ? new Date(
                      commit.commit.author.date
                    ).toLocaleString()
                  : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GitHubCommits;