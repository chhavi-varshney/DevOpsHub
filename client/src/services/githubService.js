import api from "./api";

// Start GitHub OAuth
export const connectGitHub = async () => {
  const response = await api.get("/github/connect");
  return response.data;
};

// Get GitHub repositories
export const getRepositories = async () => {
  const response = await api.get("/github/repositories");
  return response.data;
};

// Get repository commits
export const getCommits = async (owner, repo) => {
  const response = await api.get(
    `/github/repos/${owner}/${repo}/commits`
  );

  return response.data;
};

// Get pull requests
export const getPullRequests = async (
  owner,
  repo,
  state = "all"
) => {
  const response = await api.get(
    `/github/repos/${owner}/${repo}/pulls`,
    {
      params: { state },
    }
  );

  return response.data;
};

// Get issues
export const getIssues = async (
  owner,
  repo,
  state = "open"
) => {
  const response = await api.get(
    `/github/repos/${owner}/${repo}/issues`,
    {
      params: { state },
    }
  );

  return response.data;
};

// Get GitHub dashboard statistics
export const getGitHubStats = async () => {
  const response = await api.get("/github/stats");
  return response.data;
};