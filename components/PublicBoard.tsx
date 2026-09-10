'use client';

import { useMemo, useState } from 'react';
import { Github, Search } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { statusOrder } from '@/lib/projects';
import { statusCopy } from '@/lib/i18n';
import { useLocale } from './LocaleProvider';
import type { Project } from '@/types/project';

export function PublicBoard({ projects }: { projects: Project[] }) {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState('');
  const [githubOnly, setGithubOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (githubOnly && !(p.github_repo_id || p.github_full_name)) return false;
      if (!q) return true;
      return [p.name, p.subtitle, p.summary, p.github_description ?? '', p.github_language ?? '', ...(p.stack ?? []), ...(p.github_topics ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [projects, query, githubOnly]);

  return (
    <>
      <div className="board-toolbar">
        <div className="search-wrap">
          <Search size={18}/>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search}/>
        </div>
        <button className={`filter-chip ${githubOnly ? 'is-active' : ''}`} onClick={() => setGithubOnly((v) => !v)}>
          <Github size={15}/>{t.githubOnly}
        </button>
      </div>

      <div className="board">
        {statusOrder.map((status) => {
          const items = filtered.filter((p) => p.status === status).sort((a,b) => a.sort_order - b.sort_order);
          const meta = statusCopy(locale, status);
          return (
            <section className="column" key={status}>
              <div className="column__head">
                <div><h2>{meta.label}</h2><p>{meta.hint}</p></div>
                <span>{items.length}</span>
              </div>
              <div className="column__body">
                {items.map((project) => <ProjectCard key={project.id} project={project}/>)}
                {!items.length && <div className="empty">{t.noProjects}</div>}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
