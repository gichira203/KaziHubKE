/**
 * Shared online task data types for records returned by the platform API.
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
  /** Server-provided reward label in Kenyan shillings. */
  reward: string;
  rewardAmount?: number;
  rewardCurrency?: string;
  targetUrl?: string;
  eligibility: string;
  availability: string;
  availabilityState: "open" | "limited" | "closed";
};
