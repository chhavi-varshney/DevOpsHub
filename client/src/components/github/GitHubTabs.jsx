const GitHubTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "commits", label: "Commits" },
    { id: "pullRequests", label: "Pull Requests" },
    { id: "issues", label: "Issues" },
  ];

  return (
    <div className="mb-6 border-b border-slate-800">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-t-lg px-5 py-3 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-blue-400 text-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GitHubTabs;