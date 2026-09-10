# Repository Structure

```text
project-command-center/
├─ app/
│  ├─ admin/page.tsx          # owner-only project editor
│  ├─ auth/callback/route.ts  # Supabase magic-link callback
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx                # public board
├─ components/
│  ├─ ProjectCard.tsx
│  └─ PublicBoard.tsx
├─ lib/
│  ├─ projects.ts             # statuses + fallback seed data
│  └─ supabase/
│     ├─ client.ts
│     └─ server.ts
├─ types/project.ts
├─ supabase/migrations/
│  └─ 001_initial_schema.sql
├─ public/
├─ .env.example
├─ .gitignore
├─ next.config.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```
