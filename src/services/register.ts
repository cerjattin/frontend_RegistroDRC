import axios from "axios";

const API = import.meta.env.VITE_API || "https://drcoxigeno.onrender.com";

export type RegisterPayload = {
  document: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;

  municipality_id: number;
  neighborhood_id: number;
  leader_id: number;

  consent: boolean;
  captcha_token: string;
};

export async function registerVoter(payload: RegisterPayload) {
  const { data } = await axios.post(`${API}/public/voters/register`, payload);
  return data;
}
