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

// Local dev: talk straight to the backend. Everywhere else (cluster): same-origin, ingress routes /api.
const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000" : "";

export async function signin(email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post(`${API_URL}/api/signin`, { email, password });
  return res.data;
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post(`${API_URL}/api/signup`, { name, email, password });
  return res.data;
}
