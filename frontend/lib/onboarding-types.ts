/**
 * Shared type definitions for authentication, registration and onboarding.
 *
 * These shapes are the contract between the step components (controlled inputs)
 * and the future backend API. When the API is connected, the same payloads can
 * be POSTed as-is; nothing in these types assumes a real session exists today.
 */

export type AccountType = "job-seeker" | "employer";

export type ContactMethod = "email" | "phone" | "whatsapp";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "attachment"
  | "freelance"
  | "remote";

export type WorkMode = "remote" | "hybrid" | "on-site";

export type StudyStatus = "completed" | "in-progress" | "paused" | "did-not-complete";

export type VerificationStatus =
  | "not-submitted"
  | "pending-review"
  | "verified"
  | "more-info-required"
  | "rejected";

/** Account created with email + password. */
export interface EmailCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountType: AccountType;
  acceptedTerms: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

/* ------------------------------------------------------------------ */
/* Job seeker onboarding                                               */
/* ------------------------------------------------------------------ */

export interface JobSeekerPersonal {
  firstName: string;
  lastName: string;
  headline: string;
  /** Local object URL for the chosen photo. Replaced by an upload URL server-side. */
  photoName: string;
  phone: string;
  country: string;
  county: string;
  town: string;
  preferredContact: ContactMethod;
}

export interface JobSeekerEmployment {
  desiredTitles: string[];
  employmentTypes: EmploymentType[];
  industries: string[];
  locations: string[];
  workMode: WorkMode | "";
  salaryRange: string;
  availability: string;
  firstJobSeeker: boolean;
}

export interface EducationEntry {
  id: string;
  institution: string;
  qualification: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  status: StudyStatus;
  achievements: string;
}

export interface ExperienceEntry {
  id: string;
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
  achievements: string;
  skills: string[];
}

export interface JobSeekerSkills {
  technicalSkills: string[];
  professionalSkills: string[];
  languages: string[];
  certifications: string[];
  training: string[];
  portfolioUrl: string;
  githubUrl: string;
}

/** The CV step stores metadata only — file contents never go to localStorage. */
export type CvMethod = "manual" | "upload" | "build";

export interface JobSeekerCv {
  method: CvMethod;
  /** File name + size for the uploaded file. Contents stay in browser memory only. */
  upload: {
    fileName: string;
    fileSize: number;
    /** Private Neon Object Storage key returned by the authenticated API. */
    storageKey?: string;
    uploadedAt: string;
    /** Parsed preview awaiting user review; never auto-imported. */
    parsedSummary: string;
    reviewed: boolean;
  } | null;
  /** Structured manual/builder CV content. */
  professionalSummary: string;
  projects: string;
  references: string;
  draftSavedAt: string;
}

export interface JobSeekerNotifications {
  profileVisibleToEmployers: boolean;
  allowEmployerContact: boolean;
  jobAlertEmails: boolean;
  preferredCategories: string[];
  preferredLocations: string[];
  frequency: "daily" | "weekly" | "monthly";
}

export interface JobSeekerDraft {
  personal: JobSeekerPersonal;
  employment: JobSeekerEmployment;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  /** True when the user has explicitly said they have no formal experience. */
  noExperience: boolean;
  skills: JobSeekerSkills;
  cv: JobSeekerCv;
  notifications: JobSeekerNotifications;
}

/* ------------------------------------------------------------------ */
/* Employer onboarding                                                 */
/* ------------------------------------------------------------------ */

export interface EmployerAccount {
  firstName: string;
  lastName: string;
  workEmail: string;
  phone: string;
  /** Registration only — never persisted to a draft. */
  password: string;
  confirmPassword: string;
}

export interface EmployerCompany {
  companyName: string;
  organizationType: string;
  industry: string;
  website: string;
  companySize: string;
  country: string;
  county: string;
  city: string;
  description: string;
  logoName: string;
}

export interface EmployerRecruitment {
  hiringCategories: string[];
  typicalPositions: string[];
  hiringLocations: string[];
  workMode: WorkMode | "";
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface EmployerVerification {
  status: VerificationStatus;
  submittedAt: string;
  /** Company registration certificate etc. — request only when required. */
  documentName: string;
  documentSize: number;
  notes: string;
}

export interface EmployerDraft {
  account: EmployerAccount;
  company: EmployerCompany;
  recruitment: EmployerRecruitment;
  verification: EmployerVerification;
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

export function emptyJobSeekerDraft(): JobSeekerDraft {
  return {
    personal: {
      firstName: "",
      lastName: "",
      headline: "",
      photoName: "",
      phone: "",
      country: "Kenya",
      county: "",
      town: "",
      preferredContact: "email",
    },
    employment: {
      desiredTitles: [],
      employmentTypes: [],
      industries: [],
      locations: [],
      workMode: "",
      salaryRange: "",
      availability: "",
      firstJobSeeker: false,
    },
    education: [],
    experience: [],
    noExperience: false,
    skills: {
      technicalSkills: [],
      professionalSkills: [],
      languages: [],
      certifications: [],
      training: [],
      portfolioUrl: "",
      githubUrl: "",
    },
    cv: {
      method: "manual",
      upload: null,
      professionalSummary: "",
      projects: "",
      references: "",
      draftSavedAt: "",
    },
    notifications: {
      profileVisibleToEmployers: true,
      allowEmployerContact: false,
      jobAlertEmails: false,
      preferredCategories: [],
      preferredLocations: [],
      frequency: "weekly",
    },
  };
}

export function emptyEmployerDraft(): EmployerDraft {
  return {
    account: {
      firstName: "",
      lastName: "",
      workEmail: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    company: {
      companyName: "",
      organizationType: "",
      industry: "",
      website: "",
      companySize: "",
      country: "Kenya",
      county: "",
      city: "",
      description: "",
      logoName: "",
    },
    recruitment: {
      hiringCategories: [],
      typicalPositions: [],
      hiringLocations: [],
      workMode: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
    verification: {
      status: "not-submitted",
      submittedAt: "",
      documentName: "",
      documentSize: 0,
      notes: "",
    },
  };
}

/** Row ids for repeatable lists (education / experience). */
export function createRowId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
