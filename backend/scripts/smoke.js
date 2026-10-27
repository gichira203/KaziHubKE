/**
 * End-to-end API smoke test.
 *
 * Run against a dev server backed by PGlite (or a disposable PostgreSQL):
 *   npm run test:smoke
 *
 * It creates unique accounts, exercises every major flow, and asserts the
 * important permission boundaries. It is safe to run repeatedly; emails are
 * timestamped.
 */

const assert = require("node:assert/strict");

const BASE = process.env.API_URL || "http://localhost:4000/api/v1";
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@kazihub.test";
const ADMIN_PASSWORD =
  process.env.SMOKE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "SmokeAdmin12345";

let passed = 0;
function ok(name) {
  passed += 1;
  console.log(`  ok ${name}`);
}

function makeClient() {
  const jar = new Map();
  return {
    cookieHeader() {
      return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
    },
    store(response) {
      const cookies = response.headers.getSetCookie?.() ?? [];
      for (const cookie of cookies) {
        const [pair] = cookie.split(";");
        const index = pair.indexOf("=");
        const name = pair.slice(0, index);
        const value = pair.slice(index + 1);
        if (!value) jar.delete(name);
        else jar.set(name, value);
      }
    },
    async request(method, path, body) {
      const response = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          ...(body ? { "content-type": "application/json" } : {}),
          ...(jar.size ? { cookie: this.cookieHeader() } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      this.store(response);
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      return { status: response.status, data };
    },
    get(path) {
      return this.request("GET", path);
    },
    post(path, body) {
      return this.request("POST", path, body);
    },
    put(path, body) {
      return this.request("PUT", path, body);
    },
    patch(path, body) {
      return this.request("PATCH", path, body);
    },
    delete(path) {
      return this.request("DELETE", path);
    },
  };
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/health`);
      if (response.ok) return response.json();
    } catch {
      // Server not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("API did not become healthy");
}

async function main() {
  const health = await waitForHealth();
  assert.equal(health.status, "ok");
  assert.equal(health.authStore, "database");
  ok(`health reports database=${health.database}`);

  const stamp = Date.now();
  const seekerEmail = `smoke.seeker.${stamp}@example.test`;
  const employerEmail = `smoke.employer.${stamp}@example.test`;
  const password = "SmokePass1234";

  const seeker = makeClient();
  const employer = makeClient();
  const admin = makeClient();

  // ---- Registration / session -------------------------------------------------
  let res = await seeker.post("/auth/register", {
    firstName: "Smoke",
    lastName: "Seeker",
    email: seekerEmail,
    password,
    accountType: "job-seeker",
  });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  assert.equal(res.data.user.accountType, "job-seeker");
  assert.equal(res.data.user.role, "user");
  ok("job seeker registers and receives a session cookie");

  res = await seeker.get("/auth/me");
  assert.equal(res.status, 200);
  assert.equal(res.data.user.email, seekerEmail);
  ok("session restores the current account");

  res = await seeker.post("/auth/register", {
    firstName: "Dup",
    lastName: "Account",
    email: seekerEmail,
    password,
    accountType: "job-seeker",
  });
  assert.equal(res.status, 409);
  assert.equal(res.data.error.code, "EMAIL_TAKEN");
  ok("duplicate email is rejected");

  res = await employer.post("/auth/register", {
    firstName: "Smoke",
    lastName: "Employer",
    email: employerEmail,
    password,
    accountType: "employer",
  });
  assert.equal(res.status, 201);
  assert.equal(res.data.redirectTo, "/employer/dashboard");
  ok("employer registers");

  // ---- Profiles ---------------------------------------------------------------
  res = await seeker.put("/profile/job-seeker", {
    personal: {
      firstName: "Smoke",
      lastName: "Seeker",
      headline: "Junior frontend developer",
      county: "Nairobi",
      town: "Westlands",
    },
    employment: {
      desiredTitles: ["Frontend Developer"],
      employmentTypes: ["full-time", "remote"],
    },
    skills: { technical: ["React", "TypeScript"] },
    notifications: { profileVisibleToEmployers: true, allowEmployerContact: false },
  });
  assert.equal(res.status, 200, JSON.stringify(res.data));
  ok("job seeker profile is persisted");

  res = await seeker.get("/profile");
  assert.equal(res.data.profile.personal.headline, "Junior frontend developer");
  assert.equal(res.data.visibility.allowEmployerContact, false);
  ok("saved profile round-trips");

  res = await employer.put("/profile/employer", {
    account: { workEmail: employerEmail, password: "must-not-be-stored" },
    company: {
      companyName: "Smoke Test Company",
      organizationType: "Private company",
      industry: "Technology",
      county: "Nairobi",
      city: "Nairobi",
      description: "A company created by the API smoke test.",
    },
    recruitment: { contactName: "Smoke Employer", contactEmail: employerEmail },
  });
  assert.equal(res.status, 200, JSON.stringify(res.data));
  ok("employer company profile is persisted");

  res = await employer.get("/profile");
  assert.equal(res.data.profile.company.companyName, "Smoke Test Company");
  assert.equal(res.data.profile.account.password, undefined);
  ok("passwords are stripped from stored profile JSON");

  // ---- Employer verification + moderation ------------------------------------
  res = await employer.get("/candidates");
  assert.equal(res.status, 403);
  assert.equal(res.data.error.code, "VERIFICATION_REQUIRED");
  ok("unverified employers cannot search candidates");

  res = await employer.post("/employer/verification", { notes: "Incorporation certificate on file" });
  assert.equal(res.status, 200);
  assert.equal(res.data.verification.status, "pending-review");
  ok("employer submits verification");

  res = await employer.post("/employer/jobs", {
    title: "Frontend Developer (Smoke Test)",
    description: "Build accessible interfaces for a growing Kenyan technology team.",
    category: "private",
    employmentType: "Full-time",
    location: "Nairobi",
    remote: true,
    salaryRange: "KES 80,000 - 120,000",
    deadline: "",
    status: "pending-review",
  });
  assert.equal(res.status, 403);
  assert.equal(res.data.error.code, "VERIFICATION_REQUIRED");
  ok("unverified employers cannot submit listings for review");

  res = await employer.post("/employer/jobs", {
    title: "Frontend Developer (Smoke Test)",
    description: "Build accessible interfaces for a growing Kenyan technology team.",
    category: "private",
    employmentType: "Full-time",
    location: "Nairobi",
    remote: true,
    salaryRange: "KES 80,000 - 120,000",
    deadline: "",
    status: "draft",
  });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  const draftJobId = res.data.job.id;
  assert.equal(res.data.job.status, "draft");
  ok("employer creates a draft listing");

  res = await admin.post("/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  assert.equal(res.status, 200, JSON.stringify(res.data));
  assert.equal(res.data.user.role, "admin");
  ok("admin signs in through the normal login endpoint");

  res = await admin.get("/admin/overview");
  assert.equal(res.status, 200);
  assert.ok(res.data.stats.totalUsers >= 3);
  ok("admin overview returns real counts");

  res = await admin.get("/admin/sections/employer-verification");
  assert.equal(res.status, 200);
  const pendingVerification = res.data.section.rows.find((row) => row._id === res.data.section.rows[0]._id);
  assert.ok(pendingVerification);
  ok("admin sees the verification queue");

  res = await admin.post("/admin/actions", {
    section: "employer-verification",
    id: (await employer.get("/auth/me")).data.user.id,
    action: "Approve",
    reason: "Documents verified by smoke test",
  });
  assert.equal(res.status, 200, JSON.stringify(res.data));
  assert.equal(res.data.status, "verified");
  ok("admin approves employer verification (audited)");

  res = await employer.get("/auth/me");
  assert.equal(res.data.user.verificationStatus, "verified");
  ok("verification status is authoritative on the account");

  res = await employer.patch(`/employer/jobs/${draftJobId}`, { status: "pending-review" });
  assert.equal(res.status, 200, JSON.stringify(res.data));
  assert.equal(res.data.job.status, "pending-review");
  ok("verified employer submits a listing for review");

  res = await admin.get("/admin/sections/job-listings");
  assert.ok(res.data.section.rows.some((row) => row._id === draftJobId));
  ok("pending listing appears in the admin queue");

  res = await admin.post("/admin/actions", {
    section: "job-listings",
    id: draftJobId,
    action: "Approve",
    reason: "Looks legitimate",
  });
  assert.equal(res.status, 200);
  ok("admin publishes the listing");

  // ---- Public discovery / applications ---------------------------------------
  res = await makeClient().get("/jobs?query=Smoke%20Test&perPage=10");
  assert.equal(res.status, 200);
  const publicJob = res.data.items.find((job) => job.id === draftJobId);
  assert.ok(publicJob, "published job is publicly listed");
  assert.equal(publicJob.employer, "Smoke Test Company");
  ok("published job appears in public search");

  res = await seeker.post(`/jobs/${draftJobId}/apply`, { coverLetter: "I would like to apply." });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  ok("job seeker applies to a published job");

  res = await seeker.post(`/jobs/${draftJobId}/apply`, { coverLetter: "Again" });
  assert.equal(res.status, 409);
  assert.equal(res.data.error.code, "ALREADY_APPLIED");
  ok("duplicate applications are rejected");

  res = await seeker.post(`/jobs/${draftJobId}/save`);
  assert.equal(res.status, 200);
  res = await seeker.get("/saved-jobs");
  assert.ok(res.data.items.some((job) => job.id === draftJobId));
  ok("seeker saves and lists a job");

  res = await seeker.get("/applications");
  assert.equal(res.data.items.length, 1);
  assert.equal(res.data.items[0].jobId, draftJobId);
  ok("seeker application history is real");

  res = await employer.get("/employer/applications");
  assert.equal(res.status, 200);
  assert.equal(res.data.items.length, 1);
  const applicationId = res.data.items[0].id;
  assert.ok(res.data.items[0].applicantName.includes("Smoke"));
  ok("employer sees the real applicant");

  res = await employer.patch(`/employer/applications/${applicationId}`, { status: "shortlisted" });
  assert.equal(res.status, 200, JSON.stringify(res.data));
  ok("employer updates application status");

  res = await seeker.get("/notifications");
  assert.ok(res.data.items.length >= 1);
  ok("application event produces a stored notification");

  res = await seeker.get("/dashboard/job-seeker");
  assert.equal(res.status, 200);
  assert.equal(res.data.applications[0].status, "shortlisted");
  assert.equal(res.data.profile.personal.headline, "Junior frontend developer");
  ok("seeker dashboard aggregates persisted data");

  res = await employer.get("/dashboard/employer");
  assert.equal(res.status, 200);
  assert.equal(res.data.metrics.activeJobs, 1);
  assert.equal(res.data.metrics.applicationsReceived, 1);
  assert.equal(res.data.verification.status, "verified");
  ok("employer dashboard metrics are real");

  res = await employer.get("/candidates?query=frontend");
  assert.equal(res.status, 200);
  assert.ok(res.data.items.some((candidate) => candidate.headline.includes("frontend")));
  ok("verified employer searches visible candidates");

  // ---- Tasks ------------------------------------------------------------------
  res = await admin.post("/admin/tasks", {
    title: "Smoke test survey",
    platform: "KaziHub research",
    category: "survey",
    action: "Answer the five-question product feedback survey.",
    time: "5 minutes",
    rewardAmount: 150,
    availability: "Open now",
    availabilityState: "open",
  });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  const taskId = res.data.task.id;
  ok("admin creates a real task");

  res = await makeClient().get("/tasks");
  assert.ok(res.data.items.some((task) => task.id === taskId));
  ok("task appears publicly");

  res = await seeker.post(`/tasks/${taskId}/submissions`, { evidence: "Completed with reference #123" });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  const submissionId = res.data.submission.id;
  ok("seeker submits task evidence");

  res = await admin.post("/admin/actions", {
    section: "task-submissions",
    id: submissionId,
    action: "Approve",
    reason: "Evidence checked",
  });
  assert.equal(res.status, 200);
  ok("admin reviews the task submission");

  // ---- Permission boundaries --------------------------------------------------
  res = await seeker.get("/admin/overview");
  assert.equal(res.status, 403);
  ok("non-admin cannot read admin data");

  res = await makeClient().get("/employer/jobs");
  assert.equal(res.status, 401);
  ok("anonymous requests are rejected");

  res = await seeker.post("/auth/logout");
  assert.equal(res.status, 200);
  res = await seeker.get("/auth/me");
  assert.equal(res.status, 401);
  ok("logout clears the session");

  console.log(`\n${passed} smoke checks passed`);
}

main().catch((error) => {
  console.error("\nSmoke test failed:", error.message);
  if (error.actual !== undefined) console.error("actual:", error.actual, "expected:", error.expected);
  process.exitCode = 1;
});
