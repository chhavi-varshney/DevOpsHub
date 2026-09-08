import { useEffect, useState } from "react";
import { getDashboardAnalytics } from "../services/analyticsService";

import AnalyticsSummary from "../components/analytics/AnalyticsSummary";
import CommitChart from "../components/analytics/CommitChart";
import TaskChart from "../components/analytics/TaskChart";
import BugChart from "../components/analytics/BugChart";
import SprintChart from "../components/analytics/SprintChart";
import DeploymentChart from "../components/analytics/DeploymentChart";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("7days");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardAnalytics(dateRange);

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError("Failed to load analytics");
      }
    } catch (err) {
      console.error("Analytics Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadAnalytics();
}, [dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-gray-400">
            Loading analytics...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-400">
            Dashboard Analytics
          </h1>

          <p className="mt-2 text-gray-400">
            Track commits, tasks, sprints, bugs and deployments.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {[
            { value: "7days", label: "7 Days" },
            { value: "30days", label: "30 Days" },
            { value: "month", label: "This Month" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setDateRange(filter.value)}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                dateRange === filter.value
                  ? "bg-blue-500 text-white"
                  : "border border-slate-800 bg-slate-900 text-gray-400 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Analytics */}
        <div className="space-y-8">
          <AnalyticsSummary
            analytics={analytics}
          />

          <CommitChart
            commits={analytics?.commits || []}
          />

          <TaskChart
            tasks={analytics?.tasks || {}}
          />

          <BugChart
            issues={analytics?.issues || {}}
          />

          <SprintChart
            sprints={analytics?.sprints || {}}
          />

          <DeploymentChart
            deployments={analytics?.deployments || {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;