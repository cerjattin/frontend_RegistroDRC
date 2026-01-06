import axios from "axios";
import { ENV } from "../config/env"; // ✅ ajusta el path si tu env.ts está en otra carpeta

// ✅ Fuente única de verdad para el backend
const API = ENV.API_URL;

export type RegisterPayload = {
  document: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;

  municipality_id: number;
  neighborhood_id: number;
  leader_id: number;

  coordinator_id?: number;

  consent: boolean;
  captcha_token: string;
};

export type ResolveLinkResponse = {
  valid: boolean;
  leaderCode?: number;
  coordinatorCode?: number;
  leaderName?: string;
  coordinatorName?: string;
  message?: string;
};

export async function resolveLeaderLink(
  leader: string,
  coord: string
): Promise<ResolveLinkResponse> {
  const { data } = await axios.get(`${API}/public/link/resolve`, {
    params: { leader, coord },
  });
  return data;
}

export async function registerVoter(payload: RegisterPayload) {
  const { data } = await axios.post(
    `${API}/public/voters/register?mode=leader_link`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return data;
}
