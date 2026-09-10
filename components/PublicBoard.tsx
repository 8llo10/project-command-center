'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { statusMeta, statusOrder } from '@/lib/projects';
import type { Project } from '@/types/project';

export function PublicBoard({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => [p.name, p.subtitle, p.summary, ...p.stack].join(' ').toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <>
      <div className="search-wrap">
        <Search size={18}/>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحثي باسم مشروع أو تقنية..." aria-label="بحث المشاريع" />
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
