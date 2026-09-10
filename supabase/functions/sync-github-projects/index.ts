import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const GITHUB_USER = '8llo10';
const EXCLUDED_REPOS = new Set(['project-command-center', '8llo10']);

function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  let secret = legacy ?? '';

  if (!secret) {
    const raw = Deno.env.get('SUPABASE_SECRET_KEYS');
    if (raw) secret = JSON.parse(raw).default ?? '';
  }

  if (!url || !secret) throw new Error('Missing Supabase admin configuration');

  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const supabase = getAdminClient();
    const providedToken = req.headers.get('x-sync-token') ?? '';
    const { data: secretRow, error: secretError } = await supabase
      .from('app_secrets')
      .select('value')
      .eq('key', 'github_sync_token')
      .single();

    if (secretError || !secretRow || providedToken !== secretRow.value) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    const githubResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Ghala-Project-Command-Center',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );

    if (!githubResponse.ok) throw new Error(`GitHub API failed: ${githubResponse.status}`);

    const repos = await githubResponse.json();
    const { data: existing, error: existingError } = await supabase
      .from('projects')
      .select('id,github_repo_id,github_url,summary,subtitle,stack');

    if (existingError) throw existingError;

    const byRepoId = new Map(
      (existing ?? []).filter((p: any) => p.github_repo_id).map((p: any) => [String(p.github_repo_id), p]),
    );
    const byUrl = new Map(
      (existing ?? []).filter((p: any) => p.github_url).map((p: any) => [String(p.github_url).toLowerCase(), p]),
    );

    let inserted = 0;
    let updated = 0;

    for (const repo of repos) {
      if (repo.fork || EXCLUDED_REPOS.has(repo.name)) continue;

      const match = byRepoId.get(String(repo.id)) ?? byUrl.get(String(repo.html_url).toLowerCase());
      const topics = Array.isArray(repo.topics) ? repo.topics : [];
      const githubFields = {
        github_repo_id: repo.id,
        github_full_name: repo.full_name,
        github_url: repo.html_url,
        github_description: repo.description,
        github_language: repo.language,
        github_topics: topics,
        github_stars: repo.stargazers_count ?? 0,
        github_open_issues: repo.open_issues_count ?? 0,
        github_pushed_at: repo.pushed_at ?? null,
        github_updated_at: repo.updated_at,
        github_synced_at: new Date().toISOString(),
      };

      if (match) {
        const { error } = await supabase.from('projects').update(githubFields).eq('id', match.id);
        if (error) throw error;
        updated++;
      } else {
        const stack = [repo.language, ...topics].filter(Boolean).slice(0, 8);
        const { error } = await supabase.from('projects').insert({
          id: `github-${repo.id}`,
          name: repo.name,
          subtitle: repo.description ?? 'GitHub Project',
          summary: repo.description ?? 'Imported automatically from GitHub.',
          status: repo.archived ? 'paused' : 'planned',
          progress: repo.archived ? 100 : 0,
          priority: 'medium',
          stack,
          live_url: repo.homepage || null,
          sort_order: 100,
          ...githubFields,
        });
        if (error) throw error;
        inserted++;
      }
    }

    return new Response(JSON.stringify({ ok: true, inserted, updated, checked: repos.length }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
