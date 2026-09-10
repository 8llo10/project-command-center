import { ExternalLink, Github } from 'lucide-react';
import type { Project } from '@/types/project';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <div className="project-card__head">
        <div>
          <h3>{project.name}</h3>
          <p className="subtitle">{project.subtitle}</p>
        </div>
        <span className={`priority priority--${project.priority}`}>{project.priority}</span>
      </div>
      <p className="summary">{project.summary}</p>
      <div className="stack">
        {project.stack.map((item) => <span key={item}>{item}</span>)}
      </div>
      <div className="progress-row">
        <div className="progress-track"><div style={{ width: `${project.progress}%` }} /></div>
        <b>{project.progress}%</b>
      </div>
      {(project.live_url || project.github_url) && (
        <div className="links">
          {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Live</a>}
          {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer"><Github size={15}/> GitHub</a>}
        </div>
      )}
    </article>
  );
}
