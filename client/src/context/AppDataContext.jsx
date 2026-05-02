import { createContext, useEffect, useState } from "react";
import { apiRequest } from "../api/http.js";
import { useAuth } from "../hooks/useAuth.js";

export const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchProjects() {
    const data = await apiRequest("/projects", { token });
    setProjects(data.projects);

    setSelectedProjectId((current) => {
      if (current && data.projects.some((project) => project.id === current)) {
        return current;
      }

      return data.projects[0]?.id || null;
    });
  }

  async function fetchTasks() {
    const data = await apiRequest("/tasks", { token });
    setTasks(data.tasks);
  }

  async function refreshData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchProjects(), fetchTasks()]);
    } catch (refreshError) {
      setError(refreshError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setProjects([]);
      setTasks([]);
      setSelectedProjectId(null);
      setSearchTerm("");
      setError("");
    }
  }, [isAuthenticated, token]);

  async function createProject(payload) {
    const data = await apiRequest("/projects", {
      token,
      method: "POST",
      body: payload
    });

    await refreshData();
    setSelectedProjectId(data.project.id);
  }

  async function deleteProject(projectId) {
    await apiRequest(`/projects/${projectId}`, {
      token,
      method: "DELETE"
    });
    await refreshData();
  }

  async function addMember(projectId, payload) {
    await apiRequest(`/projects/${projectId}/members`, {
      token,
      method: "POST",
      body: payload
    });
    await refreshData();
  }

  async function removeMember(projectId, userId) {
    await apiRequest(`/projects/${projectId}/members/${userId}`, {
      token,
      method: "DELETE"
    });
    await refreshData();
  }

  async function createTask(payload) {
    await apiRequest("/tasks", {
      token,
      method: "POST",
      body: payload
    });
    await refreshData();
  }

  async function updateTask(taskId, payload) {
    await apiRequest(`/tasks/${taskId}`, {
      token,
      method: "PUT",
      body: payload
    });
    await refreshData();
  }

  async function deleteTask(taskId) {
    await apiRequest(`/tasks/${taskId}`, {
      token,
      method: "DELETE"
    });
    await refreshData();
  }

  return (
    <AppDataContext.Provider
      value={{
        error,
        loading,
        projects,
        refreshData,
        searchTerm,
        selectedProjectId,
        setSearchTerm,
        setSelectedProjectId,
        tasks,
        addMember,
        createProject,
        createTask,
        deleteProject,
        deleteTask,
        removeMember,
        updateTask
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

