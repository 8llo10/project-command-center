'use client';

import { useMemo, useState } from 'react';
import { Github, Search, LayoutGrid, Rocket, CheckCircle2, PauseCircle, Lightbulb, Layers3 } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { statusOrder } from '@/lib/projects';
import { statusCopy } from '@/lib/i18n';
import { useLocale } from './LocaleProvider';
import type { Project, ProjectStatus } from '@/types/project';

const statusIcons: Record<ProjectStatus, React.ComponentType<{ size?: number }>> = {
  completed: CheckCircle2,
  version_done: Layers3,
  active: Rocket,
  planned: Lightbulb,
  paused: PauseCircle,
};

export function PublicBoard({ projects }: { projects: Project[] }) {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState('');
  const [githubOnly, setGithubOnly] = useState(false);
  const [mobileStatus, setMobileStatus] = useState<ProjectStatus>('active');

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
    <section className="board-shell">
      <div className="board-toolbar">
        <div className="search-wrap">
          <Search size={18}/>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search}/>
        </div>
        <button className={`filter-chip ${githubOnly ? 'is-active' : ''}`} onClick={() => setGithubOnly((v) => !v)}>
          <Github size={15}/><span>{t.githubOnly}</span>
        </button>
      </div>

      <div className="mobile-status-tabs" role="tablist" aria-label="Project status">
        {statusOrder.map((status) => {
          const Icon = statusIcons[status];
          const meta = statusCopy(locale, status);
          const count = filtered.filter((p) => p.status === status).length;
          return (
            <button
              key={status}
              role="tab"
              aria-selected={mobileStatus === status}
              className={mobileStatus === status ? 'is-active' : ''}
              onClick={() => setMobileStatus(status)}
            >
              <Icon size={15}/><span>{meta.label}</span><b>{count}</b>
            </button>
          );
        })}
      </div>

      <div className="board-viewport">
        <div className="board">
          {statusOrder.map((status) => {
            const items = filtered.filter((p) => p.status === status).sort((a,b) => a.sort_order - b.sort_order);
            const meta = statusCopy(locale, status);
            const Icon = statusIcons[status];
            return (
              <section className={`column ${mobileStatus === status ? 'mobile-active-column' : ''}`} key={status} data-status={status}>
                <div className="column__head">
                  <div className="column-title-wrap"><span className="column-icon"><Icon size={15}/></span><div><h2>{meta.label}</h2><p>{meta.hint}</p></div></div>
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
      </div>

      <nav className="mobile-bottom-nav" aria-label="Quick filters">
        <button className={!githubOnly ? 'is-active' : ''} onClick={() => setGithubOnly(false)}><LayoutGrid size={18}/><span>{locale === 'ar' ? 'الكل' : 'All'}</span></button>
        <button className={mobileStatus === 'active' && !githubOnly ? 'is-active' : ''} onClick={() => { setGithubOnly(false); setMobileStatus('active'); }}><Rocket size={18}/><span>{locale === 'ar' ? 'الجاري' : 'Active'}</span></button>
        <button className={githubOnly ? 'is-active' : ''} onClick={() => setGithubOnly(true)}><Github size={18}/><span>GitHub</span></button>
      </nav>
    </section>
  );
}
