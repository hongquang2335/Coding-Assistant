export type Project = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  file_count: number;
};

export type ProjectListResponse = {
  items: Project[];
};

export type ProjectTreeNode = {
  name: string;
  path: string;
  type: "directory" | "file";
  children: ProjectTreeNode[];
};

export type ProjectTreeResponse = {
  project_id: string;
  root: ProjectTreeNode;
};

export type SourceFileResponse = {
  project_id: string;
  path: string;
  content: string;
};
