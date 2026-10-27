const { randomUUID } = require("node:crypto");
const { query, transaction } = require("./db");
const { audit, iso, requireAccountType, requireAuth, route, sendError } = require("./lib");
const { createNotification } = require("./notifications");
const { z } = require("zod");

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
    targetUrl: row.target_url || "",
    category: row.category,
    action: row.action,
    time: row.time_estimate,
    reward: rewardLabel(row),
    rewardAmount: Number(row.reward_amount || 0),
    rewardCurrency: row.reward_currency,
    budgetAmount: row.budget_amount == null ? null : Number(row.budget_amount),
    maxSubmissions: row.max_submissions == null ? null : Number(row.max_submissions),
    reviewStatus: row.review_status || "approved",
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
          WHERE status = 'active' AND review_status = 'approved' AND availability_state <> 'closed'
          ORDER BY created_at DESC`,
      );
      return res.json({ items: rows.map(taskShape) });
    }),
  );

  app.get(
    "/api/v1/tasks/:id",
    route(async (req, res) => {
      const { rows } = await query("SELECT * FROM tasks WHERE id = $1 AND status = 'active' AND review_status = 'approved'", [
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
        "SELECT * FROM tasks WHERE id = $1 AND status = 'active' AND review_status = 'approved' AND availability_state <> 'closed'",
        [req.params.id],
      );
      if (!taskRows[0]) return sendError(res, 404, "NOT_FOUND", "This task is not accepting submissions.");
      const evidence =
        typeof req.body?.evidence === "string" ? req.body.evidence.trim().slice(0, 4000) : "";
      if (!evidence) {
        return sendError(res, 400, "VALIDATION_ERROR", "Add a link or description of your completed work.");
      }
      let rows;
      try {
        rows = await transaction(async (tx) => {
          const locked = await tx.query("SELECT * FROM tasks WHERE id=$1 FOR UPDATE", [req.params.id]);
          const currentTask = locked.rows[0];
          if (!currentTask || currentTask.status !== "active" || currentTask.review_status !== "approved" || currentTask.availability_state === "closed") {
            const unavailable = new Error("This task is no longer accepting submissions."); unavailable.statusCode = 404; throw unavailable;
          }
          let submittedCount = 0;
          if (currentTask.max_submissions != null || currentTask.budget_amount != null) {
            const countResult = await tx.query("SELECT count(*)::int AS total FROM task_submissions WHERE task_id=$1", [req.params.id]);
            submittedCount = Number(countResult.rows[0].total);
            const slotLimit = currentTask.max_submissions == null ? Infinity : Number(currentTask.max_submissions);
            const budgetLimit = currentTask.budget_amount == null ? Infinity : Math.floor(Number(currentTask.budget_amount) / Number(currentTask.reward_amount));
            if (submittedCount >= Math.min(slotLimit, budgetLimit)) {
              const exhausted = new Error("All funded task slots have been claimed."); exhausted.statusCode = 409; throw exhausted;
            }
          }
          const result = await tx.query(
            `INSERT INTO task_submissions (id, task_id, user_id, evidence)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [randomUUID(), req.params.id, req.user.id, evidence],
          );
          if (currentTask.max_submissions != null || currentTask.budget_amount != null) {
            const nextCount = submittedCount + 1;
            const slotLimit = currentTask.max_submissions == null ? Infinity : Number(currentTask.max_submissions);
            const budgetLimit = currentTask.budget_amount == null ? Infinity : Math.floor(Number(currentTask.budget_amount) / Number(currentTask.reward_amount));
            if (nextCount >= Math.min(slotLimit, budgetLimit)) await tx.query("UPDATE tasks SET availability_state='closed',updated_at=now() WHERE id=$1", [req.params.id]);
          }
          return result.rows;
        });
      } catch (error) {
        if (error?.code === "23505") return sendError(res, 409, "ALREADY_SUBMITTED", "You have already submitted this task.");
        if (error?.statusCode) return sendError(res, error.statusCode, "TASK_UNAVAILABLE", error.message);
        throw error;
      }
      return res.status(201).json({
        submission: submissionShape({ ...rows[0], task_title: taskRows[0].title }),
      });
    }),
  );

  app.get("/api/v1/employer/tasks", requireAuth, requireAccountType("employer"), route(async (req, res) => {
    const { rows } = await query("SELECT * FROM tasks WHERE employer_id = $1 ORDER BY created_at DESC", [req.user.id]);
    return res.json({ items: rows.map(taskShape) });
  }));

  app.post("/api/v1/employer/tasks", requireAuth, requireAccountType("employer"), route(async (req, res) => {
    const schema = z.object({
      title: z.string().trim().min(4).max(160),
      platform: z.string().trim().min(2).max(80),
      category: z.enum(["youtube", "social-follow", "engagement", "survey", "testing", "research"]),
      action: z.string().trim().min(20).max(2000),
      targetUrl: z.string().url().max(1000).refine((value) => ["http:", "https:"].includes(new URL(value).protocol)),
      time: z.string().trim().min(2).max(80),
      rewardAmount: z.coerce.number().positive().max(100000),
      budgetAmount: z.coerce.number().positive().max(100000000),
      maxSubmissions: z.coerce.number().int().positive().max(100000),
      eligibility: z.string().trim().max(1000).optional().default("Kenyan residents"),
      availability: z.string().trim().max(160).optional().default("Open"),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "VALIDATION_ERROR", parsed.error.issues[0]?.message || "Check the task details.");
    const task = parsed.data;
    if (task.budgetAmount < task.rewardAmount * task.maxSubmissions) return sendError(res, 400, "VALIDATION_ERROR", "Campaign budget must cover the reward for all participant slots.");
    const { rows } = await query(
      `INSERT INTO tasks (id, employer_id, title, platform, category, action, target_url,budget_amount,max_submissions,
        time_estimate, reward_amount, reward_currency, eligibility, availability,
        availability_state, status, review_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'KES',$12,$13,'open','active','pending-review') RETURNING *`,
      [randomUUID(), req.user.id, task.title, task.platform, task.category, task.action, task.targetUrl, task.budgetAmount, task.maxSubmissions, task.time, task.rewardAmount, task.eligibility, task.availability],
    );
    return res.status(201).json({ task: taskShape(rows[0]) });
  }));

  app.get("/api/v1/employer/task-submissions", requireAuth, requireAccountType("employer"), route(async (req, res) => {
    const { rows } = await query(
      `SELECT s.id,s.task_id,s.user_id,s.evidence,s.status,s.reward_status,s.created_at,s.reviewed_at,
              t.title AS task_title,t.reward_amount,u.first_name,u.last_name
         FROM task_submissions s JOIN tasks t ON t.id=s.task_id JOIN users u ON u.id=s.user_id
        WHERE t.employer_id=$1 ORDER BY s.created_at DESC`, [req.user.id]);
    return res.json({ items: rows.map((row) => ({ ...submissionShape({ ...row, task_title: row.task_title }), rewardAmount: Number(row.reward_amount), candidateName: `${row.first_name} ${row.last_name}`.trim() })) });
  }));

  app.patch("/api/v1/employer/task-submissions/:id", requireAuth, requireAccountType("employer"), route(async (req, res) => {
    const status = req.body?.status;
    if (!["approved", "rejected"].includes(status)) return sendError(res, 400, "VALIDATION_ERROR", "Choose approved or rejected.");
    const { rows } = await query(
      `UPDATE task_submissions s SET status=$2,
          reward_status=CASE WHEN $2='approved' THEN 'queued' ELSE 'not-paid' END, reviewed_at=now()
        FROM tasks t WHERE s.id=$1 AND s.status='pending' AND t.id=s.task_id AND t.employer_id=$3
        RETURNING s.user_id,s.task_id,t.title AS task_title`, [req.params.id, status, req.user.id]);
    if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Submission not found for your campaigns.");
    await createNotification(rows[0].user_id, { kind: "task-review", title: status === "approved" ? "Task submission approved" : "Task submission rejected", body: status === "approved" ? "Your reward is now included in your available KES earnings." : "Your task submission was not approved.", href: "/dashboard/earnings" });
    await audit(req.user.id, `task-submission.${status}`, "task_submission", req.params.id);
    return res.json({ ok: true, status });
  }));

  app.get("/api/v1/wallet", requireAuth, requireAccountType("job-seeker"), route(async (req, res) => {
    const balance = await query(
      `SELECT COALESCE(sum(t.reward_amount),0)::numeric AS earned
         FROM task_submissions s JOIN tasks t ON t.id=s.task_id
        WHERE s.user_id=$1 AND s.status='approved' AND s.reward_status IN ('queued','paid')`, [req.user.id]);
    const reserved = await query("SELECT COALESCE(sum(amount),0)::numeric AS amount FROM withdrawal_requests WHERE user_id=$1 AND status IN ('pending','processing','paid')", [req.user.id]);
    const requests = await query("SELECT id,amount,currency,mpesa_phone,status,admin_note,created_at FROM withdrawal_requests WHERE user_id=$1 ORDER BY created_at DESC", [req.user.id]);
    const submissions = await query(
      `SELECT s.id,s.status,s.reward_status,s.created_at,t.title AS task_title,t.reward_amount
         FROM task_submissions s JOIN tasks t ON t.id=s.task_id WHERE s.user_id=$1 ORDER BY s.created_at DESC`, [req.user.id]);
    const earned = Number(balance.rows[0].earned);
    const committed = Number(reserved.rows[0].amount);
    return res.json({ currency: "KES", earned, available: Math.max(0, earned - committed), submissions: submissions.rows, withdrawals: requests.rows });
  }));

  app.post("/api/v1/wallet/withdrawals", requireAuth, requireAccountType("job-seeker"), route(async (req, res) => {
    const parsed = z.object({ amount: z.coerce.number().finite().min(100).max(10000000), mpesaPhone: z.string().trim().regex(/^(?:\+?254|0)(?:7|1)\d{8}$/) }).safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "VALIDATION_ERROR", "Enter an amount of at least KES 100 and a valid Kenyan M-Pesa number.");
    const phone = parsed.data.mpesaPhone.replace(/^0/, "+254").replace(/^254/, "+254");
    try {
      const request = await transaction(async (tx) => {
        await tx.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [req.user.id]);
        const earned = await tx.query(
          `SELECT COALESCE(sum(t.reward_amount),0)::numeric AS total FROM task_submissions s
            JOIN tasks t ON t.id=s.task_id WHERE s.user_id=$1 AND s.status='approved' AND s.reward_status IN ('queued','paid')`, [req.user.id]);
        const reserved = await tx.query("SELECT COALESCE(sum(amount),0)::numeric AS total FROM withdrawal_requests WHERE user_id=$1 AND status IN ('pending','processing','paid')", [req.user.id]);
        if (Number(earned.rows[0].total) - Number(reserved.rows[0].total) < parsed.data.amount) {
          const error = new Error("Your available balance is not enough for this withdrawal."); error.statusCode = 400; throw error;
        }
        const { rows } = await tx.query(
          "INSERT INTO withdrawal_requests (id,user_id,amount,mpesa_phone) VALUES ($1,$2,$3,$4) RETURNING id,amount,currency,mpesa_phone,status,created_at",
          [randomUUID(), req.user.id, parsed.data.amount, phone]);
        return rows[0];
      });
      return res.status(201).json({ withdrawal: request, message: "Withdrawal request received. Payout is pending processing." });
    } catch (error) {
      if (error.statusCode) return sendError(res, error.statusCode, "WITHDRAWAL_UNAVAILABLE", error.message);
      throw error;
    }
  }));
}

module.exports = { registerTaskRoutes, taskShape, submissionShape };
