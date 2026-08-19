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

const API_URL = "http://localhost:3000";

export async function signin(email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post(`${API_URL}/signin`, { email, password });
  return res.data;
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await axios.post(`${API_URL}/signup`, { name, email, password });
  return res.data;
}
