const { query } = require("./db");
const { iso, publicUser, requireAccountType, requireAuth, route } = require("./lib");
const { applicationShape, jobShape } = require("./jobs");
const { notificationShape } = require("./notifications");
const { getEmployerProfile, getJobSeekerProfile } = require("./profiles");
const { taskShape } = require("./tasks");

/** Aggregated dashboard payloads built from persisted rows only. */

function registerDashboardRoutes(app) {
  app.get(
    "/api/v1/dashboard/job-seeker",
    requireAuth,
    requireAccountType("job-seeker"),
    route(async (req, res) => {
      const profileRow = await getJobSeekerProfile(req.user.id);

      const [applications, saved, notifications, recommended, tasks] = await Promise.all([
        query(
          `SELECT a.*, j.title AS job_title, j.employer_name, j.location
             FROM applications a JOIN jobs j ON j.id = a.job_id
            WHERE a.seeker_id = $1 ORDER BY a.created_at DESC`,
          [req.user.id],
        ),
        query(
          `SELECT j.*, s.created_at AS saved_at
             FROM saved_jobs s JOIN jobs j ON j.id = s.job_id
            WHERE s.seeker_id = $1 ORDER BY s.created_at DESC`,
          [req.user.id],
        ),
        query(
          "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
          [req.user.id],
        ),
        query(
          `SELECT * FROM jobs
            WHERE status = 'published' AND (deadline IS NULL OR deadline >= CURRENT_DATE)
            ORDER BY COALESCE(published_at, created_at) DESC
            LIMIT 6`,
        ),
        query(
          `SELECT * FROM tasks
            WHERE status = 'active' AND review_status = 'approved' AND availability_state <> 'closed'
            ORDER BY created_at DESC LIMIT 3`,
        ),
      ]);

      return res.json({
        user: publicUser(req.user),
        profile: profileRow?.data ?? null,
        visibility: {
          profileVisibleToEmployers: profileRow?.profile_visible ?? true,
          allowEmployerContact: profileRow?.allow_employer_contact ?? false,
        },
        applications: applications.rows.map(applicationShape),
        savedJobs: saved.rows.map((row) => ({ ...jobShape(row), savedAt: iso(row.saved_at) })),
        notifications: notifications.rows.map(notificationShape),
        recommendedJobs: recommended.rows.map(jobShape),
        tasks: tasks.rows.map(taskShape),
      });
    }),
  );

  app.get(
    "/api/v1/dashboard/employer",
    requireAuth,
    requireAccountType("employer"),
    route(async (req, res) => {
      const profile = await getEmployerProfile(req.user.id);

      const [jobCounts, applicationCounts, recentApplications, notifications] = await Promise.all([
        query(
          `SELECT
             count(*) FILTER (WHERE status = 'published')::int AS active_jobs,
             count(*) FILTER (WHERE status = 'draft')::int AS draft_jobs,
             count(*) FILTER (WHERE status = 'pending-review')::int AS pending_jobs
           FROM jobs WHERE employer_id = $1`,
          [req.user.id],
        ),
        query(
          `SELECT
             count(*)::int AS total,
             count(*) FILTER (WHERE a.status IN ('shortlisted', 'interview'))::int AS shortlisted
           FROM applications a JOIN jobs j ON j.id = a.job_id
          WHERE j.employer_id = $1`,
          [req.user.id],
        ),
        query(
          `SELECT a.*, j.title AS job_title, j.employer_name, j.location,
                  u.first_name || ' ' || u.last_name AS applicant_name,
                  u.email AS applicant_email
             FROM applications a
             JOIN jobs j ON j.id = a.job_id
             JOIN users u ON u.id = a.seeker_id
            WHERE j.employer_id = $1
            ORDER BY a.created_at DESC LIMIT 5`,
          [req.user.id],
        ),
        query(
          "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
          [req.user.id],
        ),
      ]);

      const counts = jobCounts.rows[0] ?? {};
      const applicationTotals = applicationCounts.rows[0] ?? {};

      return res.json({
        user: publicUser(req.user),
        profile: profile?.data ?? null,
        company: profile
          ? {
              companyName: profile.company_name,
              organizationType: profile.organization_type,
              industry: profile.industry,
              website: profile.website,
              companySize: profile.company_size,
              country: profile.country,
              county: profile.county,
              city: profile.city,
              description: profile.description,
              logoUrl: profile.logo_url,
              contactName: profile.contact_name,
              contactEmail: profile.contact_email,
              contactPhone: profile.contact_phone,
            }
          : null,
        verification: {
          status: profile?.verification_status ?? "not-started",
          note: profile?.verification_note ?? "",
          submittedAt: iso(profile?.verification_submitted_at),
        },
        metrics: {
          activeJobs: counts.active_jobs ?? 0,
          draftJobs: counts.draft_jobs ?? 0,
          pendingJobs: counts.pending_jobs ?? 0,
          applicationsReceived: applicationTotals.total ?? 0,
          candidatesShortlisted: applicationTotals.shortlisted ?? 0,
        },
        recentApplications: recentApplications.rows.map(applicationShape),
        notifications: notifications.rows.map(notificationShape),
      });
    }),
  );
}

module.exports = { registerDashboardRoutes };
