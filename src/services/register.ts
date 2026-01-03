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
    `${API}/public/voters/register?mode=leader_link`, // 👈 usa mode=leader_link
    payload
  );
  return data;
}


