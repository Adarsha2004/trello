import axios from "axios";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token?: string;
  user: AuthUser;
}

// Dev default: local backend. In the cluster, Dockerfile sets BUN_PUBLIC_API_URL="" (same-origin via ingress)
const API_URL = process.env.PUBLIC_API_URL ?? "http://localhost:3000";

export async function signin(email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post(`${API_URL}/api/signin`, { email, password });
  return res.data;
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post(`${API_URL}/api/signup`, { name, email, password });
  return res.data;
}
