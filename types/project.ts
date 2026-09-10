export type ProjectStatus =
  | 'completed'
  | 'version_done'
  | 'active'
  | 'planned'
  | 'paused';

export type Project = {
  id: string;
  name: string;
  subtitle: string;
  summary: string;
  status: ProjectStatus;
  progress: number;
  priority: 'high' | 'medium' | 'low';
  stack: string[];
  live_url: string | null;
  github_url: string | null;
  github_repo_id?: number | null;
  github_full_name?: string | null;
  github_description?: string | null;
  github_language?: string | null;
  github_topics?: string[];
  github_stars?: number;
  github_updated_at?: string | null;
  github_synced_at?: string | null;
  updated_at: string;
  sort_order: number;
};

export type ProjectPrivateNote = {
  project_id: string;
  note: string;
  updated_at: string;
};
