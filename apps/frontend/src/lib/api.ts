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
const API_URL =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "";

export async function signin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await axios.post(`${API_URL}/api/signin`, { email, password });
  return res.data;
}

export async function signup(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await axios.post(`${API_URL}/api/signup`, {
    name,
    email,
    password,
  });
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
  const res = await axios.get(`${API_URL}/api/organizations`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function createOrganisation(
  orgName: string,
): Promise<Organisation> {
  const res = await axios.post(
    `${API_URL}/api/organization`,
    { orgName },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function inviteMember(
  email: string,
  orgId: string,
): Promise<{ message: string }> {
  const res = await axios.post(
    `${API_URL}/api/invite`,
    { email, orgId },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function getInvitations(): Promise<Organisation[]> {
  const res = await axios.get(`${API_URL}/api/invitations`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function acceptInvitation(
  orgId: string,
): Promise<{ message: string }> {
  const res = await axios.post(
    `${API_URL}/api/accept`,
    { orgId },
    { headers: authHeaders() },
  );
  return res.data;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    return data?.error ?? error.message;
  }
  return error instanceof Error ? error.message : fallback;
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

export async function createBoard(
  title: string,
  orgId: string,
): Promise<Board> {
  const res = await axios.post(
    `${API_URL}/api/board`,
    { title, orgId },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function getBoard(boardId: string): Promise<Board> {
  const res = await axios.get(`${API_URL}/api/board`, {
    params: { boardId },
    headers: authHeaders(),
  });
  return res.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const res = await axios.get(`${API_URL}/api/me`, { headers: authHeaders() });
  return res.data;
}

export interface Section {
  id: string;
  title: string;
  boardId: string;
  createdAt: string;
}

export async function getSections(boardId: string): Promise<Section[]> {
  const res = await axios.get(`${API_URL}/api/sections`, {
    params: { boardId },
    headers: authHeaders(),
  });
  return res.data;
}

export async function createSection(
  title: string,
  boardId: string,
): Promise<Section> {
  const res = await axios.post(
    `${API_URL}/api/section`,
    { title, boardId },
    { headers: authHeaders() },
  );
  return res.data;
}

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  // Fractional order key (e.g. "a0", "a0V"): issues sort lexicographically,
  // and reordering only ever rewrites the moved issue's key.
  position: string;
  boardId: string;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getIssues(
  boardId: string,
): Promise<Record<string, Issue[]>> {
  const res = await axios.get(`${API_URL}/api/issues`, {
    params: { boardId },
    headers: authHeaders(),
  });
  return res.data;
}

export async function createIssue(
  title: string,
  sectionId: string,
  boardId: string,
): Promise<Issue> {
  const res = await axios.post(
    `${API_URL}/api/issue`,
    { title, sectionId, boardId },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function moveIssue(
  issueId: string,
  targetSectionId: string,
  newKey: string,
): Promise<Issue> {
  const res = await axios.put(
    `${API_URL}/api/issue/move`,
    { issueId, targetSectionId, newKey },
    { headers: authHeaders() },
  );
  return res.data;
}
