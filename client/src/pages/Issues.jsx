import { useEffect, useState } from "react";
import { getIssues } from "../services/issueService";
import IssueModal from "../components/IssueModal";
import { deleteIssue } from "../services/issueService";
import toast from "react-hot-toast";

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
  fetchIssues();
}, [debouncedSearch, status, priority]);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => clearTimeout(timer);
}, [search]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await getIssues({
        search: debouncedSearch,
        status,
        priority,
      });

      setIssues(data.issues || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
  try {
    await deleteIssue(issueToDelete._id);

    toast.success("Issue Deleted Successfully!");

    setDeleteModal(false);
    setIssueToDelete(null);

    fetchIssues();
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message ||
      "Failed to delete issue"
    );
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-green-500/20 text-green-400";

      case "Resolved":
        return "bg-blue-500/20 text-blue-400";

      case "In Progress":
        return "bg-yellow-500/20 text-yellow-400";

      case "Closed":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500/20 text-red-400";

      case "High":
        return "bg-orange-500/20 text-orange-400";

      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";

      case "Low":
        return "bg-green-500/20 text-green-400";

      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-white p-8">
      {/* Header */}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-400">
            Issue Tracker
          </h1>

          <p className="text-gray-400 mt-2">
            Track and manage project issues.
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-6 py-3 rounded-lg font-semibold shadow-lg"
        >
          + New Issue
        </button>
      </div>

      {/* Search + Filters */}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
        <input
          type="text"
          placeholder="🔍 Search Issues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#111827] border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#111827] border border-gray-700 rounded-lg px-4 py-3"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-[#111827] border border-gray-700 rounded-lg px-4 py-3"
        >
          <option value="">All Priority</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatus("");
            setPriority("");
          }}
          className="px-5 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-300"
        >
          Clear Filters
        </button>



      </div>

      {/* Loading */}

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-xl">
          Loading Issues...
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-10 text-center">
          <h2 className="text-2xl font-semibold">
            No Issues Found
          </h2>

          <p className="text-gray-400 mt-2">
            Create your first issue.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                {/* Left */}

                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {issue.title}
                  </h2>

                  <p className="text-gray-400 mt-3">
                    {issue.description}
                  </p>

                  <div className="mt-5 space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">
                        Project :
                      </span>

                      <span className="text-blue-400 ml-2">
                        {issue.project?.name || "N/A"}
                      </span>
                    </p>

                    <p>
                      <span className="text-gray-500">
                        Assigned To :
                      </span>

                      <span className="text-green-400 ml-2">
                        {issue.assignedTo?.name || "N/A"}
                      </span>
                    </p>

                    <p>
                      <span className="text-gray-500">
                        Reporter :
                      </span>

                      <span className="text-purple-400 ml-2">
                        {issue.reporter?.name || "N/A"}
                      </span>
                    </p>

                    <p>
                      <span className="text-gray-500">
                        Due Date :
                      </span>

                      <span className="text-yellow-400 ml-2">
                        {issue.dueDate
                          ? new Date(
                              issue.dueDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right */}

                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      issue.status
                    )}`}
                  >
                    {issue.status}
                  </span>

                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${getPriorityColor(
                      issue.priority
                    )}`}
                  >
                    {issue.priority}
                  </span>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        setSelectedIssue(issue);
                        setOpenModal(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setIssueToDelete(issue);
                        setDeleteModal(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <IssueModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedIssue(null);
        }}
        onIssueCreated={fetchIssues}
        issue={selectedIssue}
      />

      {deleteModal && (
  <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
    <div className="bg-[#111827] rounded-xl p-8 w-full max-w-md border border-gray-700">

      <h2 className="text-2xl font-bold text-white mb-4">
        Delete Issue
      </h2>

      <p className="text-gray-400 mb-6">
        Are you sure you want to delete this issue?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setDeleteModal(false);
            setIssueToDelete(null);
          }}
          className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default Issues;