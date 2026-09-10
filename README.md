# Project Command Center

A personal project lifecycle dashboard for tracking completed, evolving, active, planned, and paused projects.

## Core idea

- Public visitors can browse project lists and project status.
- Only the owner can authenticate into `/admin` and manage projects.
- Private notes are stored separately from public project data.
- Supabase provides database, authentication, and Row Level Security.
- Vercel is the intended deployment target.

## Stack

- Next.js 15.5.24
- React 19
- TypeScript
- Supabase Auth + PostgreSQL + RLS
- Lucide React

## Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor after replacing the owner email placeholder.
3. Copy `.env.example` to `.env.local` and add the public Supabase URL and anon/publishable key.
4. Install dependencies with `npm install`.
5. Run locally with `npm run dev`.
6. Add the same environment variables to Vercel before production deployment.

## Security

Public project information and private owner notes are stored separately. The private notes table is protected with owner-only RLS policies and is never exposed by the public project query.
