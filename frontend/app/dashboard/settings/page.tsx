"use client";

/**
 * Settings — account details, visibility and alert preferences as actually
 * saved, and sign-out. No sensitive values (passwords, tokens) are ever
 * displayed or stored here.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings as SettingsIcon } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageLoading from "@/components/dashboard/PageLoading";
import { getJobSeekerOverview, type JobSeekerOverview } from "@/lib/dashboard-service";
import {
  accountStatusLabels,
  accountStatusTones,
} from "@/lib/account-types";
import { accountStatus } from "@/lib/session";
import { signOut as signOutFromServer } from "@/lib/auth-config";

export default function SettingsPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<JobSeekerOverview | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  useEffect(() => {
    let active = true;
    getJobSeekerOverview().then((data) => {
      if (active) setOverview(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!overview) return <PageLoading label="Loading settings…" />;

  const { session, draft } = overview;
  const status = accountStatus(session);
  const isLocalDemo = session.localDemo;

  const signOut = () => {
    void signOutFromServer();
    router.push("/login");
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
            <SettingsIcon size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Account</h2>
            <p className="mt-1 text-[12.5px] text-muted">
              {isLocalDemo
                ? "Local demo session — no server-side account exists."
                : "Signed in with your KaziHub account. Your sign-in is managed by the KaziHub API."}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">Email</dt>
            <dd className="mt-1 text-[13px] font-medium text-ink">
              {session.email || "Not provided"}
            </dd>
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
              Account type
            </dt>
            <dd className="mt-1 text-[13px] font-medium text-ink">Job seeker</dd>
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
              Account status
            </dt>
            <dd className="mt-1.5">
              <StatusBadge
                label={accountStatusLabels[status]}
                tone={accountStatusTones[status]}
              />
            </dd>
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
              Created
            </dt>
            <dd className="mt-1 text-[13px] font-medium text-ink">
              {session.createdAt
                ? new Date(session.createdAt).toLocaleString("en-KE")
                : "This session"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Privacy &amp; visibility</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li className="flex items-center justify-between rounded-lg border border-line bg-surface p-3">
            <span className="text-[13px] text-ink">Profile visible to employers</span>
            <StatusBadge
              label={draft.notifications.profileVisibleToEmployers ? "Visible" : "Hidden"}
              tone={draft.notifications.profileVisibleToEmployers ? "success" : "neutral"}
            />
          </li>
          <li className="flex items-center justify-between rounded-lg border border-line bg-surface p-3">
            <span className="text-[13px] text-ink">Employers can contact you</span>
            <StatusBadge
              label={draft.notifications.allowEmployerContact ? "Allowed" : "Not allowed"}
              tone={draft.notifications.allowEmployerContact ? "success" : "neutral"}
            />
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Session</h2>
        <p className="mt-1 text-[12.5px] text-muted">
          {isLocalDemo
            ? "Signing out clears this local demo session. No account exists on a server."
            : "Signing out ends the session on this device and clears your sign-in cookie."}
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-error px-4 text-[13.5px] font-semibold text-error transition hover:bg-danger-bg"
          >
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out?"
        message={
          isLocalDemo
            ? "This clears your local demo session and returns you to the login page. Nothing is stored on a server."
            : "This ends your session on this device and returns you to the login page. Your account stays on the KaziHub server."
        }
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        destructive
        onConfirm={signOut}
        onCancel={() => setConfirmSignOut(false)}
      />
    </div>
  );
}
