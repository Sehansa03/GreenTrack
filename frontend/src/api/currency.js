import API from "./index";

export const currencyAPI = {
  getRates: (base) =>
    API.get(`/currency/rates?base=${base}`),
};