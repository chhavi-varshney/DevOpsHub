import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import TaskFilters from "../components/tasks/TaskFilters";

const Tasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [projects, setProjects] = useState([]);

  const [users, setUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    dueDate: "",
    project: "",
    assignedTo: "",
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");



  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tasks");
    }
  };
  const handleEdit = (task) => {
  setIsEditing(true);
  setEditingTask(task);

  setFormData({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate
      ? task.dueDate.substring(0, 10)
      : "",
    project: task.project?._id,
    assignedTo: task.assignedTo?.id || task.assignedTo?._id || "",
  });

  setShowModal(true);
};
  const fetchProjects = async () => {
  try {
    const res = await api.get("/projects");
    setProjects(res.data.projects);
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch projects");
  }
};

const fetchUsers = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  setUsers([user]);
};

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};
const createTask = async (e) => {
  e.preventDefault();

  try {
    if (isEditing) {
      await api.put(`/tasks/${editingTask._id}`, formData);

      toast.success("Task Updated Successfully");
    } else {
      await api.post("/tasks", formData);

      toast.success("Task Created Successfully");
    }

    setShowModal(false);

    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      status: "To Do",
      dueDate: "",
      project: "",
      assignedTo: "",
    });

    setIsEditing(false);
    setEditingTask(null);

    fetchTasks();
  } catch (error) {
    console.error(error);
    console.log(error.response?.data);

    toast.error(
      error.response?.data?.message ||
        (isEditing ? "Failed to update task" : "Failed to create task")
    );
  }
};

const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/tasks/${id}`);

    toast.success("Task Deleted Successfully");

    fetchTasks();
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message || "Failed to delete task"
    );
  }
};

const clearFilters = () => {
  setSearch("");
  setStatusFilter("All");
  setPriorityFilter("All");
  setProjectFilter("All");
};

const filteredTasks = tasks.filter((task) => {
  const matchesSearch = task.title
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All" || task.status === statusFilter;

  const matchesPriority =
    priorityFilter === "All" || task.priority === priorityFilter;

  const matchesProject =
    projectFilter === "All" || task.project?._id === projectFilter;

  return (
    matchesSearch &&
    matchesStatus &&
    matchesPriority &&
    matchesProject
  );
});
const onDragEnd = async (result) => {
  const { destination, source, draggableId } = result;

  if (!destination) return;

  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return;
  }

  try {
    await api.patch(`/tasks/${draggableId}/status`, {
      status: destination.droppableId,
    });

    toast.success("Task moved successfully");

    fetchTasks();
  } catch (error) {
    console.error(error);

    toast.error("Failed to update task");
  }
};

  useEffect(() => {
  fetchTasks();
  fetchProjects();
  fetchUsers();
}, []);

  const todoTasks = filteredTasks.filter(
  (task) => task.status === "To Do"
);

const progressTasks = filteredTasks.filter(
  (task) => task.status === "In Progress"
);

const reviewTasks = filteredTasks.filter(
  (task) => task.status === "Review"
);

const doneTasks = filteredTasks.filter(
  (task) => task.status === "Done"
);

  const renderTasks = (taskList) => {
    if (taskList.length === 0) {
      return (
        <p className="text-slate-500 text-sm">
          No tasks available
        </p>
      );
    }

    return taskList.map((task, index) => (
  <Draggable
    key={task._id}
    draggableId={task._id}
    index={index}
  >
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-4 hover:border-blue-500 hover:shadow-lg transition-all duration-300">

          {/* Title */}
          <h3 className="text-lg font-bold text-white">
            {task.title}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-sm mt-2 line-clamp-3">
            {task.description || "No description provided"}
          </p>

          {/* Priority */}
          <div className="mt-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                task.priority === "High"
                  ? "bg-red-600 text-white"
                  : task.priority === "Medium"
                  ? "bg-yellow-500 text-black"
                  : "bg-green-600 text-white"
              }`}
            >
              {task.priority}
            </span>
          </div>

          {/* Assigned User */}
          <div className="mt-4">
            <p className="text-blue-400 text-sm">
              👤 {task.assignedTo?.name || "Unassigned"}
            </p>
          </div>

          {/* Project */}
          <div className="mt-2">
            <p className="text-green-400 text-sm">
              📁 {task.project?.name}
            </p>
          </div>

          {/* Due Date */}
          <div className="mt-2">
            <p className="text-red-400 text-sm">
              📅{" "}
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "No Due Date"}
            </p>
          </div>

          {/* Status */}
          <div className="mt-4">
            <span className="text-xs bg-slate-700 px-3 py-1 rounded-full">
              {task.status}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => handleEdit(task)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(task._id)}
              className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium transition"
            >
              Delete
            </button>
          </div>

        </div>
      </div>
    )}
  </Draggable>
));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold text-blue-500">
          Kanban Board
        </h1>

        
        <div className="flex gap-3">

          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold"
          >
            + Create Task
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
          >
            Dashboard
          </button>

        </div>

</div>
        <TaskFilters
          search={search}
          setSearch={setSearch}
          status={statusFilter}
          setStatus={setStatusFilter}
          priority={priorityFilter}
          setPriority={setPriorityFilter}
          project={projectFilter}
          setProject={setProjectFilter}
          projects={projects}
          clearFilters={clearFilters}
        />


        {/* Columns */}
        <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      

          {/* To Do */}

          <Droppable droppableId="To Do">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
              >
                <h2 className="text-xl font-bold text-blue-400 mb-5">
                  To Do ({todoTasks.length})
                </h2>

                {renderTasks(todoTasks)}

                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* In Progress */}

          <Droppable droppableId="In Progress">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
              >
                <h2 className="text-xl font-bold text-cyan-400 mb-5">
                  In Progress ({progressTasks.length})
                </h2>

                {renderTasks(progressTasks)}

                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Review */}

          <Droppable droppableId="Review">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
              >
                <h2 className="text-xl font-bold text-yellow-400 mb-5">
                  Review ({reviewTasks.length})
                </h2>

                {renderTasks(reviewTasks)}

                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Done */}

          <Droppable droppableId="Done">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
              >
                <h2 className="text-xl font-bold text-green-400 mb-5">
                  Done ({doneTasks.length})
                </h2>

                {renderTasks(doneTasks)}

                {provided.placeholder}
              </div>
            )}
          </Droppable>

        </div>
        </DragDropContext>

        {/* Create Task Modal */}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

              <h2 className="text-3xl font-bold text-blue-400 mb-6">
                {isEditing ? "Edit Task" : "Create New Task"}             
                 </h2>

              <form onSubmit={createTask} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Enter task description"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Review</option>
                    <option>Done</option>
                  </select>
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Due Date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Project
                </label>

                <select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
                  required
                >
                  <option value="">Select Project</option>

                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Assign To
                </label>

                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
                  required
                >
                  <option value="">Select User</option>

                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold"
                >
                  {isEditing ? "Update Task" : "Create Task"}
                </button>

              </div>
              </form>

              

            </div>

          </div>
        )}



      </div>
    </div>
  );
};

export default Tasks;