const { randomUUID } = require("node:crypto");
const { query } = require("./db");
const { iso, requireAuth, route, sendError } = require("./lib");

/** Online tasks and submissions. Only open/active tasks are listed publicly. */

const currency = new Intl.NumberFormat("en-KE", {
  maximumFractionDigits: 0,
});

function rewardLabel(row) {
  const amount = Number(row.reward_amount || 0);
  if (!amount) return `${row.reward_currency} reward set per task`;
  return `${row.reward_currency} ${currency.format(amount)}`;
}

function taskShape(row) {
  return {
    id: row.id,
    title: row.title,
    platform: row.platform,
    category: row.category,
    action: row.action,
    time: row.time_estimate,
    reward: rewardLabel(row),
    rewardAmount: Number(row.reward_amount || 0),
    rewardCurrency: row.reward_currency,
    eligibility: row.eligibility,
    availability: row.availability,
    availabilityState: row.availability_state,
    status: row.status,
  };
}

function submissionShape(row) {
  return {
    id: row.id,
    taskId: row.task_id,
    taskTitle: row.task_title,
    status: row.status,
    rewardStatus: row.reward_status,
    evidence: row.evidence,
    createdAt: iso(row.created_at),
    reviewedAt: iso(row.reviewed_at),
  };
}

function registerTaskRoutes(app) {
  app.get(
    "/api/v1/tasks",
    route(async (_req, res) => {
      const { rows } = await query(
        `SELECT * FROM tasks
          WHERE status = 'active' AND availability_state <> 'closed'
          ORDER BY created_at DESC`,
      );
      return res.json({ items: rows.map(taskShape) });
    }),
  );

  app.get(
    "/api/v1/tasks/:id",
    route(async (req, res) => {
      const { rows } = await query("SELECT * FROM tasks WHERE id = $1 AND status = 'active'", [
        req.params.id,
      ]);
      if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Task not found.");
      return res.json({ task: taskShape(rows[0]) });
    }),
  );

  app.get(
    "/api/v1/task-submissions",
    requireAuth,
    route(async (req, res) => {
      const { rows } = await query(
        `SELECT s.*, t.title AS task_title
           FROM task_submissions s
           JOIN tasks t ON t.id = s.task_id
          WHERE s.user_id = $1
          ORDER BY s.created_at DESC`,
        [req.user.id],
      );
      return res.json({ items: rows.map(submissionShape) });
    }),
  );

  app.post(
    "/api/v1/tasks/:id/submissions",
    requireAuth,
    route(async (req, res) => {
      if (req.user.account_type !== "job-seeker") {
        return sendError(res, 403, "FORBIDDEN", "Only job-seeker accounts can submit tasks.");
      }
      const { rows: taskRows } = await query(
        "SELECT * FROM tasks WHERE id = $1 AND status = 'active' AND availability_state <> 'closed'",
        [req.params.id],
      );
      if (!taskRows[0]) return sendError(res, 404, "NOT_FOUND", "This task is not accepting submissions.");
      const evidence =
        typeof req.body?.evidence === "string" ? req.body.evidence.trim().slice(0, 4000) : "";
      if (!evidence) {
        return sendError(res, 400, "VALIDATION_ERROR", "Add a link or description of your completed work.");
      }
      const { rows } = await query(
        `INSERT INTO task_submissions (id, task_id, user_id, evidence)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [randomUUID(), req.params.id, req.user.id, evidence],
      );
      return res.status(201).json({
        submission: submissionShape({ ...rows[0], task_title: taskRows[0].title }),
      });
    }),
  );
}

module.exports = { registerTaskRoutes, taskShape, submissionShape };
