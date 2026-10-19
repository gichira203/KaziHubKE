/**
 * EmployerSetupChecklist — "Set Up Your Employer Account".
 *
 * A thin wrapper over ProfileCompletionCard with the employer-specific copy.
 * The checklist itself renders the same honest, saved-data-only progress.
 */
import ProfileCompletionCard from "@/components/dashboard/ProfileCompletionCard";
import type { CompletionResult } from "@/lib/profile-service";

export default function EmployerSetupChecklist({ completion }: { completion: CompletionResult }) {
  return (
    <ProfileCompletionCard
      completion={completion}
      title="Set Up Your Employer Account"
      description="Complete these steps to prepare your organization. You can save progress and return at any time — nothing forces you to fill every field before using the rest of your dashboard."
    />
  );
}
