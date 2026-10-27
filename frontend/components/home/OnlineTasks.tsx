"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/common/SectionHeading";
import TaskCard from "@/components/common/TaskCard";
import type { OnlineTask } from "@/data/tasks";
import { apiRequest } from "@/lib/api";
import { disclaimers } from "@/lib/constants";
import styles from "./OnlineTasks.module.css";

export default function OnlineTasks() {
  const [onlineTasks, setOnlineTasks] = useState<OnlineTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<{ items: OnlineTask[] }>("/tasks")
      .then((result) => {
        if (active) setOnlineTasks(result.items);
      })
      .catch(() => {
        if (active) setOnlineTasks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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

        {loading ? (
          <p className={styles.empty} role="status">Loading available campaigns…</p>
        ) : onlineTasks.length === 0 ? (
          <p className={styles.empty}>No online tasks are available right now.</p>
        ) : (
          <div className={styles.grid}>
            {onlineTasks.map((task) => (
              <TaskCard key={task.id} task={task} actionHref="/login" />
            ))}
          </div>
        )}

        <p className={styles.note}>{disclaimers.tasks}</p>
      </div>
    </section>
  );
}
