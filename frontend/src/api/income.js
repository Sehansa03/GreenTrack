import API from "./index";

export const incomeAPI = {
  create: (data) => API.post("/income", data),
  getAll: () => API.get("/income"),
  delete: (id) => API.delete(`/income/${id}`),
  update: (id, data) => API.put(`/income/${id}`, data),
};