create table if not exists app_user (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  avatar text not null,
  role text not null check (role in ('member', 'moderator')),
  company text,
  bio text not null,
  created_at timestamptz not null default now()
);

create table if not exists appreciation_post (
  id bigserial primary key,
  author_id text not null references app_user(id),
  recipient text not null,
  recipient_user_id text references app_user(id),
  message text not null,
  category text not null,
  location text,
  visibility text not null check (visibility in ('public', 'anonymous', 'private')),
  gift_amount integer not null default 0,
  gift_provider text not null default 'None',
  company text,
  created_at timestamptz not null default now()
);

create table if not exists appreciation_reaction (
  id bigserial primary key,
  post_id bigint not null references appreciation_post(id) on delete cascade,
  user_id text not null references app_user(id) on delete cascade,
  type text not null check (type in ('support', 'inspiring')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists appreciation_comment (
  id bigserial primary key,
  post_id bigint not null references appreciation_post(id) on delete cascade,
  author_id text not null references app_user(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists moderation_report (
  id bigserial primary key,
  post_id bigint not null references appreciation_post(id) on delete cascade,
  reporter_id text not null references app_user(id) on delete cascade,
  reason text not null,
  status text not null check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists notification (
  id bigserial primary key,
  user_id text not null references app_user(id) on delete cascade,
  actor_id text references app_user(id) on delete set null,
  type text not null,
  message text not null,
  link text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists session_token (
  id uuid primary key,
  user_id text not null references app_user(id) on delete cascade,
  csrf_token uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists recipient_claim_request (
  id bigserial primary key,
  post_id bigint not null unique references appreciation_post(id) on delete cascade,
  requester_user_id text not null references app_user(id) on delete cascade,
  status text not null check (status in ('approved', 'rejected', 'pending')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists claim_invite_token (
  token uuid primary key,
  post_id bigint not null unique references appreciation_post(id) on delete cascade,
  created_by_user_id text not null references app_user(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists audit_log (
  id bigserial primary key,
  actor_user_id text references app_user(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_appreciation_post_created_at on appreciation_post (created_at desc);
create index if not exists idx_reaction_post_id on appreciation_reaction (post_id);
create index if not exists idx_comment_post_id on appreciation_comment (post_id);
create index if not exists idx_report_post_id on moderation_report (post_id);
create index if not exists idx_notification_user_id on notification (user_id, created_at desc);
create index if not exists idx_session_token_expires_at on session_token (expires_at);
create index if not exists idx_audit_log_created_at on audit_log (created_at desc);
create index if not exists idx_claim_request_requester on recipient_claim_request (requester_user_id, created_at desc);
create index if not exists idx_claim_invite_expires_at on claim_invite_token (expires_at);
