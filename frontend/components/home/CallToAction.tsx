import { Briefcase, MousePointerClick, PlusCircle } from "lucide-react";
import Button from "@/components/common/Button";
import { cx } from "@/lib/cx";
import styles from "./CallToAction.module.css";

const actions = [
  {
    label: "Find a Job",
    href: "/jobs",
    icon: Briefcase,
    variant: "primary" as const,
  },
  {
    label: "Explore Online Tasks",
    href: "#online-tasks",
    icon: MousePointerClick,
    variant: "outline" as const,
  },
  {
    label: "Post a Job",
    href: "/employer/dashboard/jobs/new",
    icon: PlusCircle,
    variant: "outline" as const,
  },
];

export default function CallToAction() {
  return (
    <section className={styles.section} aria-labelledby="cta-title">
      <div className={styles.container}>
        <h2 className={styles.title} id="cta-title">
          Ready to Find Your Next Opportunity?
        </h2>
        <p className={styles.text}>
          Job seekers, students, microtask participants and employers — explore what
          KaziHub KE has to offer and take your next step today.
        </p>

        <div className={styles.actions}>
          {actions.map((action) => (
            <Button
              key={action.label}
              href={action.href}
              variant={action.variant}
              size="lg"
              className={cx(styles.action, action.variant === "outline" && styles.secondary)}
            >
              <action.icon size={18} aria-hidden="true" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
