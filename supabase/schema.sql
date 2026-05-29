-- Pinboard schema
-- Run this in the Supabase SQL editor before starting the app.

-- NOTE: Create a private Storage bucket named "pinboard-files" via the Supabase dashboard
-- (Storage → New bucket → name: pinboard-files, Public: OFF) before running the app.

create table if not exists cards (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('text','file')),
  content      text,
  file_name    text,
  file_path    text,
  file_size    bigint,
  mime_type    text,
  priority     text not null check (priority in ('very_low','low','medium','high')),
  priority_rank smallint not null,
  status       text not null default 'todo' check (status in ('todo','done')),
  created_at   timestamptz not null default now(),
  due_at       timestamptz not null,
  completed_at timestamptz
);

-- To Do: highest priority first, then soonest deadline
create index if not exists idx_cards_todo
  on cards (status, priority_rank desc, due_at asc)
  where status = 'todo';

-- Done: most recently completed first
create index if not exists idx_cards_done
  on cards (status, completed_at desc)
  where status = 'done';
