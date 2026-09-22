import axios from "axios";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// Local dev: talk straight to the backend. Everywhere else (cluster): same-origin, ingress routes /api.
const API_URL =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "";

// Auth uses cookies (Better Auth): send/accept them on every request.
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export type OrganisationRole = "ADMIN" | "MEMBER";

export interface Organisation {
  id: string;
  name: string;
  description: string | null;
  role: OrganisationRole;
}

export async function getOrganisations(): Promise<Organisation[]> {
  const res = await api.get("/api/organizations");
  return res.data;
}

export async function createOrganisation(
  orgName: string,
): Promise<Organisation> {
  const res = await api.post("/api/organization", { orgName });
  return res.data;
}

export async function inviteMember(
  email: string,
  orgId: string,
): Promise<{ message: string }> {
  const res = await api.post("/api/invite", { email, orgId });
  return res.data;
}

export async function getInvitations(): Promise<Organisation[]> {
  const res = await api.get("/api/invitations");
  return res.data;
}

export async function acceptInvitation(
  orgId: string,
): Promise<{ message: string }> {
  const res = await api.post("/api/accept", { orgId });
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
  const res = await api.get("/api/boards", { params: { orgId } });
  return res.data;
}

export async function createBoard(
  title: string,
  orgId: string,
): Promise<Board> {
  const res = await api.post("/api/board", { title, orgId });
  return res.data;
}

export async function getBoard(boardId: string): Promise<Board> {
  const res = await api.get("/api/board", { params: { boardId } });
  return res.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const res = await api.get("/api/me");
  return res.data;
}

export interface Section {
  id: string;
  title: string;
  boardId: string;
  createdAt: string;
}

export async function getSections(boardId: string): Promise<Section[]> {
  const res = await api.get("/api/sections", { params: { boardId } });
  return res.data;
}

export async function createSection(
  title: string,
  boardId: string,
): Promise<Section> {
  const res = await api.post("/api/section", { title, boardId });
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
  const res = await api.get("/api/issues", { params: { boardId } });
  return res.data;
}

export async function createIssue(
  title: string,
  sectionId: string,
  boardId: string,
): Promise<Issue> {
  const res = await api.post("/api/issue", { title, sectionId, boardId });
  return res.data;
}

export async function moveIssue(
  issueId: string,
  targetSectionId: string,
  newKey: string,
): Promise<Issue> {
  const res = await api.put("/api/issue/move", {
    issueId,
    targetSectionId,
    newKey,
  });
  return res.data;
}
