/**
 * Content for the public informational pages: About, How It Works,
 * Services, Contact and the Help Centre. Copy lives outside the page
 * components so pages stay presentational.
 */

export type InfoSection = {
  heading: string;
  paragraphs: string[];
};

/* ------------------------------------------------------------------ */
/* About Us                                                            */
/* ------------------------------------------------------------------ */

export const aboutSections: InfoSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "KaziHub KE is a Kenyan platform that brings jobs, internships, industrial attachments, government vacancies, remote work and eligible online microtasks into one place — built for job seekers, students, employers and anyone looking for legitimate digital work.",
      "We know how fragmented opportunity-hunting can be: vacancies scattered across noticeboards, county portals, company careers pages and social media. KaziHub KE gives you one searchable place to find them and one dashboard to track what you have applied for.",
    ],
  },
  {
    heading: "What we do",
    paragraphs: [
      "We list opportunities by category so a nursing student looking for an attachment, a developer looking for remote work and a first-time job seeker all find what fits. Employers can register, complete a company profile, go through verification and post vacancies — subject to the platform's moderation rules.",
      "Online tasks are eligible digital microtasks — for example engaging with participating creator content, completing surveys or helping test products. Every task shows its action, time requirement, eligibility rules and reward terms before you commit.",
    ],
  },
  {
    heading: "How we stay honest",
    paragraphs: [
      "KaziHub KE never guarantees employment, and never guarantees earnings from tasks. Listing previews on this site currently use clearly-labelled demonstration data; live listings appear here once employer-submitted vacancies are moderated and published.",
      "Verification means an employer has submitted the required business information for review — it is a status, not a KaziHub KE endorsement. Government listings are informational only: we never claim a listing is an official vacancy unless the source has been checked and documented.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* How It Works                                                        */
/* ------------------------------------------------------------------ */

export const seekerSteps: { title: string; text: string }[] = [
  {
    title: "Create your account",
    text: "Register as a job seeker with your email. You land on your dashboard immediately — nothing forces you to finish your profile before you can look around.",
  },
  {
    title: "Complete your profile",
    text: "Add your education, experience, skills and preferences, and upload or build a CV. A checklist shows what is still missing; your progress is saved as you go.",
  },
  {
    title: "Discover and apply",
    text: "Search by category, location and employment type. Open a listing to read the full details, then apply and track the status from your dashboard.",
  },
  {
    title: "Pick up online tasks",
    text: "Browse eligible microtasks with their instructions, eligibility rules and reward terms. Submit your evidence and follow the review status — rewards are only confirmed after review.",
  },
];

export const employerSteps: { title: string; text: string }[] = [
  {
    title: "Register as an employer",
    text: "Choose the employer account type. You reach the employer dashboard straight away, with a setup checklist waiting for you.",
  },
  {
    title: "Set up your company profile",
    text: "Add your organization details, industry, location and recruitment contact, and upload your logo.",
  },
  {
    title: "Start verification",
    text: "Submit the required business information for review. Verification status is decided by a reviewer — never by the account itself.",
  },
  {
    title: "Post and manage vacancies",
    text: "Draft your listing, preview it, then submit it for moderation. Once published, review applications and manage candidates from one place.",
  },
];

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const serviceGroups: { title: string; items: string[] }[] = [
  {
    title: "For job seekers",
    items: [
      "Job discovery across private, government, internship and attachment listings",
      "Profile builder with education, experience, skills and certifications",
      "CV upload (PDF or DOCX) or an in-platform CV builder",
      "Application tracking with status updates and notifications",
      "Job alerts matched to your preferences",
    ],
  },
  {
    title: "For students and graduates",
    items: [
      "Internship and industrial attachment listings",
      "First-job-seeker profile support",
      "CV guidance so a thin work history still reads well",
    ],
  },
  {
    title: "For employers",
    items: [
      "Company profiles with verification status",
      "Job posting with draft, preview and moderation workflow",
      "Applicant management: shortlist, stage and update statuses",
      "Candidate search, subject to platform rules",
    ],
  },
  {
    title: "Online opportunities",
    items: [
      "Eligible social media and creator microtasks",
      "Surveys, testing and research tasks",
      "Transparent task instructions, eligibility and reward terms",
      "Submission review before any reward is confirmed",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export const contactReasons: { title: string; text: string }[] = [
  {
    title: "General enquiries",
    text: "Questions about the platform, partnerships or press.",
  },
  {
    title: "Account help",
    text: "Trouble registering, verifying your email or accessing your dashboard.",
  },
  {
    title: "Report a listing or account",
    text: "Suspicious vacancies, fraudulent employers, misleading tasks or impersonation.",
  },
  {
    title: "Employer support",
    text: "Verification questions, posting issues or application management.",
  },
];

/* ------------------------------------------------------------------ */
/* Help Centre                                                         */
/* ------------------------------------------------------------------ */

export const helpTopics: { title: string; entries: { q: string; a: string }[] }[] = [
  {
    title: "Accounts and access",
    entries: [
      {
        q: "Do I need an account to browse opportunities?",
        a: "No. Browsing and reading full listings is open to everyone. You need a free account to apply, save preferences or take part in tasks.",
      },
      {
        q: "Which account type should I choose?",
        a: "Job seeker if you are looking for work, internships, attachments or tasks. Employer if you represent an organization that wants to post vacancies.",
      },
      {
        q: "I did not receive my verification email.",
        a: "Check your spam or promotions folder, then confirm the address you registered with. Verification links can be re-sent from the verification page in your dashboard.",
      },
    ],
  },
  {
    title: "Applications",
    entries: [
      {
        q: "Can I apply more than once to the same listing?",
        a: "Where an employer disallows duplicate applications, the platform prevents a second submission. Your applications list shows the status of everything you have submitted.",
      },
      {
        q: "Who sees my CV?",
        a: "Your CV is private. It is only accessible to you and to the employer whose vacancy you applied to, and only where that application is active.",
      },
      {
        q: "Can I withdraw an application?",
        a: "Where the listing's rules permit it, you can withdraw from your applications list before the employer makes a final decision.",
      },
    ],
  },
  {
    title: "Online tasks and rewards",
    entries: [
      {
        q: "How do task rewards work?",
        a: "Every task states its reward terms and eligibility rules before you start. A reward is only confirmed after your submission evidence is reviewed — completing the action alone does not guarantee payment.",
      },
      {
        q: "Why was my submission rejected?",
        a: "Submissions are rejected when the evidence does not show the required action, the action was not held for the required period, or the account used was not eligible. The rejection reason is shown with the submission.",
      },
    ],
  },
  {
    title: "Employers",
    entries: [
      {
        q: "How long does verification take?",
        a: "Verification is a manual review, so timing depends on queue volume and the completeness of your submission. Your dashboard shows the current status at all times.",
      },
      {
        q: "Why was my listing not published?",
        a: "Listings go through moderation before publication. If something is unclear, misleading or duplicates an existing post, a reviewer can reject it with a reason or request edits.",
      },
    ],
  },
];
