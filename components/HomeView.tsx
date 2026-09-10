'use client';

import Link from 'next/link';
import { Github, Languages, LockKeyhole, Rocket, Boxes, Sparkles, Command, Activity } from 'lucide-react';
import { PublicBoard } from './PublicBoard';
import { useLocale } from './LocaleProvider';
import type { Project } from '@/types/project';

export function HomeView({ projects }: { projects: Project[] }) {
  const { locale, setLocale, t } = useLocale();
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const githubCount = projects.filter((p) => p.github_repo_id || p.github_full_name).length;
  const shippedCount = projects.filter((p) => p.status === 'completed' || p.status === 'version_done').length;

  return (
    <main className="shell home-shell">
      <aside className="desktop-rail" aria-label="Project OS navigation">
        <div className="rail-mark"><Command size={19}/></div>
        <div className="rail-line"/>
        <div className="rail-stat"><span>{projects.length}</span><small>{locale === 'ar' ? 'الكل' : 'ALL'}</small></div>
        <div className="rail-stat"><span>{activeCount}</span><small>{locale === 'ar' ? 'نشط' : 'LIVE'}</small></div>
        <div className="rail-stat"><span>{shippedCount}</span><small>{locale === 'ar' ? 'منجز' : 'DONE'}</small></div>
        <div className="rail-spacer"/>
        <div className="rail-live"><i/><span>SYNC</span></div>
      </aside>

      <section className="command-surface">
        <header className="hero hero--command">
          <div className="hero-copy-wrap">
            <div className="hero-kicker"><Sparkles size={13}/><span>{t.brand}</span></div>
            <h1>{t.title}</h1>
            <p className="hero-copy">{t.hero}</p>
          </div>
          <div className="hero-actions">
            <button className="locale-toggle" onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}>
              <Languages size={16}/>{t.language}
            </button>
            <Link href="/admin" className="owner-link"><LockKeyhole size={16}/><span>{t.ownerAccess}</span></Link>
          </div>
        </header>

        <section className="stats-strip" aria-label="Project statistics">
          <div><span className="stat-icon"><Boxes size={16}/></span><span>{t.allProjects}</span><b>{projects.length}</b></div>
          <div><span className="stat-icon"><Rocket size={16}/></span><span>{t.buildingNow}</span><b>{activeCount}</b></div>
          <div><span className="stat-icon"><Github size={16}/></span><span>{t.githubSynced}</span><b>{githubCount}</b></div>
          <div className="desktop-only-stat"><span className="stat-icon"><Activity size={16}/></span><span>{locale === 'ar' ? 'تم شحنه' : 'Shipped'}</span><b>{shippedCount}</b></div>
        </section>

        <PublicBoard projects={projects}/>
      </section>
    </main>
  );
}
