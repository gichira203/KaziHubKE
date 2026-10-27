const { z } = require("zod");
const { query } = require("./db");
const {
  audit,
  iso,
  requireAccountType,
  requireAuth,
  route,
  sendError,
} = require("./lib");
const { createNotification } = require("./notifications");

/**
 * Profiles: job-seeker CV/profile data, employer company data, verification
 * submission, and the employer candidate directory.
 *
 * Profile payloads are stored as JSONB because the onboarding draft is a rich
 * nested document. Searchable fields are copied into columns so candidate
 * search stays a normal SQL query. Passwords are stripped before storage.
 */

const text = (value, fallback = "") =>
  typeof value === "string" ? value.trim().slice(0, 4000) : fallback;

const stringList = (value, limit = 100) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim().slice(0, 200)).slice(0, limit)
    : [];

function objectBody(req) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  return body.profile && typeof body.profile === "object" ? body.profile : body;
}

function sanitizeEmployerDraft(draft) {
  const copy = JSON.parse(JSON.stringify(draft || {}));
  if (copy.account && typeof copy.account === "object") {
    delete copy.account.password;
    delete copy.account.confirmPassword;
  }
  return copy;
}

async function getJobSeekerProfile(userId) {
  const { rows } = await query(
    `SELECT data, profile_visible, allow_employer_contact, updated_at
       FROM job_seeker_profiles WHERE user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

async function getEmployerProfile(userId) {
  const { rows } = await query(
    `SELECT * FROM employer_profiles WHERE user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

function employerPublicShape(row) {
  if (!row) return null;
  return {
    companyName: row.company_name,
    organizationType: row.organization_type,
    industry: row.industry,
    website: row.website,
    companySize: row.company_size,
    country: row.country,
    county: row.county,
    city: row.city,
    description: row.description,
    logoUrl: row.logo_url,
    verificationStatus: row.verification_status,
  };
}

async function requireVerifiedEmployer(req, res, next) {
  try {
    if (req.user.account_type !== "employer") {
      return sendError(res, 403, "FORBIDDEN", "Only employer accounts can do that.");
    }
    const profile = await getEmployerProfile(req.user.id);
    if (!profile || profile.verification_status !== "verified") {
      return sendError(
        res,
        403,
        "VERIFICATION_REQUIRED",
        "Your organization must be verified before you can search candidates.",
      );
    }
    req.employerProfile = profile;
    return next();
  } catch (error) {
    return next(error);
  }
}

function registerProfileRoutes(app) {
  /** Current account plus its saved profile. */
  app.get(
    "/api/v1/profile",
    requireAuth,
    route(async (req, res) => {
      if (req.user.account_type === "employer") {
        const row = await getEmployerProfile(req.user.id);
        return res.json({
          profile: row?.data ?? null,
          company: employerPublicShape(row),
          verification: {
            status: row?.verification_status ?? "not-started",
            note: row?.verification_note ?? "",
            submittedAt: iso(row?.verification_submitted_at),
          },
          updatedAt: iso(row?.updated_at),
        });
      }
      if (req.user.account_type === "admin") return res.json({ profile: null });
      const row = await getJobSeekerProfile(req.user.id);
      return res.json({
        profile: row?.data ?? null,
        visibility: {
          profileVisibleToEmployers: row?.profile_visible ?? true,
          allowEmployerContact: row?.allow_employer_contact ?? false,
        },
        updatedAt: iso(row?.updated_at),
      });
    }),
  );

  app.put(
    "/api/v1/profile/job-seeker",
    requireAuth,
    requireAccountType("job-seeker"),
    route(async (req, res) => {
      const draft = objectBody(req);
      if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
        return sendError(res, 400, "VALIDATION_ERROR", "Send the profile as a JSON object.");
      }

      const personal = draft.personal ?? {};
      const employment = draft.employment ?? {};
      const notifications = draft.notifications ?? {};
      const profileVisible = notifications.profileVisibleToEmployers !== false;
      const allowContact = notifications.allowEmployerContact === true;

      const { rows } = await query(
        `INSERT INTO job_seeker_profiles
           (user_id, headline, county, town, desired_titles, employment_types,
            skills, data, profile_visible, allow_employer_contact, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, now())
         ON CONFLICT (user_id) DO UPDATE SET
           headline = EXCLUDED.headline,
           county = EXCLUDED.county,
           town = EXCLUDED.town,
           desired_titles = EXCLUDED.desired_titles,
           employment_types = EXCLUDED.employment_types,
           skills = EXCLUDED.skills,
           data = EXCLUDED.data,
           profile_visible = EXCLUDED.profile_visible,
           allow_employer_contact = EXCLUDED.allow_employer_contact,
           updated_at = now()
         RETURNING updated_at`,
        [
          req.user.id,
          text(personal.headline),
          text(personal.county),
          text(personal.town),
          stringList(employment.desiredTitles),
          stringList(employment.employmentTypes),
          JSON.stringify(draft.skills ?? {}),
          JSON.stringify(draft),
          profileVisible,
          allowContact,
        ],
      );

      return res.json({ ok: true, updatedAt: iso(rows[0]?.updated_at) });
    }),
  );

  app.put(
    "/api/v1/profile/employer",
    requireAuth,
    requireAccountType("employer"),
    route(async (req, res) => {
      const draft = sanitizeEmployerDraft(objectBody(req));
      if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
        return sendError(res, 400, "VALIDATION_ERROR", "Send the profile as a JSON object.");
      }
      const company = draft.company ?? {};
      const recruitment = draft.recruitment ?? {};

      const firstName = text(draft.account?.firstName, "");
      const lastName = text(draft.account?.lastName, "");
      if (firstName && lastName) {
        await query(
          "UPDATE users SET first_name = $2, last_name = $3, updated_at = now() WHERE id = $1 AND account_type = 'employer'",
          [req.user.id, firstName, lastName],
        );
      }

      const { rows } = await query(
        `INSERT INTO employer_profiles
           (user_id, company_name, organization_type, industry, website, company_size,
            country, county, city, description, logo_url, contact_name, contact_email,
            contact_phone, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, now())
         ON CONFLICT (user_id) DO UPDATE SET
           company_name = EXCLUDED.company_name,
           organization_type = EXCLUDED.organization_type,
           industry = EXCLUDED.industry,
           website = EXCLUDED.website,
           company_size = EXCLUDED.company_size,
           country = EXCLUDED.country,
           county = EXCLUDED.county,
           city = EXCLUDED.city,
           description = EXCLUDED.description,
           logo_url = EXCLUDED.logo_url,
           contact_name = EXCLUDED.contact_name,
           contact_email = EXCLUDED.contact_email,
           contact_phone = EXCLUDED.contact_phone,
           data = EXCLUDED.data,
           updated_at = now()
         RETURNING verification_status, verification_note, verification_submitted_at, updated_at`,
        [
          req.user.id,
          text(company.companyName),
          text(company.organizationType),
          text(company.industry),
          text(company.website),
          text(company.companySize),
          text(company.country, "Kenya"),
          text(company.county),
          text(company.city),
          text(company.description),
          text(company.logoName),
          text(recruitment.contactName),
          text(recruitment.contactEmail),
          text(recruitment.contactPhone),
          JSON.stringify(draft),
        ],
      );

      const row = rows[0];
      return res.json({
        ok: true,
        verification: {
          status: row?.verification_status ?? "not-started",
          note: row?.verification_note ?? "",
          submittedAt: iso(row?.verification_submitted_at),
        },
        updatedAt: iso(row?.updated_at),
      });
    }),
  );

  /** Submit (or re-submit) the organization for review. */
  app.post(
    "/api/v1/employer/verification",
    requireAuth,
    requireAccountType("employer"),
    route(async (req, res) => {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const submission = body.submission && typeof body.submission === "object" ? body.submission : {};
      const profile = await getEmployerProfile(req.user.id);
      if (!profile) {
        return sendError(res, 400, "PROFILE_REQUIRED", "Save your company profile before requesting verification.");
      }
      if (!profile.company_name) {
        return sendError(res, 400, "PROFILE_REQUIRED", "Add your organization name before requesting verification.");
      }
      if (profile.verification_status === "verified") {
        return res.json({
          ok: true,
          verification: {
            status: "verified",
            note: profile.verification_note,
            submittedAt: iso(profile.verification_submitted_at),
          },
        });
      }

      const documentKey = text(submission.documentKey);
      if (documentKey && (!documentKey.startsWith(`users/${req.user.id}/verification/`) || documentKey.includes(".."))) {
        return sendError(res, 400, "INVALID_DOCUMENT", "Upload your supporting document again before submitting.");
      }
      const verificationData = {
        ...(profile.data?.verification && typeof profile.data.verification === "object" ? profile.data.verification : {}),
        legalName: text(submission.legalName),
        organizationType: text(submission.organizationType),
        representativeName: text(submission.representativeName),
        representativeRole: text(submission.representativeRole),
        officialEmail: text(submission.officialEmail),
        website: text(submission.website),
        registrationNumber: text(submission.registrationNumber),
        documentName: text(submission.documentName),
        documentKey,
      };

      const { rows } = await query(
        `UPDATE employer_profiles
            SET verification_status = 'pending-review',
                verification_note = '',
                verification_submitted_at = now(),
                data = jsonb_set(data, '{verification}', $2::jsonb, true),
                updated_at = now()
          WHERE user_id = $1
          RETURNING verification_status, verification_note, verification_submitted_at`,
        [req.user.id, JSON.stringify(verificationData)],
      );
      const row = rows[0];
      await audit(req.user.id, "employer.verification.pending-review", "user", req.user.id, {
        documentProvided: Boolean(documentKey),
      });
      await createNotification(req.user.id, {
        kind: "verification",
        title: "Employer verification submitted",
        body: "Your organization details are waiting for administrator review.",
        href: "/employer/dashboard/verification",
      });
      return res.json({
        ok: true,
        verification: {
          status: row.verification_status,
          note: row.verification_note,
          submittedAt: iso(row.verification_submitted_at),
        },
      });
    }),
  );

  /** Public company profile shown on a job listing. */
  app.get(
    "/api/v1/employers/:id",
    route(async (req, res) => {
      const { rows } = await query(
        `SELECT ep.*, u.status
           FROM employer_profiles ep
           JOIN users u ON u.id = ep.user_id
          WHERE ep.user_id = $1 AND u.status = 'active'`,
        [req.params.id],
      );
      if (!rows[0]) return sendError(res, 404, "NOT_FOUND", "Employer not found.");
      return res.json({ employer: employerPublicShape(rows[0]) });
    }),
  );

  /** Candidate directory — verified employers only, visible profiles only. */
  app.get(
    "/api/v1/candidates",
    requireAuth,
    requireVerifiedEmployer,
    route(async (req, res) => {
      const search = text(req.query.query, "").toLowerCase();
      const county = text(req.query.county);
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const perPage = Math.min(50, Math.max(1, Number.parseInt(req.query.perPage, 10) || 12));

      const params = [];
      const conditions = [
        "u.account_type = 'job-seeker'",
        "u.status = 'active'",
        "p.profile_visible = true",
      ];

      if (search) {
        params.push(`%${search}%`);
        conditions.push(
          `(lower(p.headline) LIKE $${params.length}
            OR lower(p.county) LIKE $${params.length}
            OR lower(p.data->'personal'->>'firstName') LIKE $${params.length}
            OR lower(p.data->'personal'->>'lastName') LIKE $${params.length}
            OR lower(p.skills::text) LIKE $${params.length})`,
        );
      }
      if (county) {
        params.push(county);
        conditions.push(`lower(p.county) = lower($${params.length})`);
      }

      const where = conditions.join(" AND ");
      const countResult = await query(
        `SELECT count(*)::int AS total
           FROM job_seeker_profiles p
           JOIN users u ON u.id = p.user_id
          WHERE ${where}`,
        params,
      );
      const total = countResult.rows[0]?.total ?? 0;

      params.push(perPage, (page - 1) * perPage);
      const { rows } = await query(
        `SELECT u.id, p.headline, p.county, p.town, p.skills, p.allow_employer_contact,
                p.data->'personal'->>'firstName' AS first_name,
                p.data->'personal'->>'lastName' AS last_name,
                p.data->'experience' AS experience,
                p.data->'education' AS education,
                p.updated_at
           FROM job_seeker_profiles p
           JOIN users u ON u.id = p.user_id
          WHERE ${where}
          ORDER BY p.updated_at DESC
          LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      );

      const items = rows.map((row) => ({
        id: row.id,
        name: [row.first_name, row.last_name].filter(Boolean).join(" ") || "Candidate",
        headline: row.headline,
        county: row.county,
        town: row.town,
        skills: row.skills ?? {},
        experienceCount: Array.isArray(row.experience) ? row.experience.length : 0,
        educationCount: Array.isArray(row.education) ? row.education.length : 0,
        contactAllowed: row.allow_employer_contact,
        updatedAt: iso(row.updated_at),
      }));

      return res.json({ items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) });
    }),
  );

  app.get(
    "/api/v1/candidates/:id",
    requireAuth,
    requireVerifiedEmployer,
    route(async (req, res) => {
      const { rows } = await query(
        `SELECT u.id, u.email, p.headline, p.county, p.town, p.skills, p.data,
                p.allow_employer_contact, p.updated_at
           FROM job_seeker_profiles p
           JOIN users u ON u.id = p.user_id
          WHERE p.user_id = $1 AND p.profile_visible = true
            AND u.account_type = 'job-seeker' AND u.status = 'active'`,
        [req.params.id],
      );
      const row = rows[0];
      if (!row) return sendError(res, 404, "NOT_FOUND", "Candidate not found or profile is private.");
      const data = row.data ?? {};
      return res.json({
        candidate: {
          id: row.id,
          name: [data.personal?.firstName, data.personal?.lastName].filter(Boolean).join(" "),
          headline: row.headline,
          county: row.county,
          town: row.town,
          skills: row.skills ?? {},
          education: data.education ?? [],
          experience: data.experience ?? [],
          summary: data.cv?.professionalSummary ?? "",
          contact: row.allow_employer_contact ? { email: row.email } : null,
          updatedAt: iso(row.updated_at),
        },
      });
    }),
  );
}

module.exports = {
  registerProfileRoutes,
  getEmployerProfile,
  getJobSeekerProfile,
  requireVerifiedEmployer,
};
