create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  part text not null,
  mode text,
  topic text,
  question text not null,
  raw_transcript text,
  edited_transcript text,
  text_feedback jsonb,
  audio_feedback jsonb,
  primary_estimated_band numeric,
  fluency_and_coherence numeric,
  lexical_resource numeric,
  grammatical_range_and_accuracy numeric,
  pronunciation numeric,
  evaluation_source text not null default 'text_only' check (evaluation_source in ('text_only', 'audio_first', 'both')),
  created_at timestamptz not null default now()
);

alter table public.practice_attempts enable row level security;

create policy "Users can select their own practice attempts" on public.practice_attempts for select using (auth.uid() = user_id);
create policy "Users can insert their own practice attempts" on public.practice_attempts for insert with check (auth.uid() = user_id);
create policy "Users can update their own practice attempts" on public.practice_attempts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own practice attempts" on public.practice_attempts for delete using (auth.uid() = user_id);

create index if not exists practice_attempts_user_id_idx on public.practice_attempts (user_id);
create index if not exists practice_attempts_created_at_idx on public.practice_attempts (created_at desc);
create index if not exists practice_attempts_part_idx on public.practice_attempts (part);
