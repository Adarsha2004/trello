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

export type OrganisationRole = "ADMIN" | "MEMBER";

export interface Organisation {
  id: string;
  name: string;
  description: string | null;
  role: OrganisationRole;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getOrganisations(): Promise<Organisation[]> {
  const res = await axios.get(`${API_URL}/api/organizations`, { headers: authHeaders() });
  return res.data;
}

export async function createOrganisation(orgName: string): Promise<Organisation> {
  const res = await axios.post(`${API_URL}/api/organization`, { orgName }, { headers: authHeaders() });
  return res.data;
}

export interface Board {
  id: string;
  title: string;
  orgId: string;
  createdAt: string;
}

export async function getBoards(orgId: string): Promise<Board[]> {
  const res = await axios.get(`${API_URL}/api/boards`, {
    params: { orgId },
    headers: authHeaders(),
  });
  return res.data;
}

export async function createBoard(title: string, orgId: string): Promise<Board> {
  const res = await axios.post(`${API_URL}/api/board`, { title, orgId }, { headers: authHeaders() });
  return res.data;
}
