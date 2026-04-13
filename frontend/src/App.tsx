import { useEffect, useMemo, useState } from "react";
import { ProjectList } from "./components/ProjectList";
import { ProjectExplorer } from "./components/ProjectExplorer";
import { ThreeColumnLayout } from "./components/ThreeColumnLayout";
import { UploadBox } from "./components/UploadBox";
import {
  fetchProjects,
  fetchProjectSource,
  fetchProjectTree,
  uploadProject
} from "./services/api";
import type { Project, ProjectTreeNode } from "./types/project";

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectTree, setProjectTree] = useState<ProjectTreeNode | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [sourceContent, setSourceContent] = useState<string>("");
  const [treeLoading, setTreeLoading] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setSelectedFilePath(null);
      setSourceContent("");
      return;
    }

    async function loadProjectTree() {
      setTreeLoading(true);
      setError(null);
      try {
        const root = await fetchProjectTree(selectedProjectId);
        setProjectTree(root);
        setSelectedFilePath(null);
        setSourceContent("");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Cannot load project tree.";
        setError(message);
      } finally {
        setTreeLoading(false);
      }
    }

    void loadProjectTree();
  }, [selectedProjectId]);

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

  async function handleUpload(file: File) {
    const created = await uploadProject(file);
    setProjects((current) => [created, ...current]);
    setSelectedProjectId(created.id);
  }

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

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
              selectedPath={selectedFilePath}
              onSelectFile={(path) => setSelectedFilePath(path)}
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
                  <span>{selectedFilePath ?? "Choose a file from the explorer."}</span>
                </div>
                {sourceLoading ? (
                  <p className="placeholder">Loading source file...</p>
                ) : selectedFilePath ? (
                  <pre className="code-viewer">{sourceContent || "// Empty file"}</pre>
                ) : (
                  <p className="placeholder">Select a file to preview its extracted source.</p>
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
            {selectedFilePath ? (
              <div className="review-summary">
                <p className="placeholder">
                  File context is now wired into the UI. The next backend step is symbol parsing and
                  structured review output for this selected file.
                </p>
                <p className="helper-text">Selected context: {selectedFilePath}</p>
              </div>
            ) : (
              <p className="placeholder">
                Review summary, findings, suggestions, and test cases will be connected after symbol
                parsing is added.
              </p>
            )}
          </section>
        }
      />
    </div>
  );
}
