-- PRIME COMMAND V2: task history, approvals and audit trail.
-- Run once in Supabase SQL Editor before deploying the V2 admin code.

create extension if not exists pgcrypto;

create table if not exists public.prime_command_tasks (
  id uuid primary key default gen_random_uuid(),
  task_type text not null default 'command',
  title text not null,
  instruction text,
  status text not null default 'completed'
    check (status in ('completed','awaiting_approval','running','failed','cancelled')),
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.prime_command_approvals (
  id uuid primary key default gen_random_uuid(),
  action_type text not null
    check (action_type in ('queue_generation','create_question','update_question')),
  title text not null,
  description text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','completed','failed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  executed_at timestamptz,
  result jsonb,
  error text
);

create table if not exists public.prime_command_audit (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid references public.prime_command_approvals(id) on delete set null,
  action_type text not null,
  title text not null,
  outcome text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists prime_command_tasks_created_idx
  on public.prime_command_tasks (created_at desc);
create index if not exists prime_command_approvals_status_created_idx
  on public.prime_command_approvals (status, created_at desc);
create index if not exists prime_command_audit_created_idx
  on public.prime_command_audit (created_at desc);

alter table public.prime_command_tasks enable row level security;
alter table public.prime_command_approvals enable row level security;
alter table public.prime_command_audit enable row level security;

revoke all on public.prime_command_tasks from anon, authenticated;
revoke all on public.prime_command_approvals from anon, authenticated;
revoke all on public.prime_command_audit from anon, authenticated;
grant all on public.prime_command_tasks to service_role;
grant all on public.prime_command_approvals to service_role;
grant all on public.prime_command_audit to service_role;
