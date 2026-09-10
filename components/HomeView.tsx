'use client';

import Link from 'next/link';
import { Github, Languages, LockKeyhole, Rocket, Boxes } from 'lucide-react';
import { PublicBoard } from './PublicBoard';
import { useLocale } from './LocaleProvider';
import type { Project } from '@/types/project';

export function HomeView({ projects }: { projects: Project[] }) {
  const { locale, setLocale, t } = useLocale();
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const githubCount = projects.filter((p) => p.github_repo_id || p.github_full_name).length;

  return (
    <main className="shell">
      <header className="hero hero--command">
        <div>
          <p className="eyebrow">{t.brand}</p>
          <h1>{t.title}</h1>
          <p className="hero-copy">{t.hero}</p>
        </div>
        <div className="hero-actions">
          <button className="locale-toggle" onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}>
            <Languages size={16}/>{t.language}
          </button>
          <Link href="/admin" className="owner-link"><LockKeyhole size={16}/>{t.ownerAccess}</Link>
        </div>
      </header>

      <section className="stats-strip" aria-label="Project statistics">
        <div><Boxes size={17}/><span>{t.allProjects}</span><b>{projects.length}</b></div>
        <div><Rocket size={17}/><span>{t.buildingNow}</span><b>{activeCount}</b></div>
        <div><Github size={17}/><span>{t.githubSynced}</span><b>{githubCount}</b></div>
      </section>

      <PublicBoard projects={projects}/>
    </main>
  );
}
