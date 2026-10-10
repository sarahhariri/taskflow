import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Dropdown } from "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/tasks";

const statuses = {
  new: {
    label: "New",
    className: "badge-new",
  },
  in_progress: {
    label: "In progress",
    className: "text-bg-warning",
  },
  completed: {
    label: "Completed",
    className: "text-bg-success",
  },
};

function formatDate(value) {
  if (!value) return "No due date";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState("");
  
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTasks() {
      try {
        const response = await fetch(API_URL, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load tasks. Please refresh and try again.");
        }

        const result = await response.json();
        setTasks(result.data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchTasks();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timeout = setTimeout(() => setSuccess(""), 5000);
    return () => clearTimeout(timeout);
  }, [success]);

  async function handleSubmit(event) {
  event.preventDefault();

  if (saving) return;

  const cleanTitle = title.trim();
  const isEditing = editingId !== null;

  setFormError("");
  setSuccess("");

  if (!cleanTitle) {
    setFormError("Please enter a task title.");
    return;
  }

  setSaving(true);

  try {
    const response = await fetch(
      isEditing ? `${API_URL}/${editingId}` : API_URL,
      {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          customer_name: customerName.trim() || null,
          description: description.trim() || null,
          due_date: dueDate || null,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        Object.values(result.errors || {}).flat()[0] ||
          result.message ||
          "Unable to save the task."
      );
    }

    setTasks((currentTasks) =>
      isEditing
        ? currentTasks.map((task) =>
            task.id === editingId ? result.data : task
          )
        : [result.data, ...currentTasks]
    );

    setEditingId(null);
    setTitle("");
    setCustomerName("");
    setDescription("");
    setDueDate("");
    setFilter("all");
    setSearch("");

    setSuccess(
      isEditing
        ? "Your task has been updated successfully."
        : "Your task has been added successfully."
    );
  } catch (err) {
    setFormError(err.message || "Unable to connect to the server.");
  } finally {
    setSaving(false);
  }
}
  async function handleDelete(task) {
    if (deletingId !== null || updatingId !== null) return;

    const confirmation = await Swal.fire({
      titleText: "Delete this task?",
      text: `"${task.title}" will be permanently deleted.`,
      icon: "warning",
      iconColor: "#d48b69",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Keep task",
      focusCancel: true,
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "taskflow-popup",
        title: "taskflow-popup-title",
        htmlContainer: "taskflow-popup-text",
        actions: "taskflow-popup-actions",
        confirmButton: "btn btn-delete-confirm",
        cancelButton: "btn btn-alert-cancel",
      },
    });

    if (!confirmation.isConfirmed) return;

    setDeletingId(task.id);
    setActionError("");

    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Unable to delete the task.");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((item) => item.id !== task.id)
      );

      await Swal.fire({
        titleText: "Task deleted",
        text: "Your task has been removed successfully.",
        icon: "success",
        iconColor: "#4658c9",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        customClass: {
          popup: "taskflow-popup",
          title: "taskflow-popup-title",
          htmlContainer: "taskflow-popup-text",
        },
      });
    } catch (err) {
      setActionError(err.message);

      await Swal.fire({
        titleText: "Could not delete",
        text: err.message,
        icon: "error",
        confirmButtonText: "OK",
        buttonsStyling: false,
        customClass: {
          popup: "taskflow-popup",
          title: "taskflow-popup-title",
          htmlContainer: "taskflow-popup-text",
          confirmButton: "btn btn-alert-cancel",
        },
      });
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(task) {
  setEditingId(task.id);
  setTitle(task.title);
  setCustomerName(task.customer_name || "");
  setDescription(task.description || "");
  setDueDate(task.due_date || "");

  setFormError("");
  setSuccess("");

  document.getElementById("taskTitle")?.focus();
}
  const newCount = tasks.filter((task) => task.status === "new").length;
  const progressCount = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const visibleTasks = tasks.filter((task) => {
    const matchesStatus = filter === "all" || task.status === filter;
    const query = search.trim().toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      (task.customer_name || "").toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  async function handleStatusChange(taskId, newStatus) {
    setUpdatingId(taskId);
    setActionError("");

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          Object.values(result.errors || {}).flat()[0] ||
          result.message ||
          "Unable to update the status."
        );
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? result.data : task
        )
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="taskflow-app">
      <header className="app-header">
        <div className="container py-3 d-flex align-items-center justify-content-between gap-3">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">✓</span>
            TaskFlow
          </a>

          <span className="workspace-label text-end">
            Small business workspace
          </span>
        </div>
      </header>

      <main className="container py-4 py-lg-5">
        <section className="mb-4 mb-lg-5">
          <p className="eyebrow mb-2">A little clarity. A better workday.</p>
          <h1 className="page-title mb-2">Keep your business moving.</h1>
          <p className="text-secondary mb-0">
            Organize your tasks, follow your deadlines, and make room for
            what matters.
          </p>
        </section>

        <section className="row g-3 mb-4" aria-label="Task overview">
          {[
            { label: "Total tasks", count: tasks.length, color: "purple" },
            { label: "New", count: newCount, color: "slate" },
            { label: "In progress", count: progressCount, color: "amber" },
            { label: "Completed", count: completedCount, color: "green" },
          ].map((stat) => (
            <div className="col-6 col-lg-3" key={stat.label}>
              <div className={`stat-card stat-${stat.color} h-100`}>
                <p className="stat-label mb-2">{stat.label}</p>
                <p className="stat-value mb-0">
                  {loading || error ? "—" : stat.count}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div className="row g-4 align-items-start">
          <aside className="col-12 col-lg-4">
            <section className="surface p-3 p-sm-4">
              <span className="section-tag mb-3">LET’S GET STARTED</span>
              <h2 className="h5 fw-bold mb-2">Add a new task</h2>
              <p className="small text-secondary mb-4">
                Capture the next thing your business needs.
              </p>

              <form onSubmit={handleSubmit}>
                <label htmlFor="taskTitle" className="form-label fw-semibold">
                  Task title <span className="text-danger">*</span>
                </label>

                <input
                  id="taskTitle"
                  type="text"
                  className={`form-control ${formError ? "is-invalid" : ""}`}
                  placeholder="e.g. Prepare Maya’s gift"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={255}
                  required
                  disabled={saving}
                  aria-invalid={Boolean(formError)}
                  aria-describedby={formError ? "taskTitleError" : undefined}
                />

                {formError && (
                  <div id="taskTitleError" className="invalid-feedback">
                    {formError}
                  </div>
                )}
                <div className="mt-3">
                  <label htmlFor="customerName" className="form-label fw-semibold">
                    Customer name
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    className="form-control"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    maxLength={255}
                    disabled={saving}
                  />
                </div>

                <div className="mt-3">
                  <label htmlFor="dueDate" className="form-label fw-semibold">
                    Due date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="mt-3">
                  <label htmlFor="description" className="form-label fw-semibold">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="form-control"
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={5000}
                    disabled={saving}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-brand w-100 mt-3"
                  disabled={saving || loading || Boolean(error)}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Saving...
                    </>
                  ) : (
                    editingId !== null ? "Update task" : "+ Add task"
                  )}
                </button>

                <p className="small text-secondary mt-3 mb-0">
                  New tasks start with the status “New”.
                </p>
              </form>

              {success && (
                <div
                  className="alert alert-success small mt-3 mb-0"
                  role="status"
                >
                  {success}
                </div>
              )}
            </section>
          </aside>

          <section className="col-12 col-lg-8" aria-labelledby="tasksHeading">
            <div className="surface p-3 p-sm-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <h2 id="tasksHeading" className="h5 fw-bold mb-0">
                  Your tasks
                </h2>
                <span className="small text-secondary">
                  {loading ? "Loading..." : `${visibleTasks.length} shown`}
                </span>
              </div>

              <label htmlFor="taskSearch" className="visually-hidden">
                Search tasks or customers
              </label>
              <input
                id="taskSearch"
                type="search"
                className="form-control mb-3"
                placeholder="Search tasks or customers..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div
                className="d-flex flex-wrap gap-2 mb-4"
                role="group"
                aria-label="Filter by status"
              >
                {[
                  { value: "all", label: "All tasks" },
                  { value: "new", label: "New" },
                  { value: "in_progress", label: "In progress" },
                  { value: "completed", label: "Completed" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`btn filter-btn ${filter === option.value ? "is-active" : ""
                      }`}
                    onClick={() => setFilter(option.value)}
                    aria-pressed={filter === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {loading && (
                <div className="empty-state" role="status">
                  <div className="spinner-border text-secondary mb-3" />
                  <p className="mb-0">Loading your tasks...</p>
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {!loading && !error && visibleTasks.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon mb-3" aria-hidden="true">✓</span>
                  <h3 className="h6 fw-bold">
                    {tasks.length === 0 ? "A fresh start" : "No matching tasks"}
                  </h3>
                  <p className="small text-secondary mb-0">
                    {tasks.length === 0
                      ? "Add your first task to plan your next step."
                      : "Try another search or choose a different status."}
                  </p>
                </div>
              )}
              {actionError && (
                <div className="alert alert-danger" role="alert">
                  {actionError}
                </div>
              )}
              {!loading && !error && (

                <div className="d-grid gap-3">
                  {visibleTasks.map((task) => {
                    const status = statuses[task.status] || {
                      label: task.status,
                      className: "text-bg-secondary",
                    };

                    const overdue =
                      task.due_date &&
                      task.due_date < todayString &&
                      task.status !== "completed";

                    return (
                      <article className="task-card" key={task.id}>
                        <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                          <h3 className="task-title h6 fw-bold mb-0">
                            {task.title}
                          </h3>
                          <span className={`badge ${status.className}`}>
                            {status.label}
                          </span>
                        </div>

                        {task.description && (
                          <p className="task-description small text-secondary mb-3">
                            {task.description}
                          </p>
                        )}

                        <div className="d-flex flex-wrap gap-2">
                          <span className="task-meta">
                            Customer: {task.customer_name || "Not specified"}
                          </span>
                          <span
                            className={`task-meta ${overdue ? "is-overdue" : ""}`}
                          >
                            {overdue ? "Overdue · " : ""}
                            {formatDate(task.due_date)}
                          </span>
                        </div>
                        <div className="row mt-3">
  <div className="col-12 col-sm-6">
    <p className="small mb-2">Task status</p>

    <div className="dropdown">
      <button
        id={`status-${task.id}`}
        type="button"
        className="btn status-trigger dropdown-toggle w-100"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={`Change status for ${task.title}`}
        disabled={updatingId !== null || deletingId !== null}
      >
        {updatingId === task.id
          ? "Saving..."
          : statuses[task.status]?.label || task.status}
      </button>

      <ul
        className="dropdown-menu status-menu w-100"
        aria-labelledby={`status-${task.id}`}
      >
        {Object.entries(statuses).map(([value, option]) => (
          <li key={value}>
            <button
              type="button"
              className={`dropdown-item status-option ${
                task.status === value ? "is-selected" : ""
              }`}
              aria-current={task.status === value ? "true" : undefined}
              disabled={updatingId !== null || deletingId !== null}
              onClick={(event) => {
  const trigger = event.currentTarget
    .closest(".dropdown")
    ?.querySelector('[data-bs-toggle="dropdown"]');

  if (trigger) {
    Dropdown.getOrCreateInstance(trigger).hide();
  }

  if (task.status !== value) {
    handleStatusChange(task.id, value);
  }
}}
            >
              <span className={`status-dot dot-${value}`} />
              <span>{option.label}</span>
              {task.status === value && (
                <span className="ms-auto" aria-hidden="true">✓</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
</div>
                        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
                          <button
  type="button"
  className="btn btn-edit btn-sm "
  onClick={() => handleEdit(task)}
  disabled={saving || deletingId !== null || updatingId !== null}
>
  Edit
</button>
                          <button
                            type="button"
                            className="btn btn-delete btn-sm"
                            onClick={() => handleDelete(task)}
                            disabled={deletingId !== null || updatingId !== null}
                          >
                            {deletingId === task.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="text-center small text-secondary mt-5">
          TaskFlow · One task at a time.
        </footer>
      </main>
    </div>
  );
}
