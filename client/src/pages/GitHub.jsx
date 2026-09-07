import { useEffect, useState } from "react";

import {
  connectGitHub,
  getGitHubStats,
  getRepositories,
  getCommits,
  getPullRequests,
  getIssues,
} from "../services/githubService";

const GitHub = () => {
  const [repositories, setRepositories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [issues, setIssues] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Load GitHub repositories and stats
  const loadGitHubData = async () => {
    try {
      setLoading(true);

      const [repoData, statsData] = await Promise.all([
        getRepositories(),
        getGitHubStats(),
      ]);

      if (repoData.success) {
        setRepositories(repoData.repositories || []);
        setConnected(true);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error(
        "GitHub Data Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Connect GitHub
  const handleConnectGitHub = async () => {
    try {
      const data = await connectGitHub();

      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(
        "GitHub Connect Error:",
        error.response?.data || error.message
      );
    }
  };

  // Load selected repository details
  const handleRepositoryClick = async (repo) => {
    try {
      setSelectedRepo(repo);

      // Smooth scroll to repository details
      setTimeout(() => {
        document
          .getElementById("repository-details")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);

      setDetailsLoading(true);

      const owner = repo.owner.login;
      const repoName = repo.name;

      const [commitData, prData, issueData] =
        await Promise.all([
          getCommits(owner, repoName),
          getPullRequests(owner, repoName, "all"),
          getIssues(owner, repoName, "open"),
        ]);

      setCommits(commitData.commits || []);
      setPullRequests(prData.pullRequests || []);

      setIssues(
        (issueData.issues || []).filter(
          (issue) => !issue.pull_request
        )
      );
    } catch (error) {
      console.error(
        "Repository Details Error:",
        error.response?.data || error.message
      );

      setCommits([]);
      setPullRequests([]);
      setIssues([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    if (params.get("connected") === "true") {
      setConnected(true);

      window.history.replaceState(
        {},
        document.title,
        "/github"
      );
    }

    loadGitHubData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-400">
              GitHub Integration
            </h1>

            <p className="mt-2 text-gray-400">
              Connect GitHub and manage repositories, commits,
              pull requests and issues.
            </p>
          </div>

          {!connected && (
            <button
              onClick={handleConnectGitHub}
              className="rounded-lg bg-gray-800 px-5 py-3 font-semibold transition hover:bg-gray-700"
            >
              Connect GitHub
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-gray-400">
            Loading GitHub data...
          </div>
        )}

        {!loading && (
          <>
            {/* Stats */}
            {stats && (
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-gray-400">
                    Repositories
                  </p>

                  <h2 className="mt-2 text-4xl font-bold text-blue-400">
                    {stats.repositories}
                  </h2>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-gray-400">
                    Today's Commits
                  </p>

                  <h2 className="mt-2 text-4xl font-bold text-green-400">
                    {stats.todayCommits}
                  </h2>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-gray-400">
                    Merged PRs
                  </p>

                  <h2 className="mt-2 text-4xl font-bold text-purple-400">
                    {stats.mergedPRs}
                  </h2>
                </div>
              </div>
            )}

            {/* Open Issues */}
            {stats && (
              <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-gray-400">
                  Open GitHub Issues
                </p>

                <h2 className="mt-2 text-4xl font-bold text-red-400">
                  {stats.openIssues}
                </h2>
              </div>
            )}

            {/* Repositories */}
            {repositories.length > 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-blue-400">
                    Repositories
                  </h2>

                  <span className="text-sm text-gray-500">
                    Click a repository for details
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {repositories.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() =>
                        handleRepositoryClick(repo)
                      }
                      className="cursor-pointer rounded-lg border border-slate-800 p-5 transition hover:border-blue-500 hover:bg-slate-800"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold">
                          {repo.name}
                        </h3>

                        {repo.private && (
                          <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
                            Private
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-gray-400">
                        {repo.description ||
                          "No description"}
                      </p>

                      <div className="mt-4 flex gap-4 text-sm text-gray-500">
                        <span>
                          ⭐ {repo.stargazers_count}
                        </span>

                        <span>
                          🍴 {repo.forks_count}
                        </span>

                        <span>
                          {repo.language || "Code"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              connected && (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-gray-400">
                  No repositories found.
                </div>
              )
            )}

            {/* Selected Repository Details */}
            {selectedRepo && (
              <div
                id="repository-details"
                className="scroll-mt-6 mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                {/* Details Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-400">
                      {selectedRepo.name}
                    </h2>

                    <p className="mt-1 text-gray-400">
                      {selectedRepo.description ||
                        "No description"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRepo(null);
                      setCommits([]);
                      setPullRequests([]);
                      setIssues([]);
                    }}
                    className="rounded-lg bg-gray-800 px-4 py-2 text-sm transition hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>

                {/* Details Loading */}
                {detailsLoading ? (
                  <div className="py-8 text-center text-gray-400">
                    Loading repository details...
                  </div>
                ) : (
                  <>
                    {/* Detail Stats */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                      {/* Commits */}
                      <div className="rounded-lg border border-slate-800 p-5">
                        <p className="text-gray-400">
                          Commits
                        </p>

                        <h3 className="mt-2 text-3xl font-bold text-green-400">
                          {commits.length}
                        </h3>
                      </div>

                      {/* Pull Requests */}
                      <div className="rounded-lg border border-slate-800 p-5">
                        <p className="text-gray-400">
                          Pull Requests
                        </p>

                        <h3 className="mt-2 text-3xl font-bold text-purple-400">
                          {pullRequests.length}
                        </h3>
                      </div>

                      {/* Issues */}
                      <div className="rounded-lg border border-slate-800 p-5">
                        <p className="text-gray-400">
                          Open Issues
                        </p>

                        <h3 className="mt-2 text-3xl font-bold text-red-400">
                          {issues.length}
                        </h3>
                      </div>
                    </div>

                    {/* Commits Preview */}
                    <div className="mt-8">
                      <h3 className="mb-4 text-xl font-semibold text-green-400">
                        Recent Commits
                      </h3>

                      {commits.length === 0 ? (
                        <p className="text-gray-500">
                          No commits found.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {commits.slice(0, 5).map((commit) => (
                            <div
                              key={commit.sha}
                              className="rounded-lg border border-slate-800 p-4"
                            >
                              <p className="font-medium">
                                {commit.commit?.message ||
                                  "No commit message"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {commit.commit?.author?.name ||
                                  "Unknown author"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pull Requests Preview */}
                    <div className="mt-8">
                      <h3 className="mb-4 text-xl font-semibold text-purple-400">
                        Pull Requests
                      </h3>

                      {pullRequests.length === 0 ? (
                        <p className="text-gray-500">
                          No pull requests found.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {pullRequests.slice(0, 5).map((pr) => (
                            <div
                              key={pr.id}
                              className="rounded-lg border border-slate-800 p-4"
                            >
                              <p className="font-medium">
                                #{pr.number} {pr.title}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                State: {pr.state}
                                {pr.merged_at
                                  ? " • Merged"
                                  : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Issues Preview */}
                    <div className="mt-8">
                      <h3 className="mb-4 text-xl font-semibold text-red-400">
                        Open Issues
                      </h3>

                      {issues.length === 0 ? (
                        <p className="text-gray-500">
                          No open issues found.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {issues.slice(0, 5).map((issue) => (
                            <div
                              key={issue.id}
                              className="rounded-lg border border-slate-800 p-4"
                            >
                              <p className="font-medium">
                                #{issue.number} {issue.title}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                State: {issue.state}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GitHub;