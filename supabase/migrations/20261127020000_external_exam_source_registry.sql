-- PRIME-CBT External Examinations: auditable source and ingestion registry.
-- This migration adds isolated External Exams metadata only. It does not alter
-- University Learning tables, authentication, or existing CBT functions.
begin;

create table if not exists public.external_exam_sources (
  id uuid primary key default gen_random_uuid(),
  publisher text not null,
  source_name text not null,
  source_kind text not null check (
    source_kind in (
      'exam_body_syllabus',
      'exam_body_past_question',
      'official_elearning',
      'curriculum_reference',
      'licensed_content',
      'original_content'
    )
  ),
  exam_code text check (
    exam_code is null or exam_code in ('JAMB','WAEC','NECO','GCE','POST_UTME')
  ),
  source_url text not null check (source_url ~ '^https://'),
  edition_label text,
  access_method text not null default 'public_web' check (
    access_method in ('public_web','interactive_portal','paid_purchase','written_permission','licensed_feed','original_authoring')
  ),
  access_status text not null default 'not_verified' check (
    access_status in ('not_verified','publicly_accessible','paid','permission_required','restricted','unavailable')
  ),
  rights_status text not null default 'unknown' check (
    rights_status in ('unknown','personal_study_only','permission_required','permission_granted','licensed','public_domain','original')
  ),
  rights_notes text,
  last_verified_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_url, edition_label)
);

create table if not exists public.external_exam_import_batches (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.external_exam_sources(id) on delete restrict,
  exam_code text not null check (exam_code in ('JAMB','WAEC','NECO','GCE','POST_UTME')),
  import_kind text not null check (import_kind in ('syllabus_taxonomy','past_questions','learning_resource','curriculum_reference')),
  status text not null default 'draft' check (
    status in ('draft','queued','processing','needs_review','approved','published','rejected','failed')
  ),
  source_document_path text,
  source_document_url text,
  document_sha256 text check (document_sha256 is null or document_sha256 ~ '^[a-f0-9]{64}$'),
  source_edition text,
  source_year integer check (source_year is null or source_year between 1900 and 2200),
  source_session text,
  extracted_item_count integer not null default 0 check (extracted_item_count >= 0),
  accepted_item_count integer not null default 0 check (accepted_item_count >= 0),
  rejected_item_count integer not null default 0 check (rejected_item_count >= 0),
  processing_notes text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  requested_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (accepted_item_count + rejected_item_count <= extracted_item_count)
);

-- Store only syllabus taxonomy labels and source locators here. Full copyrighted
-- syllabus prose is deliberately not copied into this table.
create table if not exists public.external_exam_syllabus_entries (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.external_exam_sources(id) on delete restrict,
  import_batch_id uuid references public.external_exam_import_batches(id) on delete set null,
  exam_code text not null check (exam_code in ('JAMB','WAEC','NECO','GCE','POST_UTME')),
  subject_id uuid references public.external_exam_subjects(id) on delete set null,
  parent_entry_id uuid references public.external_exam_syllabus_entries(id) on delete set null,
  linked_topic_id uuid references public.external_exam_topics(id) on delete set null,
  entry_kind text not null check (entry_kind in ('subject','section','topic','subtopic','objective')),
  title text not null check (char_length(title) between 1 and 300),
  source_locator text,
  edition_label text,
  alignment_status text not null default 'unreviewed' check (
    alignment_status in ('unreviewed','aligned','partially_aligned','not_aligned','needs_clarification')
  ),
  review_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (source_id, exam_code, subject_id, parent_entry_id, entry_kind, title)
);

create table if not exists public.external_exam_question_provenance (
  question_id uuid primary key references public.external_exam_questions(id) on delete cascade,
  source_id uuid references public.external_exam_sources(id) on delete restrict,
  import_batch_id uuid references public.external_exam_import_batches(id) on delete set null,
  provenance_kind text not null check (provenance_kind in ('official_past_question','licensed_past_question','original_practice')),
  source_locator text,
  source_year integer check (source_year is null or source_year between 1900 and 2200),
  source_session text,
  source_paper text,
  source_checksum text check (source_checksum is null or source_checksum ~ '^[a-f0-9]{64}$'),
  rights_status text not null default 'unknown' check (
    rights_status in ('unknown','permission_required','permission_granted','licensed','public_domain','original')
  ),
  rights_evidence text,
  verification_status text not null default 'pending' check (
    verification_status in ('pending','verified','rejected')
  ),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (provenance_kind = 'original_practice' and rights_status = 'original')
    or provenance_kind <> 'original_practice'
  ),
  check (
    provenance_kind = 'original_practice'
    or source_id is not null
  )
);

create index if not exists external_exam_sources_lookup_idx
  on public.external_exam_sources(exam_code, source_kind, is_active);
create index if not exists external_exam_import_batches_status_idx
  on public.external_exam_import_batches(status, created_at desc);
create index if not exists external_exam_syllabus_entries_subject_idx
  on public.external_exam_syllabus_entries(exam_code, subject_id, sort_order);
create index if not exists external_exam_question_provenance_source_idx
  on public.external_exam_question_provenance(source_id, source_year, verification_status);

alter table public.external_exam_sources enable row level security;
alter table public.external_exam_import_batches enable row level security;
alter table public.external_exam_syllabus_entries enable row level security;
alter table public.external_exam_question_provenance enable row level security;

-- No anon/authenticated policies or grants: ingestion and moderation must run
-- through trusted server-side code. Student-facing access remains through the
-- existing published subjects/topics/questions policies and safe read APIs.
revoke all on public.external_exam_sources from public, anon, authenticated;
revoke all on public.external_exam_import_batches from public, anon, authenticated;
revoke all on public.external_exam_syllabus_entries from public, anon, authenticated;
revoke all on public.external_exam_question_provenance from public, anon, authenticated;

grant all on public.external_exam_sources to service_role;
grant all on public.external_exam_import_batches to service_role;
grant all on public.external_exam_syllabus_entries to service_role;
grant all on public.external_exam_question_provenance to service_role;

commit;
