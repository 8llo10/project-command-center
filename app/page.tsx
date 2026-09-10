import { HomeView } from '@/components/HomeView';
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
  return <HomeView projects={projects}/>;
}
