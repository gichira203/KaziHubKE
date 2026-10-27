const express = require("express");
const { randomUUID } = require("node:crypto");
const { query } = require("./db");
const {
  audit,
  dateOnly,
  iso,
  requireAuth,
  requireRole,
  route,
  sendError,
} = require("./lib");
const { createNotification } = require("./notifications");

/**
 * Admin API. Every route requires an authenticated account with role=admin.
 * All mutations are written to audit_log, and decisions that affect a user are
 * delivered as notifications.
 */

const admin = express.Router();
admin.use(requireAuth, requireRole("admin"));

admin.get("/withdrawals", route(async (_req, res) => {
  const { rows } = await query(
    `SELECT w.id,w.user_id,w.amount,w.currency,w.mpesa_phone,w.status,w.admin_note,w.created_at,
            u.first_name,u.last_name,u.email
       FROM withdrawal_requests w JOIN users u ON u.id=w.user_id
      ORDER BY CASE WHEN w.status IN ('pending','processing') THEN 0 ELSE 1 END,w.created_at`);
  return res.json({ items: rows.map((row) => ({ ...row, amount: Number(row.amount), userName: `${row.first_name} ${row.last_name}`.trim() })) });
}));

admin.patch("/withdrawals/:id", route(async (req, res) => {
  const { status, note = "" } = req.body || {};
  if (!["processing", "paid", "rejected"].includes(status) || typeof note !== "string") {
    return sendError(res, 400, "VALIDATION_ERROR", "Choose processing, paid or rejected and provide a text note.");
  }
  const { rows } = await query(
    `UPDATE withdrawal_requests SET status=$2,admin_note=$3,updated_at=now()
      WHERE id=$1 RETURNING id,user_id,amount,currency,status`,
    [req.params.id, status, note.trim().slice(0, 500)]);
  if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Withdrawal request not found.");
  await createNotification(rows[0].user_id, {
    kind: "withdrawal",
    title: status === "paid" ? "Withdrawal marked paid" : status === "rejected" ? "Withdrawal request declined" : "Withdrawal is processing",
    body: note.trim() || `Your ${rows[0].currency} ${Number(rows[0].amount).toLocaleString("en-KE")} withdrawal request is ${status}.`,
    href: "/dashboard/earnings",
  });
  await audit(req.user.id, `withdrawal.${status}`, "withdrawal", rows[0].id, { note: note.trim().slice(0, 500) });
  return res.json({ withdrawal: rows[0] });
}));

const titleCase = (value) =>
  String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const stamp = (value) => {
  const text = iso(value);
  if (!text) return "—";
  return new Date(text).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
};

const day = (value) => {
  const text = iso(value);
  if (!text) return "—";
  return new Date(text).toLocaleDateString("en-KE", { dateStyle: "medium" });
};

async function count(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows[0]?.total ?? 0;
}

/* ------------------------------- Overview ------------------------------- */

admin.get(
  "/overview",
  route(async (_req, res) => {
    const [
      totalUsers,
      jobSeekers,
      employers,
      incompleteProfiles,
      awaitingVerification,
      publishedJobs,
      pendingJobs,
      totalApplications,
      activeTasks,
      submissionsToReview,
      openReports,
      openTickets,
      registrations,
      jobCategories,
      verificationCounts,
      recentUsers,
      recentJobs,
      recentReports,
    ] = await Promise.all([
      count("SELECT count(*)::int AS total FROM users WHERE status <> 'deleted'"),
      count("SELECT count(*)::int AS total FROM users WHERE account_type = 'job-seeker' AND status <> 'deleted'"),
      count("SELECT count(*)::int AS total FROM users WHERE account_type = 'employer' AND status <> 'deleted'"),
      count(
        `SELECT count(*)::int AS total FROM job_seeker_profiles
          WHERE headline = '' OR data = '{}'::jsonb`,
      ),
      count("SELECT count(*)::int AS total FROM employer_profiles WHERE verification_status IN ('submitted','pending-review')"),
      count("SELECT count(*)::int AS total FROM jobs WHERE status = 'published'"),
      count("SELECT count(*)::int AS total FROM jobs WHERE status = 'pending-review'"),
      count("SELECT count(*)::int AS total FROM applications"),
      count("SELECT count(*)::int AS total FROM tasks WHERE status = 'active'"),
      count("SELECT count(*)::int AS total FROM task_submissions WHERE status = 'pending'"),
      count("SELECT count(*)::int AS total FROM reports WHERE status IN ('open','investigating')"),
      count("SELECT count(*)::int AS total FROM support_tickets WHERE status IN ('open','in-progress')"),
      query(
        `SELECT to_char(d.day, 'YYYY-MM-DD') AS date, count(u.id)::int AS total
           FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, INTERVAL '1 day') AS d(day)
           LEFT JOIN users u ON u.created_at::date = d.day
          GROUP BY d.day ORDER BY d.day`,
      ),
      query(
        `SELECT category, count(*)::int AS total FROM jobs
          WHERE status = 'published' GROUP BY category ORDER BY total DESC`,
      ),
      query(
        `SELECT verification_status AS status, count(*)::int AS total
           FROM employer_profiles GROUP BY verification_status`,
      ),
      query(
        `SELECT id, first_name, last_name, email, account_type, status, created_at
           FROM users ORDER BY created_at DESC LIMIT 5`,
      ),
      query(
        `SELECT id, title, employer_name, status, created_at
           FROM jobs ORDER BY created_at DESC LIMIT 5`,
      ),
      query(
        `SELECT id, subject, status, created_at
           FROM reports ORDER BY created_at DESC LIMIT 5`,
      ),
    ]);

    return res.json({
      stats: {
        totalUsers,
        jobSeekers,
        employers,
        incompleteProfiles,
        employersAwaitingVerification: awaitingVerification,
        publishedJobs,
        jobsPendingApproval: pendingJobs,
        totalApplications,
        activeTasks,
        taskSubmissionsToReview: submissionsToReview,
        openReports,
        openSupportTickets: openTickets,
      },
      registrations: registrations.rows,
      jobsByCategory: jobCategories.rows,
      verificationCounts: verificationCounts.rows,
      recentUsers: recentUsers.rows.map((row) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`.trim(),
        email: row.email,
        accountType: row.account_type,
        status: row.status,
        createdAt: iso(row.created_at),
      })),
      recentJobs: recentJobs.rows.map((row) => ({
        id: row.id,
        title: row.title,
        employer: row.employer_name,
        status: row.status,
        createdAt: iso(row.created_at),
      })),
      recentReports: recentReports.rows.map((row) => ({
        id: row.id,
        subject: row.subject,
        status: row.status,
        createdAt: iso(row.created_at),
      })),
    });
  }),
);

/* ------------------------------- Sections ------------------------------- */

const SECTION_LABELS = {
  users: "Users",
  "job-seekers": "Job Seekers",
  employers: "Employers",
  "employer-verification": "Employer Verification",
  "job-listings": "Job Listings",
  "government-jobs": "Government Jobs",
  internships: "Internships & Attachments",
  "online-tasks": "Online Tasks",
  "task-submissions": "Task Submissions",
  applications: "Applications",
  reports: "Reports & Moderation",
  notifications: "Notifications",
  "support-tickets": "Support Tickets",
  analytics: "Analytics & Reports",
  "admin-users": "Admin Users & Permissions",
  "audit-logs": "Audit Logs",
  settings: "Settings",
};

async function sectionPayload(slug) {
  switch (slug) {
    case "users": {
      const { rows } = await query(
        `SELECT id, first_name, last_name, email, account_type, status, created_at
           FROM users WHERE status <> 'deleted' ORDER BY created_at DESC`,
      );
      return {
        columns: ["Name", "Email", "Type", "Status", "Joined"],
        rows: rows.map((row) => ({
          _id: row.id,
          Name: `${row.first_name} ${row.last_name}`.trim(),
          Email: row.email,
          Type: row.account_type === "employer" ? "Employer" : row.account_type === "admin" ? "Admin" : "Job seeker",
          Status: titleCase(row.status),
          Joined: day(row.created_at),
        })),
      };
    }
    case "job-seekers": {
      const { rows } = await query(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.status, u.created_at,
                p.headline, p.county
           FROM users u LEFT JOIN job_seeker_profiles p ON p.user_id = u.id
          WHERE u.account_type = 'job-seeker' AND u.status <> 'deleted'
          ORDER BY u.created_at DESC`,
      );
      return {
        columns: ["Name", "Email", "Headline", "County", "Status", "Joined"],
        rows: rows.map((row) => ({
          _id: row.id,
          Name: `${row.first_name} ${row.last_name}`.trim(),
          Email: row.email,
          Headline: row.headline || "—",
          County: row.county || "—",
          Status: titleCase(row.status),
          Joined: day(row.created_at),
        })),
      };
    }
    case "employers": {
      const { rows } = await query(
        `SELECT u.id, u.status, ep.company_name, ep.contact_email, ep.industry, ep.verification_status
           FROM users u LEFT JOIN employer_profiles ep ON ep.user_id = u.id
          WHERE u.account_type = 'employer' AND u.status <> 'deleted'
          ORDER BY u.created_at DESC`,
      );
      return {
        columns: ["Company", "Contact", "Industry", "Verification", "Status"],
        rows: rows.map((row) => ({
          _id: row.id,
          Company: row.company_name || "—",
          Contact: row.contact_email || "—",
          Industry: row.industry || "—",
          Verification: titleCase(row.verification_status || "not-started"),
          Status: titleCase(row.status),
        })),
      };
    }
    case "employer-verification": {
      const { rows } = await query(
        `SELECT u.id, ep.company_name, ep.contact_email, ep.verification_status,
                ep.verification_submitted_at
           FROM employer_profiles ep JOIN users u ON u.id = ep.user_id
          WHERE ep.verification_status IN ('submitted','pending-review','action-required')
          ORDER BY ep.verification_submitted_at DESC NULLS LAST`,
      );
      return {
        columns: ["Company", "Contact", "Submitted", "Status"],
        rows: rows.map((row) => ({
          _id: row.id,
          Company: row.company_name || "—",
          Contact: row.contact_email || "—",
          Submitted: stamp(row.verification_submitted_at),
          Status: titleCase(row.verification_status),
        })),
      };
    }
    case "job-listings":
    case "government-jobs":
    case "internships": {
      const params = [];
      let filter = "";
      if (slug === "government-jobs") {
        params.push(["government"]);
        filter = "AND category = ANY($1::text[])";
      } else if (slug === "internships") {
        params.push(["internship", "attachment"]);
        filter = "AND category = ANY($1::text[])";
      }
      const { rows } = await query(
        `SELECT id, title, employer_name, category, status, updated_at
           FROM jobs WHERE true ${filter}
          ORDER BY updated_at DESC`,
        params,
      );
      return {
        columns: ["Title", "Employer", "Category", "Updated", "Status"],
        rows: rows.map((row) => ({
          _id: row.id,
          Title: row.title,
          Employer: row.employer_name,
          Category: titleCase(row.category),
          Updated: day(row.updated_at),
          Status: titleCase(row.status),
        })),
      };
    }
    case "online-tasks": {
      const { rows } = await query(
        `SELECT id, title, reward_amount, reward_currency, availability, status
           FROM tasks ORDER BY created_at DESC`,
      );
      return {
        columns: ["Title", "Reward", "Availability", "Status"],
        rows: rows.map((row) => ({
          _id: row.id,
          Title: row.title,
          Reward: `${row.reward_currency} ${Number(row.reward_amount).toLocaleString("en-KE")}`,
          Availability: row.availability || "—",
          Status: titleCase(row.status),
        })),
      };
    }
    case "task-submissions": {
      const { rows } = await query(
        `SELECT s.id, s.status, s.reward_status, s.created_at, t.title,
                u.first_name, u.last_name
           FROM task_submissions s
           JOIN tasks t ON t.id = s.task_id
           JOIN users u ON u.id = s.user_id
          ORDER BY s.created_at DESC`,
      );
      return {
        columns: ["Task", "User", "Submitted", "Status", "Reward"],
        rows: rows.map((row) => ({
          _id: row.id,
          Task: row.title,
          User: `${row.first_name} ${row.last_name}`.trim(),
          Submitted: stamp(row.created_at),
          Status: titleCase(row.status),
          Reward: titleCase(row.reward_status),
        })),
      };
    }
    case "applications": {
      const { rows } = await query(
        `SELECT a.id, a.status, a.created_at, j.title, j.employer_name,
                u.first_name, u.last_name
           FROM applications a
           JOIN jobs j ON j.id = a.job_id
           JOIN users u ON u.id = a.seeker_id
          ORDER BY a.created_at DESC`,
      );
      return {
        columns: ["Candidate", "Job", "Employer", "Applied", "Status"],
        rows: rows.map((row) => ({
          _id: row.id,
          Candidate: `${row.first_name} ${row.last_name}`.trim(),
          Job: row.title,
          Employer: row.employer_name,
          Applied: day(row.created_at),
          Status: titleCase(row.status),
        })),
      };
    }
    case "reports": {
      const { rows } = await query(
        `SELECT r.id, r.subject, r.target_type, r.status, r.created_at,
                u.first_name, u.last_name
           FROM reports r LEFT JOIN users u ON u.id = r.reporter_id
          ORDER BY r.created_at DESC`,
      );
      return {
        columns: ["Subject", "Target", "Reporter", "Received", "Status"],
        rows: rows.map((row) => ({
          _id: row.id,
          Subject: row.subject,
          Target: titleCase(row.target_type),
          Reporter: row.first_name ? `${row.first_name} ${row.last_name}`.trim() : "—",
          Received: day(row.created_at),
          Status: titleCase(row.status),
        })),
      };
    }
    case "notifications": {
      const { rows } = await query(
        `SELECT n.id, n.kind, n.title, n.read_at, n.created_at,
                u.first_name, u.last_name
           FROM notifications n JOIN users u ON u.id = n.user_id
          ORDER BY n.created_at DESC LIMIT 200`,
      );
      return {
        columns: ["Recipient", "Type", "Title", "Created", "Status"],
        rows: rows.map((row) => ({
          _id: row.id,
          Recipient: `${row.first_name} ${row.last_name}`.trim(),
          Type: titleCase(row.kind),
          Title: row.title,
          Created: stamp(row.created_at),
          Status: row.read_at ? "Read" : "Unread",
        })),
      };
    }
    case "support-tickets": {
      const { rows } = await query(
        `SELECT t.id, t.subject, t.status, t.updated_at, u.first_name, u.last_name
           FROM support_tickets t LEFT JOIN users u ON u.id = t.user_id
          ORDER BY t.updated_at DESC`,
      );
      return {
        columns: ["Subject", "User", "Updated", "Status"],
        rows: rows.map((row) => ({
          _id: row.id,
          Subject: row.subject,
          User: row.first_name ? `${row.first_name} ${row.last_name}`.trim() : "—",
          Updated: stamp(row.updated_at),
          Status: titleCase(row.status),
        })),
      };
    }
    case "analytics": {
      const metrics = await query(
        `SELECT
           (SELECT count(*)::int FROM users) AS users,
           (SELECT count(*)::int FROM jobs WHERE status = 'published') AS published_jobs,
           (SELECT count(*)::int FROM applications) AS applications,
           (SELECT count(*)::int FROM tasks WHERE status = 'active') AS active_tasks`,
      );
      const m = metrics.rows[0] ?? {};
      return {
        columns: ["Metric", "Value", "Period"],
        rows: [
          { Metric: "Registered users", Value: String(m.users ?? 0), Period: "All time" },
          { Metric: "Published jobs", Value: String(m.published_jobs ?? 0), Period: "All time" },
          { Metric: "Applications", Value: String(m.applications ?? 0), Period: "All time" },
          { Metric: "Active online tasks", Value: String(m.active_tasks ?? 0), Period: "Current" },
        ],
      };
    }
    case "admin-users": {
      const { rows } = await query(
        `SELECT id, first_name, last_name, email, role, status, created_at
           FROM users WHERE role = 'admin' ORDER BY created_at`,
      );
      return {
        columns: ["Name", "Email", "Role", "Status", "Joined"],
        rows: rows.map((row) => ({
          _id: row.id,
          Name: `${row.first_name} ${row.last_name}`.trim(),
          Email: row.email,
          Role: titleCase(row.role),
          Status: titleCase(row.status),
          Joined: day(row.created_at),
        })),
      };
    }
    case "audit-logs": {
      const { rows } = await query(
        `SELECT a.id, a.action, a.target_type, a.created_at,
                u.first_name, u.last_name
           FROM audit_log a LEFT JOIN users u ON u.id = a.actor_id
          ORDER BY a.created_at DESC LIMIT 200`,
      );
      return {
        columns: ["Action", "Actor", "Target", "Time"],
        rows: rows.map((row) => ({
          _id: row.id,
          Action: titleCase(row.action),
          Actor: row.first_name ? `${row.first_name} ${row.last_name}`.trim() : "System",
          Target: titleCase(row.target_type) || "—",
          Time: stamp(row.created_at),
        })),
      };
    }
    case "settings": {
      return {
        columns: ["Setting", "Value"],
        rows: [
          { Setting: "Environment", Value: process.env.NODE_ENV || "development" },
          { Setting: "Email delivery", Value: "Not configured" },
          { Setting: "OAuth providers", Value: process.env.GOOGLE_CLIENT_ID ? "Google enabled" : "Not configured" },
          { Setting: "Listings require moderation", Value: "Enabled" },
          { Setting: "Candidate search requires verified employer", Value: "Enabled" },
        ],
      };
    }
    default:
      return null;
  }
}

admin.get(
  "/sections/:slug",
  route(async (req, res) => {
    const slug = req.params.slug;
    const label = SECTION_LABELS[slug];
    if (!label) return sendError(res, 404, "NOT_FOUND", "Admin section not found.");
    const payload = await sectionPayload(slug);
    const statuses = [...new Set(payload.rows.map((row) => row.Status).filter(Boolean))];
    return res.json({
      section: {
        slug,
        label,
        title: label,
        description: `Live ${label.toLowerCase()} records from the platform database.`,
        columns: payload.columns,
        rows: payload.rows,
        filters: statuses,
      },
    });
  }),
);

/* -------------------------------- Actions ------------------------------- */

admin.post(
  "/actions",
  route(async (req, res) => {
    const { section, id, action } = req.body || {};
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 1000) : "";
    if (!section || !id || !action) {
      return sendError(res, 400, "VALIDATION_ERROR", "Choose a record and an action.");
    }

    let result;
    if (section === "employer-verification") {
      const map = {
        Approve: "verified",
        Reject: "rejected",
        "Request information": "action-required",
      };
      const status = map[action];
      if (!status) return sendError(res, 400, "VALIDATION_ERROR", "That action is not available here.");
      result = await query(
        `UPDATE employer_profiles
            SET verification_status = $2, verification_note = $3, updated_at = now()
          WHERE user_id = $1
          RETURNING user_id`,
        [id, status, reason],
      );
      if (!result.rows[0]) return sendError(res, 404, "NOT_FOUND", "Employer not found.");
      await createNotification(id, {
        kind: "verification",
        title:
          status === "verified"
            ? "Your organization is verified"
            : status === "rejected"
              ? "Organization verification was rejected"
              : "More information is needed for verification",
        body: reason || "Open your verification page to see the latest status.",
        href: "/employer/dashboard/verification",
      });
      await audit(req.user.id, `employer.verification.${status}`, "user", id, { reason });
      return res.json({ ok: true, status });
    }

    if (["job-listings", "government-jobs", "internships"].includes(section)) {
      const map = {
        Approve: "published",
        Publish: "published",
        Reject: "rejected",
        "Request edits": "pending-review",
        Pause: "paused",
      };
      const status = map[action];
      if (!status) return sendError(res, 400, "VALIDATION_ERROR", "That action is not available here.");
      result = await query(
        `UPDATE jobs
            SET status = $2,
                moderation_note = $3,
                published_at = CASE WHEN $2 = 'published' THEN now() ELSE published_at END,
                updated_at = now()
          WHERE id = $1
          RETURNING employer_id, title, status`,
        [id, status, reason],
      );
      if (!result.rows[0]) return sendError(res, 404, "NOT_FOUND", "Job not found.");
      const job = result.rows[0];
      await createNotification(job.employer_id, {
        kind: "job-moderation",
        title:
          status === "published"
            ? "Your job listing is live"
            : status === "rejected"
              ? "Your job listing was rejected"
              : "Your job listing needs edits",
        body: reason || `${job.title} is now ${titleCase(status)}.`,
        href: "/employer/dashboard/jobs",
      });
      await audit(req.user.id, `job.${status}`, "job", id, { reason });
      return res.json({ ok: true, status });
    }

    if (["users", "job-seekers", "employers"].includes(section)) {
      if (section === "users" && id === req.user.id) {
        return sendError(res, 400, "INVALID_ACTION", "You cannot change your own account status.");
      }
      const map = { Suspend: "suspended", Reinstate: "active" };
      const status = map[action];
      if (!status) return sendError(res, 400, "VALIDATION_ERROR", "That action is not available here.");
      result = await query(
        "UPDATE users SET status = $2, updated_at = now() WHERE id = $1 RETURNING id",
        [id, status],
      );
      if (!result.rows[0]) return sendError(res, 404, "NOT_FOUND", "Account not found.");
      await audit(req.user.id, `user.${status}`, "user", id, { reason });
      return res.json({ ok: true, status });
    }

    if (section === "task-submissions") {
      const map = { Approve: "approved", Reject: "rejected" };
      const status = map[action];
      if (!status) return sendError(res, 400, "VALIDATION_ERROR", "That action is not available here.");
      result = await query(
        `UPDATE task_submissions
            SET status = $2, reward_status = CASE WHEN $2 = 'approved' THEN 'queued' ELSE 'not-paid' END,
                reviewed_at = now()
          WHERE id = $1
          RETURNING user_id, task_id`,
        [id, status],
      );
      if (!result.rows[0]) return sendError(res, 404, "NOT_FOUND", "Submission not found.");
      await createNotification(result.rows[0].user_id, {
        kind: "task-review",
        title: status === "approved" ? "Task submission approved" : "Task submission rejected",
        body: reason || "Open your tasks page to see the latest status.",
        href: "/dashboard/tasks",
      });
      await audit(req.user.id, `task-submission.${status}`, "task_submission", id, { reason });
      return res.json({ ok: true, status });
    }

    if (section === "reports") {
      const map = { Investigate: "investigating", Resolve: "resolved", Dismiss: "dismissed" };
      const status = map[action];
      if (!status) return sendError(res, 400, "VALIDATION_ERROR", "That action is not available here.");
      result = await query(
        "UPDATE reports SET status = $2, updated_at = now() WHERE id = $1 RETURNING id",
        [id, status],
      );
      if (!result.rows[0]) return sendError(res, 404, "NOT_FOUND", "Report not found.");
      await audit(req.user.id, `report.${status}`, "report", id, { reason });
      return res.json({ ok: true, status });
    }

    if (section === "support-tickets") {
      const map = { "Mark in progress": "in-progress", Resolve: "resolved" };
      const status = map[action];
      if (!status) return sendError(res, 400, "VALIDATION_ERROR", "That action is not available here.");
      result = await query(
        "UPDATE support_tickets SET status = $2, updated_at = now() WHERE id = $1 RETURNING id",
        [id, status],
      );
      if (!result.rows[0]) return sendError(res, 404, "NOT_FOUND", "Ticket not found.");
      await audit(req.user.id, `support-ticket.${status}`, "support_ticket", id, { reason });
      return res.json({ ok: true, status });
    }

    return sendError(res, 400, "VALIDATION_ERROR", "That action is not available for this section.");
  }),
);

/* ---------------------------- Task management --------------------------- */

admin.post(
  "/tasks",
  route(async (req, res) => {
    const body = req.body || {};
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
    const actionText = typeof body.action === "string" ? body.action.trim().slice(0, 4000) : "";
    if (!title || !actionText) {
      return sendError(res, 400, "VALIDATION_ERROR", "Add a task title and instructions.");
    }
    const { rows } = await query(
      `INSERT INTO tasks
         (id, title, platform, category, action, time_estimate, reward_amount,
          reward_currency, eligibility, availability, availability_state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        randomUUID(),
        title,
        typeof body.platform === "string" ? body.platform.trim().slice(0, 200) : "",
        ["youtube", "social-follow", "engagement", "survey", "testing", "research"].includes(body.category)
          ? body.category
          : "survey",
        actionText,
        typeof body.time === "string" ? body.time.trim().slice(0, 80) : "",
        Number(body.rewardAmount) || 0,
        typeof body.rewardCurrency === "string" ? body.rewardCurrency.slice(0, 8) : "KES",
        typeof body.eligibility === "string" ? body.eligibility.trim().slice(0, 1000) : "",
        typeof body.availability === "string" ? body.availability.trim().slice(0, 120) : "",
        ["open", "limited", "closed"].includes(body.availabilityState) ? body.availabilityState : "open",
      ],
    );
    await audit(req.user.id, "task.created", "task", rows[0].id);
    return res.status(201).json({ task: rows[0] });
  }),
);

admin.patch(
  "/tasks/:id",
  route(async (req, res) => {
    const status = req.body?.status;
    if (!["active", "paused", "closed"].includes(status)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Choose a valid task status.");
    }
    const { rows } = await query(
      "UPDATE tasks SET status = $2, updated_at = now() WHERE id = $1 RETURNING *",
      [req.params.id, status],
    );
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Task not found.");
    await audit(req.user.id, `task.${status}`, "task", req.params.id);
    return res.json({ task: rows[0] });
  }),
);

module.exports = { adminRouter: admin };
