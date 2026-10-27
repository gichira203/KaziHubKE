"use client";

/**
 * JobPostingForm — prepare a job listing.
 *
 * Save Draft / Preview / Submit for Review are all supported. Publishing is
 * explicitly NOT something this form does: an unverified employer's listing
 * is saved as a draft (or pending-review locally) and the real reason
 * publishing is unavailable is displayed. Nothing is claimed live.
 */
import { useState } from "react";
import Link from "next/link";
import { Eye, FileText, Save, Send } from "lucide-react";
import Button from "@/components/common/Button";
import InputField from "@/components/common/InputField";
import SelectField from "@/components/common/SelectField";
import Textarea from "@/components/common/Textarea";
import TagInput from "@/components/common/TagInput";
import StatusMessage from "@/components/common/StatusMessage";
import { jobCategories, suggestedSkills } from "@/lib/kenya-data";
import { canPublishJob } from "@/lib/permissions";
import { emptyJobDraft, type JobDraft } from "@/lib/job-drafts";
import { apiRequest } from "@/lib/api";
import type { AccountSession } from "@/lib/session";

type JobPostingFormProps = {
  session: AccountSession | null;
  initial?: JobDraft | null;
};

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Industrial attachment",
  "Freelance",
  "Remote",
];

const arrangements = ["remote", "hybrid", "on-site"];

const applicationMethods = [
  "Apply on KaziHub KE",
  "Apply by email",
  "External application link",
];

export default function JobPostingForm({ session, initial }: JobPostingFormProps) {
  const [form, setForm] = useState<JobDraft>(initial ?? emptyJobDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<JobDraft>) => setForm((previous) => ({ ...previous, ...patch }));
  const publish = canPublishJob(session);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Add a job title.";
    if (!form.description.trim()) next.description = "Add a job description.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const persist = async (status: JobDraft["status"]) => {
    if (!validate()) return;
    const category = /government/i.test(form.category) ? "government"
      : /internship/i.test(form.category) ? "internship"
      : /attachment/i.test(form.category) ? "attachment"
      : /online/i.test(form.category) ? "online" : "private";
    const payload = {
      title: form.title,
      description: [form.description, form.responsibilities && `Responsibilities:\n${form.responsibilities}`, form.qualifications && `Qualifications:\n${form.qualifications}`, form.skills.length && `Skills: ${form.skills.join(", ")}`].filter(Boolean).join("\n\n"),
      category,
      employmentType: form.employmentType || "Full-time",
      location: form.location || "Kenya",
      remote: form.arrangement === "remote",
      salaryRange: form.salaryRange,
      deadline: form.deadline || null,
      status,
    };
    setBusy(true);
    setNotice(null);
    try {
      const result = form.id
        ? await apiRequest<{ job: { id: string; status: JobDraft["status"] } }>(`/employer/jobs/${form.id}`, { method: "PATCH", body: JSON.stringify(payload) })
        : await apiRequest<{ job: { id: string; status: JobDraft["status"] } }>("/employer/jobs", { method: "POST", body: JSON.stringify(payload) });
      setForm((current) => ({ ...current, id: result.job.id, status: result.job.status }));
      setNotice(status === "pending-review" ? "Submitted to the platform for moderation. Candidates will see it after it is approved and published." : "Draft saved to your employer account.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Could not save this listing to the platform.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <StatusMessage type="info">
        <strong>Drafts are always safe.</strong>
        <p>
          You can prepare and save a listing now. Publishing requires a verified organization and
          platform moderation — {publish.allowed ? "your organization is verified." : publish.reason}
        </p>
      </StatusMessage>

      <p className="rounded-lg border border-brand/20 bg-success-bg p-3 text-[13px] leading-relaxed text-charcoal">
        Want to pay people to follow, watch, like or comment on social media? Create an <Link className="font-semibold text-brand underline" href="/employer/dashboard/tasks/new">online task campaign</Link> and set its KES reward there.
      </p>

      {notice ? (
        <StatusMessage type="warning">
          <strong>Listing update</strong>
          <p>{notice}</p>
        </StatusMessage>
      ) : null}

      <form
        className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void persist("draft");
        }}
        noValidate
      >
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Listing details</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Job title"
            name="job-title"
            value={form.title}
            onChange={(value) => update({ title: value })}
            placeholder="e.g. Junior Software Developer"
            required
            error={errors.title}
          />
          <SelectField
            label="Employment category"
            name="job-category"
            value={form.category}
            options={jobCategories}
            onChange={(value) => update({ category: value })}
          />
          <SelectField
            label="Employment type"
            name="job-type"
            value={form.employmentType}
            options={employmentTypes}
            onChange={(value) => update({ employmentType: value })}
          />
          <SelectField
            label="Work arrangement"
            name="job-arrangement"
            value={form.arrangement}
            options={arrangements}
            placeholder="Select arrangement"
            onChange={(value) => update({ arrangement: value as JobDraft["arrangement"] })}
          />
          <InputField
            label="Work location"
            name="job-location"
            value={form.location}
            onChange={(value) => update({ location: value })}
            placeholder="e.g. Nairobi, Kenya"
          />
          <InputField
            label="Salary or compensation range"
            name="job-salary"
            value={form.salaryRange}
            onChange={(value) => update({ salaryRange: value })}
            placeholder="e.g. KSh 60,000 – 90,000"
          />
          <InputField
            label="Application deadline"
            name="job-deadline"
            type="date"
            value={form.deadline}
            onChange={(value) => update({ deadline: value })}
          />
          <SelectField
            label="Application method"
            name="job-method"
            value={form.applicationMethod}
            options={applicationMethods}
            onChange={(value) => update({ applicationMethod: value })}
          />
        </div>

        <Textarea
          label="Job description"
          name="job-description"
          value={form.description}
          onChange={(value) => update({ description: value })}
          placeholder="Describe the role, the team and what success looks like."
          rows={5}
          required
          error={errors.description}
        />

        <Textarea
          label="Responsibilities"
          name="job-responsibilities"
          value={form.responsibilities}
          onChange={(value) => update({ responsibilities: value })}
          placeholder="What will this person do day to day?"
          rows={4}
        />

        <Textarea
          label="Required qualifications"
          name="job-qualifications"
          value={form.qualifications}
          onChange={(value) => update({ qualifications: value })}
          placeholder="Education, experience and certifications required."
          rows={4}
        />

        <TagInput
          label="Skills"
          name="job-skills"
          tags={form.skills}
          suggestions={suggestedSkills}
          onChange={(skills) => update({ skills })}
          placeholder="Add a skill and press Enter"
          helperText="Skills help the right candidates find this listing."
        />

        <fieldset className="rounded-lg border border-line bg-surface p-4">
          <legend className="px-1 text-[13.5px] font-semibold text-charcoal">
            Employer contact details
          </legend>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InputField
              label="Contact name"
              name="job-contact-name"
              value={form.contactName}
              onChange={(value) => update({ contactName: value })}
              placeholder="e.g. Jane Wanjiku"
            />
            <InputField
              label="Contact email"
              name="job-contact-email"
              type="email"
              value={form.contactEmail}
              onChange={(value) => update({ contactEmail: value })}
              placeholder="name@company.co.ke"
            />
            <InputField
              label="Contact phone"
              name="job-contact-phone"
              type="tel"
              value={form.contactPhone}
              onChange={(value) => update({ contactPhone: value })}
              placeholder="+254 7…"
            />
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2.5">
          <Button type="submit" variant="primary" disabled={busy}>
            <Save size={15} aria-hidden="true" />
            Save Draft
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              if (validate()) setPreview((previous) => !previous);
            }}
          >
            <Eye size={15} aria-hidden="true" />
            {preview ? "Hide Preview" : "Preview"}
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={busy || !publish.allowed}
            onClick={() => {
              void persist("pending-review").then(() => setPreview(false));
            }}
          >
            <Send size={15} aria-hidden="true" />
            Submit for Review
          </Button>
        </div>
      </form>

      {preview ? (
        <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-bg text-brand">
              <FileText size={17} aria-hidden="true" />
            </span>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Preview</h2>
          </div>
          <h3 className="text-[17px] font-bold text-ink">{form.title || "Untitled listing"}</h3>
          <p className="mt-1 text-[12.5px] text-muted">
            {["Your organization", form.location, form.employmentType]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {form.salaryRange ? (
            <p className="mt-1 text-[12.5px] text-muted">Compensation: {form.salaryRange}</p>
          ) : null}
          {form.deadline ? (
            <p className="mt-1 text-[12.5px] text-muted">
              Deadline: {new Date(form.deadline).toLocaleDateString("en-KE")}
            </p>
          ) : null}
          <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-charcoal">
            {form.description || "No description yet."}
          </p>
          {form.responsibilities ? (
            <>
              <h4 className="mt-3 text-[13px] font-bold text-ink">Responsibilities</h4>
              <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-charcoal">
                {form.responsibilities}
              </p>
            </>
          ) : null}
          {form.qualifications ? (
            <>
              <h4 className="mt-3 text-[13px] font-bold text-ink">Required qualifications</h4>
              <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-charcoal">
                {form.qualifications}
              </p>
            </>
          ) : null}
          {form.skills.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {form.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-[#C8E6D2] bg-success-bg px-2.5 py-1 text-[12px] font-medium text-success"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 border-t border-line pt-3 text-[11.5px] text-muted">
            Preview only — this listing is not published and candidates cannot see it.
          </p>
          <div className="mt-3">
            <Button href="/employer/dashboard/jobs" variant="ghost">
              Go to Manage Jobs
            </Button>
          </div>
        </section>
      ) : null}

      <p className="text-[11.5px] leading-snug text-muted">
        Drafts and moderation requests are saved on your employer account. A listing is public only
        after an administrator approves and publishes it.
      </p>
    </div>
  );
}
