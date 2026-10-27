/** Displays published online task records supplied by the platform API. */
import Link from "next/link";
import { Coins, PenTool } from "lucide-react";
import TaskCard from "@/components/common/TaskCard";
import type { OnlineTask } from "@/data/tasks";

type OnlineTasksPanelProps = {
  tasks: OnlineTask[];
  variant?: "overview" | "full";
};

const overviewRows: { label: string; get: (task: OnlineTask) => string }[] = [
  { label: "Time", get: (task) => task.time },
  { label: "Reward", get: (task) => task.reward },
];

export default function OnlineTasksPanel({ tasks, variant = "overview" }: OnlineTasksPanelProps) {
  return (
    <section aria-labelledby="online-tasks-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
            <PenTool size={17} aria-hidden="true" />
          </span>
          <h2 id="online-tasks-title" className="text-[16px] font-bold tracking-tight text-ink">
            Discover Online Tasks
          </h2>
        </div>
        {variant === "overview" ? (
          <Link
            href="/dashboard/tasks"
            className="text-[13px] font-bold text-brand-dark hover:underline"
          >
            See all tasks →
          </Link>
        ) : null}
      </div>

      {tasks.length === 0 ? <p className="rounded-lg border border-dashed border-line bg-white p-4 text-sm text-muted">No published online tasks are available yet.</p> : variant === "full" ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex">
              <TaskCard task={task} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-col gap-1.5 rounded-lg border border-line bg-white p-3.5 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold text-ink">{task.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted">{task.action}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted">
                  {overviewRows.map((row) => (
                    <span key={row.label} className="inline-flex items-center gap-1">
                      {row.label === "Reward" ? <Coins size={12} aria-hidden="true" /> : null}
                      {row.label}: {row.get(task)}
                    </span>
                  ))}
                </p>
              </div>
              <Link
                href="/dashboard/tasks"
                className="inline-flex h-8 flex-shrink-0 items-center rounded-lg border border-line bg-white px-3 text-[12.5px] font-semibold text-brand-dark transition hover:border-brand hover:bg-success-bg"
              >
                View Task
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11.5px] leading-snug text-muted">Rewards are added to available earnings after a submission is reviewed and approved. Withdrawals are processed manually.</p>
    </section>
  );
}
