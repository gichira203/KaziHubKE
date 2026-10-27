/**
 * Mock online microtasks for the OnlineTasks section.
 * SAMPLE DATA ONLY: rewards are illustrative sample values, not guaranteed
 * earnings. Actual verification and reward processing needs a secure backend.
 */

export type TaskCategory =
  | "youtube"
  | "social-follow"
  | "engagement"
  | "survey"
  | "testing"
  | "research";

export type OnlineTask = {
  id: string;
  title: string;
  platform: string;
  category: TaskCategory;
  action: string;
  time: string;
  /** Sample reward — clearly marked as demonstration data in the UI. */
  reward: string;
  rewardAmount?: number;
  rewardCurrency?: string;
  targetUrl?: string;
  eligibility: string;
  availability: string;
  availabilityState: "open" | "limited" | "closed";
};

export const onlineTasks: OnlineTask[] = [
  {
    id: "task-001",
    title: "Watch eligible YouTube videos",
    platform: "Creator campaign — sample",
    category: "youtube",
    action:
      "Watch the full video from a participating creator and keep it open until playback ends.",
    time: "5–10 minutes",
    reward: "KSh 30–80 (sample)",
    eligibility: "Kenyan residents, 18+, one qualifying YouTube account per person.",
    availability: "Open — limited daily slots",
    availabilityState: "limited",
  },
  {
    id: "task-002",
    title: "Follow eligible social media accounts",
    platform: "Brand campaign — sample",
    category: "social-follow",
    action:
      "Follow the accounts listed in the task and keep the follow active for the required period.",
    time: "2–3 minutes",
    reward: "KSh 20–50 (sample)",
    eligibility: "Public accounts only; accounts must remain active for 7 days.",
    availability: "Open",
    availabilityState: "open",
  },
  {
    id: "task-003",
    title: "Like or comment on permitted content",
    platform: "Creator campaign — sample",
    category: "engagement",
    action:
      "Leave a genuine comment on the designated post and like it from your registered account.",
    time: "3–5 minutes",
    reward: "KSh 25–60 (sample)",
    eligibility: "Meaningful comments only — spam or copied comments are rejected.",
    availability: "Open",
    availabilityState: "open",
  },
  {
    id: "task-004",
    title: "Complete short surveys",
    platform: "Research partner — sample",
    category: "survey",
    action: "Answer a screening questionnaire and complete the survey honestly.",
    time: "8–15 minutes",
    reward: "KSh 100–250 (sample)",
    eligibility: "Must match the target profile described in the task instructions.",
    availability: "Closing soon",
    availabilityState: "limited",
  },
  {
    id: "task-005",
    title: "Test websites or applications",
    platform: "Product team — sample",
    category: "testing",
    action:
      "Follow the test script, then submit written feedback or a short screen recording.",
    time: "15–30 minutes",
    reward: "KSh 150–400 (sample)",
    eligibility: "A working phone or computer with a stable internet connection.",
    availability: "Open",
    availabilityState: "open",
  },
  {
    id: "task-006",
    title: "Simple digital research tasks",
    platform: "Business campaign — sample",
    category: "research",
    action:
      "Collect publicly available information such as business details or pricing and submit it in the required format.",
    time: "10–20 minutes",
    reward: "KSh 80–200 (sample)",
    eligibility: "Good reading skills and attention to detail; accuracy is reviewed.",
    availability: "Closed — check back later",
    availabilityState: "closed",
  },
];
