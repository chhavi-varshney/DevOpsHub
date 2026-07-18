import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const Projects = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [search, setSearch] = useState("");

  const fetchOrganizations = async () => {
    try {
      const res = await api.get("/organizations");
      setOrganizations(res.data.organizations);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load organizations");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (error) {
      toast.error("Failed to load projects");
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description);
    setOrganization(project.organization._id);
  };

  const deleteProject = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/projects/${id}`);
      toast.success(res.data.message);
      fetchProjects();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete project"
      );
    }
  };

  const createProject = async () => {
    try {
      if (editingProject) {
        const res = await api.put(`/projects/${editingProject._id}`, {
          name,
          description,
          organization,
        });

        toast.success(res.data.message);
      } else {
        const res = await api.post("/projects", {
          name,
          description,
          organization,
          status: "Planning",
        });

        toast.success(res.data.message);
      }

      setName("");
      setDescription("");
      setOrganization("");
      setEditingProject(null);

      fetchProjects();
      fetchOrganizations();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save project"
      );
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchProjects();
  }, []);


  const filteredProjects = projects.filter((project) =>
  project.name.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Projects</h1>

        {/* Form */}
        <div className="bg-slate-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">
            {editingProject ? "Edit Project" : "Create New Project"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 p-3 rounded-lg outline-none"
            />

            <select
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-white"
            >
              <option value="">Select Organization</option>

              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-slate-800 p-3 rounded-lg outline-none mt-5"
          />

          <button
            onClick={createProject}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
          >
            {editingProject ? "Update Project" : "Create Project"}
          </button>

          {editingProject && (
            <button
              onClick={() => {
                setEditingProject(null);
                setName("");
                setDescription("");
                setOrganization("");
              }}
              className="mt-3 w-full bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Projects List */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">All Projects</h2>

          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg mb-6 outline-none"
          />

          {filteredProjects.length === 0 ? (
            <p className="text-gray-400">
              No matching projects found.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-slate-800 p-5 rounded-lg border border-slate-700"
                >
                  <h3 className="text-xl font-semibold text-blue-400">
                    {project.name}
                  </h3>

                  <p className="text-gray-300 mt-2">
                    {project.description}
                  </p>

                  <p className="mt-3">
                    <span className="font-semibold">Organization:</span>{" "}
                    {project.organization?.name}
                  </p>

                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    {project.status}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(project)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProject(project._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;