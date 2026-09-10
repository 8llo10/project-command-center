import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { PublicBoard } from '@/components/PublicBoard';
import { seedProjects } from '@/lib/projects';
import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/types/project';

export const dynamic = 'force-dynamic';

async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  if (!supabase) return seedProjects;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return seedProjects;
  return (data ?? []) as Project[];
}

export default async function Home() {
  const projects = await getProjects();
  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">GHALA / PROJECT OS</p>
          <h1>Project Command Center</h1>
          <p className="hero-copy">مكان واحد أرتب فيه كل شيء: المنتهي، الجاري، النسخ القابلة للتطوير، المخطط، والمتوقف مؤقتًا.</p>
        </div>
        <Link href="/admin" className="owner-link"><LockKeyhole size={16}/> Owner Access</Link>
      </header>
      <PublicBoard projects={projects}/>
    </main>
  );
}
