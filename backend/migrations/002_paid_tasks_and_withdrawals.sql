ALTER TABLE tasks
  ADD COLUMN employer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN target_url text NOT NULL DEFAULT '',
  ADD COLUMN budget_amount numeric(12, 2),
  ADD COLUMN max_submissions integer,
  ADD COLUMN review_status text NOT NULL DEFAULT 'approved'
    CHECK (review_status IN ('pending-review', 'approved', 'rejected'));

CREATE INDEX tasks_employer_idx ON tasks (employer_id, created_at DESC);

ALTER TABLE task_submissions
  DROP CONSTRAINT IF EXISTS task_submissions_one_per_user;

DELETE FROM task_submissions a
 USING task_submissions b
 WHERE a.task_id = b.task_id AND a.user_id = b.user_id AND a.id > b.id;

ALTER TABLE task_submissions
  ADD CONSTRAINT task_submissions_one_per_user UNIQUE (task_id, user_id);

CREATE TABLE withdrawal_requests (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL CHECK (amount >= 100),
  currency text NOT NULL DEFAULT 'KES' CHECK (currency = 'KES'),
  mpesa_phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'rejected')),
  admin_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX withdrawal_requests_user_idx ON withdrawal_requests (user_id, created_at DESC);
CREATE INDEX withdrawal_requests_status_idx ON withdrawal_requests (status, created_at ASC);
