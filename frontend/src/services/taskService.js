import API from "./api";

export const getTasks = async (clientId) => {
  const res = await API.get(`/tasks?clientId=${clientId}`);
  return res.data;
};

export const createTask = async (data) => {
  const res = await API.post("/tasks", data);
  return res.data;
};

export const updateTaskStatus = async ({ id, status }) => {
  const res = await API.patch(`/tasks/${id}`, { status });
  return res.data;
};