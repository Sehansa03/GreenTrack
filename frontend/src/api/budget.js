import API from "./index";

export const budgetAPI = {
  create: (data) => API.post("/budget", data),

  getAll: () => API.get("/budget"),

  update: (id, data) =>
    API.put(`/budget/${id}`, data),

  delete: (id) =>
    API.delete(`/budget/${id}`),
};