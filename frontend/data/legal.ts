/**
 * Content for the legal and trust pages: Privacy Policy, Terms of Service,
 * Community Guidelines and Safety. Copy lives outside the page components.
 * References Kenya's Data Protection Act, No. 24 of 2019.
 */

export type LegalSection = {
  heading: string;
  items: string[];
};

export const legalUpdated = "Last updated: 15 October 2026";

/* ------------------------------------------------------------------ */
/* Privacy Policy                                                      */
/* ------------------------------------------------------------------ */

export const privacySections: LegalSection[] = [
  {
    heading: "What this policy covers",
    items: [
      "This policy explains what personal data KaziHub KE collects, why we collect it, how long we keep it and the rights you have over it. It applies to the KaziHub KE website, dashboards and related communications.",
      "We process personal data in line with the Data Protection Act, No. 24 of 2019 (Kenya) and its regulations, and we only collect data we have a justified reason to hold.",
    ],
  },
  {
    heading: "Data we collect",
    items: [
      "Account data: your name, email address, account type (job seeker or employer) and authentication credentials. Passwords are stored only as secure hashes — never in readable form.",
      "Profile data: information you choose to add — education, work experience, skills, certifications, preferences and location.",
      "Application data: the jobs, internships or tasks you apply for, and the status of those applications.",
      "Documents: CVs and verification documents you upload. These are stored as private objects and are only accessible to you and, for active applications, the relevant employer or authorized reviewer.",
      "Technical data: basic server logs needed to operate and secure the service, such as request time and error records.",
    ],
  },
  {
    heading: "Why we use it",
    items: [
      "To create and secure your account, and to verify your email address.",
      "To operate the platform: showing you relevant opportunities, tracking your applications and delivering notifications you have opted into.",
      "To let employers review applications and CVs for vacancies you applied to.",
      "To verify employer organizations and to review task submissions and reported content.",
      "To meet legal obligations and to investigate misuse of the platform.",
    ],
  },
  {
    heading: "Profile visibility",
    items: [
      "Your profile is not public by default. CVs are never publicly listed and are not shared with employers except for active applications you submitted.",
      "Visibility controls in your settings let you limit what is discoverable. Some fields — such as your email address — are never shown publicly.",
    ],
  },
  {
    heading: "How long we keep data",
    items: [
      "Account and profile data is kept while your account is active.",
      "Application and task records are kept for as long as needed to operate the service and resolve disputes, after which they are deleted or anonymized.",
      "Verification documents are kept only as long as needed to complete the verification review and meet record-keeping obligations.",
      "You can request deletion of your account and associated data at any time, subject to records we are required by law to retain.",
    ],
  },
  {
    heading: "Your rights",
    items: [
      "Access: ask us what personal data we hold about you.",
      "Correction: ask us to correct inaccurate or incomplete data.",
      "Deletion: ask us to delete your account and personal data, subject to legal retention requirements.",
      "Objection and consent: you can withdraw consent for optional processing, such as job alert emails, at any time.",
      "Complaints: you may lodge a complaint with the Office of the Data Protection Commissioner of Kenya.",
    ],
  },
  {
    heading: "Security",
    items: [
      "Documents are stored as private objects with access restricted to authorized users, and sensitive administrative actions are logged.",
      "No system is perfect. If a data incident affecting you occurs, we will notify you and the relevant regulator as required by law.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Terms of Service                                                    */
/* ------------------------------------------------------------------ */

export const termsSections: LegalSection[] = [
  {
    heading: "Accepting these terms",
    items: [
      "By creating an account or using KaziHub KE, you agree to these terms. If you do not agree, do not use the platform.",
      "We may update these terms as the platform evolves. Material changes will be announced on the platform, and continued use after an update means you accept the revised terms.",
    ],
  },
  {
    heading: "Who can use KaziHub KE",
    items: [
      "You must be at least 18 years old to hold an account, or have the consent of a parent or guardian where permitted by law.",
      "You must provide accurate information about yourself or the organization you represent, and keep it current.",
      "One person may not hold multiple job seeker accounts, and organizations may not impersonate another employer.",
    ],
  },
  {
    heading: "Opportunities and listings",
    items: [
      "KaziHub KE aggregates and hosts listings submitted by employers and curated categories. We do not employ candidates and we do not act as a party to any employment relationship.",
      "We do not guarantee that any listing is accurate, current or an official vacancy — including government listings, which are informational unless the source has been checked and documented.",
      "It is your responsibility to verify any opportunity before sharing personal data, paying money or travelling for an interview.",
    ],
  },
  {
    heading: "Applications, tasks and rewards",
    items: [
      "Submitting an application does not guarantee an interview, an offer or employment.",
      "Online tasks state their instructions, eligibility and reward terms. Completing an action does not by itself confirm a reward: submissions are reviewed before any reward is approved.",
      "Fraudulent submissions — including fake evidence, duplicate accounts or automated tooling — may lead to rejection and account suspension.",
    ],
  },
  {
    heading: "Acceptable use",
    items: [
      "Do not post false, misleading, discriminatory or fraudulent content; do not scrape the platform at scale; do not attempt to bypass security controls or access other users' data.",
      "Do not use KaziHub KE to recruit for pyramid schemes, unlicensed financial services, or any activity prohibited by Kenyan law.",
    ],
  },
  {
    heading: "Accounts, suspension and liability",
    items: [
      "We may suspend or terminate accounts that breach these terms, with the reason recorded. You can close your account at any time from your settings.",
      "KaziHub KE is provided on an as-is basis. To the extent permitted by law, we are not liable for decisions employers make about candidates, or for losses arising from interactions that begin on the platform.",
      "These terms are governed by the laws of Kenya.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Community Guidelines                                                */
/* ------------------------------------------------------------------ */

export const guidelineSections: LegalSection[] = [
  {
    heading: "Be honest",
    items: [
      "Use your real identity and real organization details. Do not impersonate people, employers or public bodies.",
      "Do not inflate qualifications, fabricate experience or submit false evidence for tasks.",
    ],
  },
  {
    heading: "Be respectful",
    items: [
      "Communicate professionally with candidates and employers. Harassment, hate speech and abusive language are not tolerated anywhere on the platform.",
      "Do not contact candidates for purposes unrelated to the vacancy they applied for.",
    ],
  },
  {
    heading: "Keep money out of applications",
    items: [
      "Legitimate employers on KaziHub KE do not charge candidates for applying, being shortlisted or being hired.",
      "Never send money for a job, a task or a “registration fee”. Report anyone who asks.",
    ],
  },
  {
    heading: "Play fair with tasks",
    items: [
      "One qualifying account per person; no bots, emulators or bulk sign-ups.",
      "Follows, views and engagement must remain active for the full period stated in the task.",
    ],
  },
  {
    heading: "Consequences",
    items: [
      "Violations can lead to content removal, rejected submissions, suspended accounts and — for fraud — referral to the relevant authorities.",
      "Decisions are recorded with reasons, and you can appeal through the Help Centre.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Safety and Reporting                                                */
/* ------------------------------------------------------------------ */

export const safetySigns: string[] = [
  "You are asked to pay a fee — for registration, training, shortlisting or equipment — before you can work.",
  "The offer arrives unusually fast, with no interview, and pressures you to act immediately.",
  "Communication moves to personal messaging apps and the “employer” avoids verifiable contact details.",
  "You are asked for your national ID, PIN, bank credentials or one-time codes as part of “onboarding”.",
  "The listing copies an official announcement but the application link or contact is unofficial.",
  "A task asks you to pay to “unlock” higher-paying work or to deposit funds first.",
];

export const safetyPractices: string[] = [
  "Research the organization before applying: website, reviews, and whether it actually exists.",
  "Never pay money to get a job, a task or a reward. KaziHub KE never asks candidates for payment.",
  "Keep official correspondence on the platform where possible, so there is a record.",
  "Protect your credentials: KaziHub KE staff will never ask for your password or PIN.",
  "Check that any government listing matches the hiring body's own official announcement before applying.",
];

export const reportingSteps: string[] = [
  "Use the report option on the listing, task or profile where you saw the content.",
  "Or email our team with the link, what happened and when. Reporter details are restricted to authorized reviewers.",
  "Reports are triaged by priority. Content that poses immediate financial risk to users is removed first, pending review.",
  "You will be able to follow the outcome of your report where the resolution affects you.",
];
