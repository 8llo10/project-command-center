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
  updated_at: string;
  sort_order: number;
};

export type ProjectPrivateNote = {
  project_id: string;
  note: string;
  updated_at: string;
};
