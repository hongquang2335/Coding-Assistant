import type {
  Project,
  ProjectListResponse,
  ProjectTreeNode,
  ProjectTreeResponse,
  SourceFileResponse
} from "../types/project";

const API_BASE = "http://localhost:8000";

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/api/projects`);
  if (!response.ok) {
    throw new Error("Failed to fetch projects.");
  }
  const data: ProjectListResponse = await response.json();
  return data.items;
}

export async function uploadProject(file: File): Promise<Project> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/projects/upload`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail ?? "Upload failed.");
  }
  return response.json();
}

export async function fetchProjectTree(projectId: string): Promise<ProjectTreeNode> {
  const response = await fetch(`${API_BASE}/api/projects/${projectId}/tree`);
  if (!response.ok) {
    throw new Error("Failed to fetch project tree.");
  }
  const data: ProjectTreeResponse = await response.json();
  return data.root;
}

export async function fetchProjectSource(projectId: string, path: string): Promise<string> {
  const params = new URLSearchParams({ path });
  const response = await fetch(`${API_BASE}/api/projects/${projectId}/source?${params.toString()}`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail ?? "Failed to fetch source file.");
  }
  const data: SourceFileResponse = await response.json();
  return data.content;
}
