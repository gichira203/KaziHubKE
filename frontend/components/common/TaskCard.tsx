import { Clock, Coins, ShieldCheck, CheckCircle2, CircleSlash, ArrowRight } from "lucide-react";
import type { OnlineTask } from "@/data/tasks";
import styles from "./TaskCard.module.css";

const availabilityStyles: Record<OnlineTask["availabilityState"], string> = {
  open: styles.availOpen,
  limited: styles.availLimited,
  closed: styles.availClosed,
};

const AvailabilityIcon: Record<OnlineTask["availabilityState"], typeof CheckCircle2> = {
  open: CheckCircle2,
  limited: Clock,
  closed: CircleSlash,
};

type TaskCardProps = {
  task: OnlineTask;
  /** Action link target — defaults to the home page anchor. */
  actionHref?: string;
  /**
   * When provided, the action renders as a non-link note instead of a dead
   * link — used where task completion genuinely requires the backend.
   */
  actionDisabledNote?: string;
};

export default function TaskCard({ task, actionHref = "#online-tasks", actionDisabledNote }: TaskCardProps) {
  const AvailIcon = AvailabilityIcon[task.availabilityState];

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <h3 className={styles.title}>{task.title}</h3>
        <span className={`${styles.availability} ${availabilityStyles[task.availabilityState]}`}>
          <AvailIcon size={13} aria-hidden="true" />
          {task.availability}
        </span>
      </div>

      <p className={styles.platform}>{task.platform}</p>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Required action</span>
        <p className={styles.rowValue}>{task.action}</p>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>
          <Clock size={13} aria-hidden="true" /> Time
        </span>
        <p className={styles.rowValue}>{task.time}</p>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>
          <Coins size={13} aria-hidden="true" /> Reward
        </span>
        <p className={styles.rowValue}>
          {task.reward}
          {!task.rewardCurrency && <span className={styles.sample}>sample</span>}
        </p>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>
          <ShieldCheck size={13} aria-hidden="true" /> Eligibility
        </span>
        <p className={styles.rowValue}>{task.eligibility}</p>
      </div>

      {actionDisabledNote ? (
        <p className={styles.disabledNote} role="note">
          {actionDisabledNote}
        </p>
      ) : (
        <a
          href={actionHref}
          className={styles.action}
          aria-disabled={task.availabilityState === "closed"}
        >
          {task.availabilityState === "closed" ? "Task Closed" : "Start Task"}
          {task.availabilityState !== "closed" && <ArrowRight size={15} aria-hidden="true" />}
        </a>
      )}
    </article>
  );
}
