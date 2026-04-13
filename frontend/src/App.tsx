import { useEffect, useMemo, useRef, useState } from "react";
import { ProjectList } from "./components/ProjectList";
import { ProjectExplorer } from "./components/ProjectExplorer";
import { ThreeColumnLayout } from "./components/ThreeColumnLayout";
import { UploadBox } from "./components/UploadBox";
import {
  fetchProjects,
  fetchProjectReview,
  fetchProjectSource,
  fetchProjectTree,
  uploadProject
} from "./services/api";
import type { Project, ProjectTreeNode, ReviewResult } from "./types/project";

function getNodeFilePath(node: ProjectTreeNode | null): string | null {
  return node?.file_path ?? (node?.type === "file" ? node.path : null);
}

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectTree, setProjectTree] = useState<ProjectTreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<ProjectTreeNode | null>(null);
  const [sourceContent, setSourceContent] = useState<string>("");
  const [treeLoading, setTreeLoading] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const codeViewerRef = useRef<HTMLDivElement | null>(null);

  async function loadProjects() {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchProjects();
      setProjects(items);
      if (!selectedProjectId && items.length > 0) {
        setSelectedProjectId(items[0].id);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Cannot load projects.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectTree(null);
      setSelectedNode(null);
      setSourceContent("");
      setReviewResult(null);
      return;
    }

    async function loadProjectTree() {
      setTreeLoading(true);
      setError(null);
      try {
        const root = await fetchProjectTree(selectedProjectId);
        setProjectTree(root);
        setSelectedNode(null);
        setSourceContent("");
        setReviewResult(null);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Cannot load project tree.";
        setError(message);
      } finally {
        setTreeLoading(false);
      }
    }

    void loadProjectTree();
  }, [selectedProjectId]);

  const selectedFilePath = getNodeFilePath(selectedNode);

  useEffect(() => {
    if (!selectedProjectId || !selectedFilePath) {
      return;
    }

    async function loadSourceFile() {
      setSourceLoading(true);
      setError(null);
      try {
        const content = await fetchProjectSource(selectedProjectId, selectedFilePath);
        setSourceContent(content);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Cannot load source file.";
        setError(message);
      } finally {
        setSourceLoading(false);
      }
    }

    void loadSourceFile();
  }, [selectedFilePath, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId || !selectedFilePath || !selectedNode) {
      setReviewResult(null);
      return;
    }

    async function loadReview() {
      setReviewLoading(true);
      setError(null);
      try {
        const result = await fetchProjectReview({
          projectId: selectedProjectId,
          path: selectedFilePath,
          targetName: selectedNode.name,
          targetType: selectedNode.type,
          startLine: selectedNode.start_line,
          endLine: selectedNode.end_line
        });
        setReviewResult(result);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Cannot load review result.";
        setError(message);
      } finally {
        setReviewLoading(false);
      }
    }

    void loadReview();
  }, [selectedFilePath, selectedNode, selectedProjectId]);

  useEffect(() => {
    if (!selectedNode?.start_line || !codeViewerRef.current) {
      return;
    }

    const activeLine = codeViewerRef.current.querySelector<HTMLElement>(
      `[data-line="${selectedNode.start_line}"]`
    );
    activeLine?.scrollIntoView({ block: "center" });
  }, [selectedNode, sourceContent]);

  async function handleUpload(file: File) {
    const created = await uploadProject(file);
    setProjects((current) => [created, ...current]);
    setSelectedProjectId(created.id);
  }

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const selectedStartLine = selectedNode?.start_line ?? null;
  const selectedEndLine = selectedNode?.end_line ?? null;
  const sourceLines = sourceContent.split("\n");

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>AI Codebase Reviewer v1</h1>
      </header>
      <ThreeColumnLayout
        left={
          <>
            <UploadBox onUpload={handleUpload} />
            {loading ? <p className="helper-text">Loading projects...</p> : null}
            {treeLoading ? <p className="helper-text">Loading source tree...</p> : null}
            {error ? <p className="error-text">{error}</p> : null}
            <ProjectList
              projects={projects}
              selectedId={selectedProjectId}
              onSelect={(project) => setSelectedProjectId(project.id)}
            />
            <ProjectExplorer
              root={projectTree}
              selectedPath={selectedNode?.path ?? null}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          </>
        }
        middle={
          <section className="panel panel-fill">
            <h2 className="panel-title">Code Viewer</h2>
            {selectedProject ? (
              <>
                <div className="viewer-meta">
                  <strong>{selectedProject.name}</strong>
                  <span>{selectedFilePath ?? "Choose a file, class, or function from the explorer."}</span>
                </div>
                {sourceLoading ? (
                  <p className="placeholder">Loading source file...</p>
                ) : selectedFilePath ? (
                  <div className="code-viewer" ref={codeViewerRef}>
                    {sourceLines.map((line, index) => {
                      const lineNumber = index + 1;
                      const isHighlighted =
                        selectedStartLine !== null &&
                        selectedEndLine !== null &&
                        lineNumber >= selectedStartLine &&
                        lineNumber <= selectedEndLine;

                      return (
                        <div
                          key={`${lineNumber}-${line}`}
                          className={isHighlighted ? "code-line highlighted" : "code-line"}
                          data-line={lineNumber}
                        >
                          <span className="line-number">{lineNumber}</span>
                          <span className="line-content">{line || " "}</span>
                        </div>
                      );
                    })}
                    {sourceContent.length === 0 ? (
                      <div className="code-line">
                        <span className="line-number">1</span>
                        <span className="line-content">// Empty file</span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="placeholder">Select a file, class, or function to preview its extracted source.</p>
                )}
              </>
            ) : (
              <p className="placeholder">
                Upload and select a project to inspect source in the next phase.
              </p>
            )}
          </section>
        }
        right={
          <section className="panel panel-fill">
            <h2 className="panel-title">AI Review Panel</h2>
            {selectedNode ? (
              <div className="review-summary">
                <p className="helper-text">
                  Selected context: {selectedNode.type} `{selectedNode.name}`
                </p>
                {reviewLoading ? <p className="placeholder">Loading review result...</p> : null}
                {reviewResult ? (
                  <>
                    <p className="placeholder">{reviewResult.summary}</p>
                    <section>
                      <h3 className="section-title">Findings</h3>
                      {reviewResult.findings.length === 0 ? (
                        <p className="helper-text">No heuristic findings for this selection.</p>
                      ) : (
                        <ul className="detail-list">
                          {reviewResult.findings.map((finding) => (
                            <li key={`${finding.title}-${finding.start_line ?? 0}`} className="detail-card">
                              <strong>
                                [{finding.severity.toUpperCase()}] {finding.title}
                              </strong>
                              <span>
                                {finding.start_line && finding.end_line
                                  ? `Lines ${finding.start_line}-${finding.end_line}`
                                  : "Scope-level finding"}
                              </span>
                              <p>{finding.explanation}</p>
                              <p>{finding.suggestion}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                    <section>
                      <h3 className="section-title">Suggestions</h3>
                      <ul className="detail-list">
                        {reviewResult.suggestions.map((suggestion) => (
                          <li key={suggestion.title} className="detail-card">
                            <strong>{suggestion.title}</strong>
                            <p>{suggestion.detail}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h3 className="section-title">Test Cases</h3>
                      <ul className="detail-list">
                        {reviewResult.test_cases.map((testCase) => (
                          <li key={testCase.title} className="detail-card">
                            <strong>{testCase.title}</strong>
                            <p>{testCase.detail}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </>
                ) : null}
              </div>
            ) : (
              <p className="placeholder">
                Select a file, class, or function to load structured review output for that context.
              </p>
            )}
          </section>
        }
      />
    </div>
  );
}
