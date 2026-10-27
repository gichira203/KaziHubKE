-- KaziHub KE initial schema.
--
-- Every table is owned by the API; the frontend never talks to PostgreSQL
-- directly. Email uniqueness is case-insensitive through a functional index.
-- Job status and application status use the same labels as the frontend
-- contract in `frontend/lib/account-types.ts`.

CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  password_hash text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('job-seeker', 'employer', 'admin')),
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  oauth_provider text,
  oauth_subject text,
  failed_login_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_unique ON users (lower(email));
CREATE UNIQUE INDEX users_oauth_unique
  ON users (oauth_provider, oauth_subject)
  WHERE oauth_provider IS NOT NULL;
CREATE INDEX users_account_type_idx ON users (account_type, status);
CREATE INDEX users_created_at_idx ON users (created_at DESC);

CREATE TABLE job_seeker_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline text NOT NULL DEFAULT '',
  county text NOT NULL DEFAULT '',
  town text NOT NULL DEFAULT '',
  desired_titles text[] NOT NULL DEFAULT '{}',
  employment_types text[] NOT NULL DEFAULT '{}',
  skills jsonb NOT NULL DEFAULT '{}'::jsonb,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  profile_visible boolean NOT NULL DEFAULT true,
  allow_employer_contact boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX job_seeker_profiles_search_idx
  ON job_seeker_profiles (county, profile_visible);

CREATE TABLE employer_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  organization_type text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  company_size text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'Kenya',
  county text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  logo_url text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  verification_status text NOT NULL DEFAULT 'not-started'
    CHECK (verification_status IN (
      'not-started', 'submitted', 'pending-review',
      'action-required', 'verified', 'rejected'
    )),
  verification_note text NOT NULL DEFAULT '',
  verification_submitted_at timestamptz,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX employer_profiles_verification_idx
  ON employer_profiles (verification_status);

CREATE TABLE jobs (
  id uuid PRIMARY KEY,
  employer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employer_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL
    CHECK (category IN ('online', 'government', 'internship', 'attachment', 'private')),
  employment_type text NOT NULL,
  location text NOT NULL,
  remote boolean NOT NULL DEFAULT false,
  salary_range text NOT NULL DEFAULT '',
  deadline date,
  status text NOT NULL DEFAULT 'pending-review'
    CHECK (status IN ('draft', 'pending-review', 'published', 'paused', 'closed', 'rejected')),
  moderation_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX jobs_public_idx ON jobs (status, published_at DESC);
CREATE INDEX jobs_employer_idx ON jobs (employer_id, updated_at DESC);
CREATE INDEX jobs_category_idx ON jobs (category, status);

CREATE TABLE applications (
  id uuid PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under-review', 'shortlisted', 'interview', 'closed')),
  cover_letter text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, seeker_id)
);

CREATE INDEX applications_seeker_idx ON applications (seeker_id, created_at DESC);
CREATE INDEX applications_job_idx ON applications (job_id, created_at DESC);

CREATE TABLE saved_jobs (
  seeker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (seeker_id, job_id)
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  href text NOT NULL DEFAULT '',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_idx ON notifications (user_id, created_at DESC);

CREATE TABLE tasks (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  platform text NOT NULL DEFAULT '',
  category text NOT NULL
    CHECK (category IN ('youtube', 'social-follow', 'engagement', 'survey', 'testing', 'research')),
  action text NOT NULL,
  time_estimate text NOT NULL DEFAULT '',
  reward_amount numeric(12, 2) NOT NULL DEFAULT 0,
  reward_currency text NOT NULL DEFAULT 'KES',
  eligibility text NOT NULL DEFAULT '',
  availability text NOT NULL DEFAULT '',
  availability_state text NOT NULL DEFAULT 'open'
    CHECK (availability_state IN ('open', 'limited', 'closed')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE task_submissions (
  id uuid PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evidence text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reward_status text NOT NULL DEFAULT 'not-paid'
    CHECK (reward_status IN ('not-paid', 'queued', 'paid')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX task_submissions_user_idx ON task_submissions (user_id, created_at DESC);

CREATE TABLE reports (
  id uuid PRIMARY KEY,
  reporter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  target_type text NOT NULL DEFAULT 'job',
  target_id text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE support_tickets (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL DEFAULT '',
  target_id text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_created_idx ON audit_log (created_at DESC);
