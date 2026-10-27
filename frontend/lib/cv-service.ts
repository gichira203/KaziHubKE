import { apiBaseUrl } from "./auth-config";
import { apiRequest } from "./api";
import type { EducationEntry, ExperienceEntry, JobSeekerDraft, JobSeekerSkills } from "./onboarding-types";

export type CvAutofill = {
  personal: Partial<Pick<JobSeekerDraft["personal"], "headline" | "phone" | "county" | "town">>;
  employment: Partial<Pick<JobSeekerDraft["employment"], "desiredTitles" | "industries">>;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: Partial<JobSeekerSkills>;
  professionalSummary: string;
  source: "ai" | "text-extraction";
};

export async function uploadCvFile(file: File): Promise<string> {
  if (!apiBaseUrl) throw new Error("CV uploads need the KaziHub API connection.");
  const response = await fetch(`${apiBaseUrl}/storage/cv`, {
    method: "PUT", credentials: "include",
    headers: { "content-type": "application/octet-stream", "x-file-content-type": file.type }, body: file,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || "CV upload failed.");
  if (typeof payload.key !== "string") throw new Error("The CV upload did not return a storage key.");
  return payload.key;
}

export function autofillFromCv(storageKey: string) {
  return apiRequest<{ profile: CvAutofill; aiAvailable: boolean; textLength: number }>("/storage/cv/parse", {
    method: "POST", body: JSON.stringify({ key: storageKey }),
  });
}

/** Fill empty profile fields only; preserve details the user already entered. */
export function mergeCvAutofill(draft: JobSeekerDraft, suggestions: CvAutofill): JobSeekerDraft {
  const fill = (current: string, suggested?: string) => current.trim() ? current : suggested?.trim() ?? "";
  const list = (current: string[], suggested?: string[]) => current.length ? current : suggested ?? [];
  return {
    ...draft,
    personal: {
      ...draft.personal,
      headline: fill(draft.personal.headline, suggestions.personal.headline),
      phone: fill(draft.personal.phone, suggestions.personal.phone),
      county: fill(draft.personal.county, suggestions.personal.county),
      town: fill(draft.personal.town, suggestions.personal.town),
    },
    employment: {
      ...draft.employment,
      desiredTitles: list(draft.employment.desiredTitles, suggestions.employment.desiredTitles),
      industries: list(draft.employment.industries, suggestions.employment.industries),
    },
    education: draft.education.length ? draft.education : suggestions.education,
    experience: draft.experience.length ? draft.experience : suggestions.experience,
    skills: {
      ...draft.skills,
      technicalSkills: list(draft.skills.technicalSkills, suggestions.skills.technicalSkills),
      professionalSkills: list(draft.skills.professionalSkills, suggestions.skills.professionalSkills),
      languages: list(draft.skills.languages, suggestions.skills.languages),
      certifications: list(draft.skills.certifications, suggestions.skills.certifications),
      training: list(draft.skills.training, suggestions.skills.training),
    },
    cv: { ...draft.cv, professionalSummary: fill(draft.cv.professionalSummary, suggestions.professionalSummary) },
  };
}
