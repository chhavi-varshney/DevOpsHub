import User from "../models/User.js";

const GITHUB_API_URL = "https://api.github.com";

const GITHUB_API_VERSION = "2022-11-28";

// Get GitHub access token of logged-in DevOpsHub user
const getGitHubToken = async (userId) => {
  const user = await User.findById(userId)
    .select("+githubAccessToken");

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.githubAccessToken) {
    throw new Error("GitHub account is not connected");
  }

  return user.githubAccessToken;
};

// Common GitHub API request
const githubRequest = async (
  userId,
  endpoint,
  options = {}
) => {
  const token = await getGitHubToken(userId);

  const response = await fetch(
    `${GITHUB_API_URL}${endpoint}`,
    {
      method: options.method || "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
        ...(options.headers || {}),
      },
      body: options.body,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "GitHub API Error:",
      response.status,
      data
    );

    throw new Error(
      data.message ||
        `GitHub API request failed with status ${response.status}`
    );
  }

  return data;
};

// Get authenticated GitHub profile
export const getGitHubProfile = async (userId) => {
  return githubRequest(userId, "/user");
};

// Get user's repositories
export const getRepositories = async (userId) => {
  return githubRequest(
    userId,
    "/user/repos?sort=updated&per_page=100"
  );
};



// Get repository commits
export const getCommits = async (
  userId,
  owner,
  repo
) => {
  return githubRequest(
    userId,
    `/repos/${owner}/${repo}/commits?per_page=100`
  );
};

// Get pull requests
export const getPullRequests = async (
  userId,
  owner,
  repo,
  state = "all"
) => {
  return githubRequest(
    userId,
    `/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`
  );
};

// Get issues
export const getIssues = async (
  userId,
  owner,
  repo,
  state = "open"
) => {
  return githubRequest(
    userId,
    `/repos/${owner}/${repo}/issues?state=${state}&per_page=100`
  );
};

// Get GitHub dashboard statistics
export const getGitHubStats = async (userId) => {
  const repositories = await getRepositories(userId);

  let todayCommits = 0;
  let openIssues = 0;
  let mergedPRs = 0;

  for (const repo of repositories) {
    const owner = repo.owner.login;
    const repoName = repo.name;

    // -----------------------------
    // COMMITS
    // -----------------------------
    try {
      const commits = await getCommits(
        userId,
        owner,
        repoName
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      todayCommits += commits.filter((commit) => {
        const date = commit.commit?.author?.date;

        if (!date) return false;

        return new Date(date) >= today;
      }).length;
    } catch (error) {
      // Empty GitHub repositories can return 409
      // from the commits endpoint.
      if (!error.message.includes("Git Repository is empty")) {
        console.error(
          `Commits error for ${owner}/${repoName}:`,
          error.message
        );
      }
    }

    // -----------------------------
    // OPEN ISSUES
    // -----------------------------
    try {
      const issues = await getIssues(
        userId,
        owner,
        repoName,
        "open"
      );

      openIssues += issues.filter(
        (issue) => !issue.pull_request
      ).length;
    } catch (error) {
      console.error(
        `Issues error for ${owner}/${repoName}:`,
        error.message
      );
    }

    // -----------------------------
    // MERGED PULL REQUESTS
    // -----------------------------
    try {
      const pullRequests = await getPullRequests(
        userId,
        owner,
        repoName,
        "closed"
      );

      mergedPRs += pullRequests.filter(
        (pr) => pr.merged_at
      ).length;
    } catch (error) {
      console.error(
        `Pull requests error for ${owner}/${repoName}:`,
        error.message
      );
    }
  }

  return {
    repositories: repositories.length,
    todayCommits,
    openIssues,
    mergedPRs,
  };
};