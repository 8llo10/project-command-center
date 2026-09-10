import { ExternalLink, Github, GitBranch, Star } from 'lucide-react';
import type { Project } from '@/types/project';

export function ProjectCard({ project }: { project: Project }) {
  const synced = Boolean(project.github_repo_id || project.github_full_name);
  const chips = project.stack.length
    ? project.stack
    : [project.github_language, ...(project.github_topics ?? [])].filter(Boolean) as string[];

  return (
    <article className="project-card">
      <div className="project-card__head">
        <div>
          <div className="title-row">
            <h3>{project.name}</h3>
            {synced && <span className="github-sync-badge"><GitBranch size={11}/> GitHub Sync</span>}
          </div>
          <p className="subtitle">{project.subtitle}</p>
        </div>
        <span className={`priority priority--${project.priority}`}>{project.priority}</span>
      </div>

      <p className="summary">{project.summary || project.github_description}</p>

      {synced && (
        <div className="github-meta">
          {project.github_language && <span>{project.github_language}</span>}
          {(project.github_stars ?? 0) > 0 && <span><Star size={11}/> {project.github_stars}</span>}
          {project.github_updated_at && <span>GitHub updated {new Date(project.github_updated_at).toLocaleDateString('en-GB')}</span>}
        </div>
      )}

      <div className="stack">
        {chips.map((item) => <span key={item}>{item}</span>)}
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
