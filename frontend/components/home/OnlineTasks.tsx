import SectionHeading from "@/components/common/SectionHeading";
import TaskCard from "@/components/common/TaskCard";
import { onlineTasks } from "@/data/tasks";
import { disclaimers } from "@/lib/constants";
import styles from "./OnlineTasks.module.css";

/**
 * "Earn Through Online Tasks" section. Rewards and availability are sample
 * data; the UI is structured so instructions, reward conditions and review
 * status can be wired to a backend later.
 */
export default function OnlineTasks() {
  return (
    <section className={styles.section} id="online-tasks" aria-labelledby="tasks-title">
      <div className={styles.container}>
        <div id="tasks-title">
          <SectionHeading
            eyebrow="Online Earning"
            title="Earn Through Online Tasks"
            description="Discover digital tasks from eligible campaigns and participating creators or businesses. Every task clearly states the required action, the conditions for a reward, and who is eligible."
          />
        </div>

        <p className={styles.disclaimerBanner}>
          Not every social media action earns a reward. Only tasks listed by eligible
          campaigns qualify, and each task is reviewed before any reward is issued.
        </p>

        {onlineTasks.length === 0 ? (
          <p className={styles.empty}>No online tasks are available right now.</p>
        ) : (
          <div className={styles.grid}>
            {onlineTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}

        <p className={styles.note}>{disclaimers.tasks}</p>
      </div>
    </section>
  );
}
