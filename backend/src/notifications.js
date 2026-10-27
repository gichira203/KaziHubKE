const { randomUUID } = require("node:crypto");
const { query } = require("./db");
const { iso, requireAuth, route, sendError } = require("./lib");

/** Stored notifications: real events such as applications and moderation. */

function notificationShape(row) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    href: row.href,
    unread: !row.read_at,
    createdAt: iso(row.created_at),
  };
}

async function createNotification(userId, { kind, title, body = "", href = "" }) {
  if (!userId) return null;
  const { rows } = await query(
    `INSERT INTO notifications (id, user_id, kind, title, body, href)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [randomUUID(), userId, kind, title, body, href],
  );
  return rows[0] ?? null;
}

function registerNotificationRoutes(app) {
  app.get(
    "/api/v1/notifications",
    requireAuth,
    route(async (req, res) => {
      const { rows } = await query(
        `SELECT * FROM notifications
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 100`,
        [req.user.id],
      );
      return res.json({
        items: rows.map(notificationShape),
        unread: rows.filter((row) => !row.read_at).length,
      });
    }),
  );

  app.patch(
    "/api/v1/notifications/read-all",
    requireAuth,
    route(async (req, res) => {
      await query(
        "UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL",
        [req.user.id],
      );
      return res.json({ ok: true });
    }),
  );

  app.patch(
    "/api/v1/notifications/:id",
    requireAuth,
    route(async (req, res) => {
      const read = req.body?.read !== false;
      const { rows } = await query(
        `UPDATE notifications
            SET read_at = $3
          WHERE id = $1 AND user_id = $2
          RETURNING *`,
        [req.params.id, req.user.id, read ? new Date() : null],
      );
      if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Notification not found.");
      return res.json({ notification: notificationShape(rows[0]) });
    }),
  );
}

module.exports = { registerNotificationRoutes, createNotification, notificationShape };
