'use client';

import { useMemo, useState } from 'react';
import { Github, Search } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { statusMeta, statusOrder } from '@/lib/projects';
import type { Project } from '@/types/project';

export function PublicBoard({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('');
  const [githubOnly, setGithubOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const synced = Boolean(p.github_repo_id || p.github_full_name);
      if (githubOnly && !synced) return false;
      if (!q) return true;
      return [
        p.name,
        p.subtitle,
        p.summary,
        p.github_description,
        p.github_language,
        ...(p.stack ?? []),
        ...(p.github_topics ?? []),
      ].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [projects, query, githubOnly]);

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const syncedCount = projects.filter((p) => p.github_repo_id || p.github_full_name).length;

  return (
    <>
      <div className="metrics-row">
        <div className="metric"><span>ALL PROJECTS</span><b>{projects.length}</b></div>
        <div className="metric"><span>BUILDING NOW</span><b>{activeCount}</b></div>
        <div className="metric"><span>GITHUB SYNCED</span><b>{syncedCount}</b></div>
      </div>

      <div className="board-toolbar">
        <div className="search-wrap">
          <Search size={18}/>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحثي باسم مشروع أو تقنية..." aria-label="بحث المشاريع" />
        </div>
        <button className={`github-filter ${githubOnly ? 'is-active' : ''}`} onClick={() => setGithubOnly((v) => !v)}>
          <Github size={16}/> GitHub only
        </button>
      </div>

      <div className="board">
        {statusOrder.map((status) => {
          const items = filtered.filter((p) => p.status === status).sort((a,b) => a.sort_order - b.sort_order);
          return (
            <section className="column" key={status}>
              <div className="column__head">
                <div><h2>{statusMeta[status].label}</h2><p>{statusMeta[status].hint}</p></div>
                <span>{items.length}</span>
              </div>
              <div className="column__body">
                {items.map((project) => <ProjectCard key={project.id} project={project}/>)}
                {!items.length && <div className="empty">لا توجد مشاريع هنا حاليًا</div>}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
