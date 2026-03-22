import API from "./api";

export const getClients = async () => {
  const res = await API.get("/clients");
  return res.data;
};

export const createClient = async (payload) => {
  const res = await API.post("/clients", payload);
  return res.data;
};