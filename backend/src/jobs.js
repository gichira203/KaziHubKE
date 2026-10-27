const { randomUUID } = require("node:crypto");
const { z } = require("zod");
const { query, transaction } = require("./db");
const {
  audit,
  dateOnly,
  iso,
  publicUser,
  requireAccountType,
  requireAuth,
  requireRole,
  route,
  sendError,
  validationMessage,
} = require("./lib");
const { createNotification } = require("./notifications");
const { getEmployerProfile } = require("./profiles");

/**
 * Jobs: public discovery, employer CRUD, applications and saved listings.
 *
 * Only `published` listings are public. Employers may save drafts freely, but
 * submitting for review requires a verified organization. Publication is an
 * admin decision so no listing is ever self-published without moderation.
 */

const CATEGORIES = ["online", "government", "internship", "attachment", "private"];

const jobSchema = z.object({
  title: z.string().trim().min(3, "Add a job title.").max(160),
  description: z.string().trim().min(20, "Add a description of at least 20 characters.").max(10000),
  category: z.enum(CATEGORIES),
  employmentType: z.string().trim().min(2, "Add an employment type.").max(80),
  location: z.string().trim().min(2, "Add a location.").max(120),
  remote: z.boolean().optional().default(false),
  salaryRange: z.string().trim().max(120).optional().default(""),
  deadline: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid deadline date."), z.literal(""), z.null()])
    .optional()
    .default(null),
  status: z.enum(["draft", "pending-review"]).optional().default("draft"),
});

function jobShape(row) {
  return {
    id: row.id,
    title: row.title,
    employer: row.employer_name,
    employerId: row.employer_id,
    category: row.category,
    employmentType: row.employment_type,
    location: row.location,
    remote: Boolean(row.remote),
    salaryRange: row.salary_range,
    deadline: dateOnly(row.deadline),
    postedAt: dateOnly(row.published_at ?? row.created_at),
    description: row.description,
    status: row.status,
    moderationNote: row.moderation_note,
    updatedAt: iso(row.updated_at),
  };
}

function applicationShape(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    status: row.status,
    coverLetter: row.cover_letter,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    jobTitle: row.job_title,
    employer: row.employer_name,
    location: row.location,
    applicantName: row.applicant_name,
    applicantEmail: row.applicant_email,
  };
}

const filterGroups = {
  all: CATEGORIES,
  online: ["online"],
  government: ["government"],
  internship: ["internship"],
  attachment: ["attachment"],
  private: ["private"],
};

function registerJobRoutes(app) {
  /* ------------------------------ Public ------------------------------ */

  app.get(
    "/api/v1/jobs",
    route(async (req, res) => {
      const search = typeof req.query.query === "string" ? req.query.query.trim() : "";
      const category = typeof req.query.category === "string" ? req.query.category : "all";
      const employmentType =
        typeof req.query.employmentType === "string" ? req.query.employmentType.trim() : "";
      const sort = typeof req.query.sort === "string" ? req.query.sort : "newest";
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const perPage = Math.min(50, Math.max(1, Number.parseInt(req.query.perPage, 10) || 6));
      const allowedCategories = filterGroups[category] ?? CATEGORIES;

      const params = [];
      const conditions = [
        "status = 'published'",
        "(deadline IS NULL OR deadline >= CURRENT_DATE)",
      ];

      params.push(allowedCategories);
      conditions.push(`category = ANY($${params.length}::text[])`);

      if (search) {
        params.push(`%${search.toLowerCase()}%`);
        conditions.push(
          `(lower(title) LIKE $${params.length}
            OR lower(employer_name) LIKE $${params.length}
            OR lower(location) LIKE $${params.length}
            OR lower(employment_type) LIKE $${params.length})`,
        );
      }
      if (employmentType) {
        params.push(employmentType);
        conditions.push(`employment_type = $${params.length}`);
      }
      const where = conditions.join(" AND ");

      const orderBy =
        sort === "title"
          ? "title ASC"
          : sort === "deadline"
            ? "deadline ASC NULLS LAST, created_at DESC"
            : "COALESCE(published_at, created_at) DESC";

      const countResult = await query(`SELECT count(*)::int AS total FROM jobs WHERE ${where}`, params);
      const total = countResult.rows[0]?.total ?? 0;
      params.push(perPage, (page - 1) * perPage);
      const { rows } = await query(
        `SELECT * FROM jobs
          WHERE ${where}
          ORDER BY ${orderBy}
          LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      );

      return res.json({
        items: rows.map(jobShape),
        total,
        page,
        perPage,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
      });
    }),
  );

  app.get(
    "/api/v1/jobs/meta",
    route(async (_req, res) => {
      const types = await query(
        `SELECT DISTINCT employment_type FROM jobs
          WHERE status = 'published' AND (deadline IS NULL OR deadline >= CURRENT_DATE)
          ORDER BY employment_type`,
      );
      const counts = await query(
        `SELECT category, count(*)::int AS total FROM jobs
          WHERE status = 'published' AND (deadline IS NULL OR deadline >= CURRENT_DATE)
          GROUP BY category`,
      );
      const total = await query(
        `SELECT count(*)::int AS total FROM jobs
          WHERE status = 'published' AND (deadline IS NULL OR deadline >= CURRENT_DATE)`,
      );
      return res.json({
        employmentTypes: types.rows.map((row) => row.employment_type),
        categories: Object.fromEntries(counts.rows.map((row) => [row.category, row.total])),
        total: total.rows[0]?.total ?? 0,
      });
    }),
  );

  app.get(
    "/api/v1/jobs/:id",
    route(async (req, res) => {
      const { rows } = await query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
      const row = rows[0];
      if (!row) return sendError(res, 404, "NOT_FOUND", "Job not found.");
      if (row.status !== "published") {
        const session = req.cookies?.kazihub_session;
        const user = session ? await currentUser(req) : null;
        const isOwner = user && user.id === row.employer_id;
        const isAdmin = user && user.role === "admin";
        if (!isOwner && !isAdmin) return sendError(res, 404, "NOT_FOUND", "Job not found.");
      }
      return res.json({ job: jobShape(row) });
    }),
  );

  /* --------------------------- Applications --------------------------- */

  app.post(
    "/api/v1/jobs/:id/apply",
    requireAuth,
    requireAccountType("job-seeker"),
    route(async (req, res) => {
      const { rows: jobRows } = await query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
      const job = jobRows[0];
      if (!job || job.status !== "published") {
        return sendError(res, 404, "NOT_FOUND", "This job is not open for applications.");
      }
      if (job.deadline && dateOnly(job.deadline) < new Date().toISOString().slice(0, 10)) {
        return sendError(res, 409, "DEADLINE_PASSED", "The application deadline has passed.");
      }
      if (job.employer_id === req.user.id) {
        return sendError(res, 400, "INVALID_APPLICATION", "You cannot apply to your own listing.");
      }

      const coverLetter =
        typeof req.body?.coverLetter === "string" ? req.body.coverLetter.slice(0, 5000) : "";

      let application;
      try {
        const result = await query(
          `INSERT INTO applications (id, job_id, seeker_id, cover_letter)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [randomUUID(), job.id, req.user.id, coverLetter],
        );
        application = result.rows[0];
      } catch (error) {
        if (error?.code === "23505" || /duplicate key|unique constraint/i.test(String(error?.message))) {
          return sendError(res, 409, "ALREADY_APPLIED", "You have already applied to this job.");
        }
        throw error;
      }

      await createNotification(job.employer_id, {
        kind: "application",
        title: "New application received",
        body: `${req.user.first_name} ${req.user.last_name} applied for ${job.title}.`,
        href: "/employer/dashboard/applications",
      });
      await audit(req.user.id, "application.submitted", "job", job.id);

      return res.status(201).json({ application: applicationShape(application) });
    }),
  );

  app.get(
    "/api/v1/applications",
    requireAuth,
    requireAccountType("job-seeker"),
    route(async (req, res) => {
      const { rows } = await query(
        `SELECT a.*, j.title AS job_title, j.employer_name, j.location
           FROM applications a
           JOIN jobs j ON j.id = a.job_id
          WHERE a.seeker_id = $1
          ORDER BY a.created_at DESC`,
        [req.user.id],
      );
      return res.json({ items: rows.map(applicationShape) });
    }),
  );

  /* ------------------------------ Saved ------------------------------- */

  app.get(
    "/api/v1/saved-jobs",
    requireAuth,
    requireAccountType("job-seeker"),
    route(async (req, res) => {
      const { rows } = await query(
        `SELECT j.*, s.created_at AS saved_at
           FROM saved_jobs s
           JOIN jobs j ON j.id = s.job_id
          WHERE s.seeker_id = $1
          ORDER BY s.created_at DESC`,
        [req.user.id],
      );
      return res.json({
        items: rows.map((row) => ({ ...jobShape(row), savedAt: iso(row.saved_at) })),
      });
    }),
  );

  app.post(
    "/api/v1/jobs/:id/save",
    requireAuth,
    requireAccountType("job-seeker"),
    route(async (req, res) => {
      const { rows: jobRows } = await query("SELECT id, status FROM jobs WHERE id = $1", [req.params.id]);
      if (!jobRows[0] || jobRows[0].status !== "published") {
        return sendError(res, 404, "NOT_FOUND", "Job not found.");
      }
      await query(
        `INSERT INTO saved_jobs (seeker_id, job_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [req.user.id, req.params.id],
      );
      return res.json({ ok: true, saved: true });
    }),
  );

  app.delete(
    "/api/v1/jobs/:id/save",
    requireAuth,
    requireAccountType("job-seeker"),
    route(async (req, res) => {
      await query("DELETE FROM saved_jobs WHERE seeker_id = $1 AND job_id = $2", [
        req.user.id,
        req.params.id,
      ]);
      return res.json({ ok: true, saved: false });
    }),
  );

  /* --------------------------- Employer jobs -------------------------- */

  app.get(
    "/api/v1/employer/jobs",
    requireAuth,
    requireAccountType("employer"),
    route(async (req, res) => {
      const { rows } = await query(
        "SELECT * FROM jobs WHERE employer_id = $1 ORDER BY updated_at DESC",
        [req.user.id],
      );
      return res.json({ items: rows.map(jobShape) });
    }),
  );

  app.post(
    "/api/v1/employer/jobs",
    requireAuth,
    requireAccountType("employer"),
    route(async (req, res) => {
      const parsed = jobSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return sendError(res, 400, "VALIDATION_ERROR", validationMessage(parsed), parsed.error.issues);
      }
      const profile = await getEmployerProfile(req.user.id);
      const employerName = profile?.company_name || `${req.user.first_name} ${req.user.last_name}`.trim();
      const data = parsed.data;

      if (data.status === "pending-review" && profile?.verification_status !== "verified") {
        return sendError(
          res,
          403,
          "VERIFICATION_REQUIRED",
          "Your organization must be verified before a listing can be submitted for review.",
        );
      }

      const { rows } = await query(
        `INSERT INTO jobs
           (id, employer_id, employer_name, title, description, category, employment_type,
            location, remote, salary_range, deadline, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          randomUUID(),
          req.user.id,
          employerName,
          data.title,
          data.description,
          data.category,
          data.employmentType,
          data.location,
          data.remote,
          data.salaryRange || "",
          data.deadline || null,
          data.status,
        ],
      );
      await audit(req.user.id, `job.${data.status}`, "job", rows[0].id);
      return res.status(201).json({ job: jobShape(rows[0]) });
    }),
  );

  app.patch(
    "/api/v1/employer/jobs/:id",
    requireAuth,
    requireAccountType("employer"),
    route(async (req, res) => {
      const { rows: existingRows } = await query(
        "SELECT * FROM jobs WHERE id = $1 AND employer_id = $2",
        [req.params.id, req.user.id],
      );
      const existing = existingRows[0];
      if (!existing) return sendError(res, 404, "NOT_FOUND", "Job not found.");

      const body = req.body && typeof req.body === "object" ? req.body : {};
      const nextStatus = typeof body.status === "string" ? body.status : existing.status;

      if (!["draft", "pending-review", "paused", "closed"].includes(nextStatus)) {
        return sendError(res, 400, "VALIDATION_ERROR", "That status cannot be set by an employer.");
      }
      if (nextStatus === "pending-review" && existing.status !== "pending-review") {
        const profile = await getEmployerProfile(req.user.id);
        if (profile?.verification_status !== "verified") {
          return sendError(
            res,
            403,
            "VERIFICATION_REQUIRED",
            "Your organization must be verified before a listing can be submitted for review.",
          );
        }
      }

      const fields = [];
      const params = [];
      const set = (column, value) => {
        params.push(value);
        fields.push(`${column} = $${params.length}`);
      };

      if (typeof body.title === "string") set("title", body.title.trim().slice(0, 160));
      if (typeof body.description === "string") set("description", body.description.trim().slice(0, 10000));
      if (CATEGORIES.includes(body.category)) set("category", body.category);
      if (typeof body.employmentType === "string") set("employment_type", body.employmentType.trim().slice(0, 80));
      if (typeof body.location === "string") set("location", body.location.trim().slice(0, 120));
      if (typeof body.remote === "boolean") set("remote", body.remote);
      if (typeof body.salaryRange === "string") set("salary_range", body.salaryRange.trim().slice(0, 120));
      if (body.deadline === null || body.deadline === "" || /^\d{4}-\d{2}-\d{2}$/.test(body.deadline)) {
        set("deadline", body.deadline || null);
      }
      if (nextStatus !== existing.status) set("status", nextStatus);
      if (nextStatus === "pending-review" && existing.status !== "pending-review") {
        set("moderation_note", "");
      }

      params.push(req.params.id, req.user.id);
      const { rows } = await query(
        `UPDATE jobs SET ${fields.length ? `${fields.join(", ")}, ` : ""}updated_at = now()
          WHERE id = $${params.length - 1} AND employer_id = $${params.length}
          RETURNING *`,
        params,
      );
      await audit(req.user.id, `job.updated.${nextStatus}`, "job", req.params.id);
      return res.json({ job: jobShape(rows[0]) });
    }),
  );

  app.delete(
    "/api/v1/employer/jobs/:id",
    requireAuth,
    requireAccountType("employer"),
    route(async (req, res) => {
      const { rows } = await query(
        "SELECT status FROM jobs WHERE id = $1 AND employer_id = $2",
        [req.params.id, req.user.id],
      );
      if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Job not found.");
      if (rows[0].status !== "draft") {
        return sendError(res, 409, "NOT_DELETABLE", "Only drafts can be deleted. Close the listing instead.");
      }
      await query("DELETE FROM jobs WHERE id = $1 AND employer_id = $2", [req.params.id, req.user.id]);
      return res.json({ ok: true });
    }),
  );

  /* ----------------------- Employer applications ---------------------- */

  app.get(
    "/api/v1/employer/applications",
    requireAuth,
    requireAccountType("employer"),
    route(async (req, res) => {
      const { rows } = await query(
        `SELECT a.*, j.title AS job_title, j.employer_name, j.location,
                u.first_name || ' ' || u.last_name AS applicant_name,
                u.email AS applicant_email
           FROM applications a
           JOIN jobs j ON j.id = a.job_id
           JOIN users u ON u.id = a.seeker_id
          WHERE j.employer_id = $1
          ORDER BY a.created_at DESC`,
        [req.user.id],
      );
      return res.json({ items: rows.map(applicationShape) });
    }),
  );

  app.patch(
    "/api/v1/employer/applications/:id",
    requireAuth,
    requireAccountType("employer"),
    route(async (req, res) => {
      const status = req.body?.status;
      if (!["submitted", "under-review", "shortlisted", "interview", "closed"].includes(status)) {
        return sendError(res, 400, "VALIDATION_ERROR", "Choose a valid application status.");
      }
      const { rows } = await query(
        `UPDATE applications a
            SET status = $3, updated_at = now()
           FROM jobs j
          WHERE a.id = $1 AND a.job_id = j.id AND j.employer_id = $2
          RETURNING a.*`,
        [req.params.id, req.user.id, status],
      );
      if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Application not found.");
      const application = rows[0];
      const { rows: contextRows } = await query(
        "SELECT title FROM jobs WHERE id = $1",
        [application.job_id],
      );
      await createNotification(application.seeker_id, {
        kind: "application-status",
        title: "Your application status changed",
        body: `${contextRows[0]?.title ?? "Your application"} is now ${status.replace(/-/g, " ")}.`,
        href: "/dashboard/applications",
      });
      return res.json({ application: applicationShape(application) });
    }),
  );
}

/** Load the current user without throwing when the cookie is missing. */
async function currentUser(req) {
  const { readSession, findUserById } = require("./lib");
  const session = readSession(req);
  if (!session) return null;
  return findUserById(session.sub);
}

module.exports = { registerJobRoutes, jobShape, applicationShape };
