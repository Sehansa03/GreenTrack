import API from "./index";

export const expenseAPI = {
  create: (data) => API.post("/expense", data),
  getAll: () => API.get("/expense"),
  delete: (id) => API.delete(`/expense/${id}`),
  update: (id, data) => API.put(`/expense/${id}`, data),
};