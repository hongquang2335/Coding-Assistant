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
  type: "directory" | "file" | "class" | "function";
  file_path: string | null;
  start_line: number | null;
  end_line: number | null;
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

export type ReviewFinding = {
  severity: string;
  title: string;
  explanation: string;
  file_path: string;
  start_line: number | null;
  end_line: number | null;
  suggestion: string;
};

export type ReviewSuggestion = {
  title: string;
  detail: string;
};

export type ReviewTestCase = {
  title: string;
  detail: string;
};

export type ReviewResult = {
  project_id: string;
  path: string;
  target_name: string;
  target_type: string;
  summary: string;
  findings: ReviewFinding[];
  suggestions: ReviewSuggestion[];
  test_cases: ReviewTestCase[];
};
