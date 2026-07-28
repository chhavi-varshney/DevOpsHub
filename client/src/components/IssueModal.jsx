import { useEffect, useState } from "react";
import axios from "axios";
import {
  createIssue,
  updateIssue,
} from "../services/issueService";
import toast from "react-hot-toast";

const IssueModal = ({
  isOpen,
  onClose,
  onIssueCreated,
  issue,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "Medium",
    status: "Open",
    dueDate: "",
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const token = localStorage.getItem("token");

  const fetchProjects = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/projects",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setProjects(res.data.projects || []);
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

const fetchUsers = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/users",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUsers(res.data.users || []);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

useEffect(() => {
  if (isOpen) {
    fetchProjects();
    fetchUsers();
  }
}, [isOpen]);

useEffect(() => {
  if (issue) {
    setFormData({
      title: issue.title || "",
      description: issue.description || "",
      project: issue.project?._id || "",
      assignedTo: issue.assignedTo?._id || "",
      priority: issue.priority || "Medium",
      status: issue.status || "Open",
      dueDate: issue.dueDate
        ? issue.dueDate.substring(0, 10)
        : "",
    });
  } else {
    setFormData({
      title: "",
      description: "",
      project: "",
      assignedTo: "",
      priority: "Medium",
      status: "Open",
      dueDate: "",
    });
  }
}, [issue]);


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (issue) {
      await updateIssue(issue._id, formData);
      toast.success("Issue Updated Successfully!");
    } else {
      await createIssue(formData);
      toast.success("Issue Created Successfully!");
    }

    setFormData({
      title: "",
      description: "",
      project: "",
      assignedTo: "",
      priority: "Medium",
      status: "Open",
      dueDate: "",
    });

    onClose();

    if (onIssueCreated) {
      onIssueCreated();
    }
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message ||
        (issue
          ? "Failed to update issue"
          : "Failed to create issue")
    );
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-[#111827] w-full max-w-2xl rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-white">
            {issue ? "Edit Issue" : "Create Issue"}
          </h2>

          <button
            onClick={onClose}
            className="text-red-400 text-2xl hover:text-red-500"
          >
            ✕
          </button>

        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="title"
            placeholder="Issue Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-[#1F2937] p-3 rounded-lg text-white outline-none"
            required
          />

          <textarea
            rows="4"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-[#1F2937] p-3 rounded-lg text-white outline-none"
          />

          <select
          name="project"
          value={formData.project}
          onChange={handleChange}
          className="w-full bg-[#1F2937] p-3 rounded-lg text-white"
        >
          <option value="">Select Project</option>

          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>

          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full bg-[#1F2937] p-3 rounded-lg text-white"
          >
            <option value="">Assign User</option>

            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="bg-[#1F2937] p-3 rounded-lg text-white"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="bg-[#1F2937] p-3 rounded-lg text-white"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

          </div>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full bg-[#1F2937] p-3 rounded-lg text-white"
          />

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              {issue ? "Update Issue" : "Create Issue"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default IssueModal;