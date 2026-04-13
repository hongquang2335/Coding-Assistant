import type { ProjectTreeNode } from "../types/project";

type ProjectExplorerProps = {
  root: ProjectTreeNode | null;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
};

type TreeNodeProps = {
  node: ProjectTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
};

function TreeNode({ node, depth, selectedPath, onSelectFile }: TreeNodeProps) {
  const indent = { paddingLeft: `${depth * 14 + 10}px` };

  if (node.type === "directory") {
    return (
      <div className="tree-group">
        <div className="tree-node tree-node-directory" style={indent}>
          <span className="tree-node-label">{node.name}</span>
        </div>
        {node.children.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    );
  }

  const isSelected = selectedPath === node.path;

  return (
    <button
      type="button"
      className={`tree-node tree-node-file${isSelected ? " selected" : ""}`}
      style={indent}
      onClick={() => onSelectFile(node.path)}
    >
      <span className="tree-node-label">{node.name}</span>
    </button>
  );
}

export function ProjectExplorer({ root, selectedPath, onSelectFile }: ProjectExplorerProps) {
  if (!root) {
    return <p className="placeholder">Select a project to load its extracted source tree.</p>;
  }

  return (
    <section className="panel panel-fill">
      <h2 className="panel-title">Project Explorer</h2>
      <div className="tree-scroll">
        <TreeNode
          node={root}
          depth={0}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      </div>
    </section>
  );
}
