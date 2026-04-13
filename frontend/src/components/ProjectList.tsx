import type { Project } from "../types/project";

type ProjectListProps = {
  projects: Project[];
  selectedId: string | null;
  onSelect: (project: Project) => void;
};

export function ProjectList({ projects, selectedId, onSelect }: ProjectListProps) {
  return (
    <section className="panel">
      <h2 className="panel-title">Projects</h2>
      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              className={project.id === selectedId ? "project-item selected" : "project-item"}
              onClick={() => onSelect(project)}
            >
              <strong>{project.name}</strong>
              <span>{project.file_count} files</span>
            </button>
          </li>
        ))}
      </ul>
      {projects.length === 0 ? <p className="helper-text">No projects uploaded yet.</p> : null}
    </section>
  );
}
