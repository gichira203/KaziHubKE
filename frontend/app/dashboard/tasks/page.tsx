"use client";

/**
 * Online Tasks — the full task catalogue. Everything is clearly-labelled
 * sample data; no completed tasks, payment confirmations or reward balances
 * are shown, and earnings are never guaranteed.
 */
import { useEffect, useState } from "react";
import { onlineTasks } from "@/data/tasks";
import OnlineTasksPanel from "@/components/job-seeker/OnlineTasksPanel";
import PageLoading from "@/components/dashboard/PageLoading";
import StatusMessage from "@/components/common/StatusMessage";
import { dashboardDisclaimers } from "@/data/mock-dashboard";

export default function TasksPage() {
  const [tasks, setTasks] = useState<typeof onlineTasks | null>(null);

  useEffect(() => {
    // Simulated fetch — the real task list arrives from the backend.
    const timer = window.setTimeout(() => setTasks(onlineTasks), 250);
    return () => window.clearTimeout(timer);
  }, []);

  if (!tasks) return <PageLoading label="Loading tasks…" />;

  return (
    <div className="flex flex-col gap-5">
      <OnlineTasksPanel tasks={tasks} variant="full" />

      <StatusMessage type="info">
        <strong>Task verification and payouts need the backend.</strong>
        <p>
          Tasks shown here are samples. Completing a task, verifying your action and paying rewards
          all require the connected task system — nothing is verified or paid in this preview.
        </p>
      </StatusMessage>

      <p className="text-[11.5px] leading-snug text-muted">{dashboardDisclaimers.tasks}</p>
    </div>
  );
}
