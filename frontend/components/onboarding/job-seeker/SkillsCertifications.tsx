"use client";

/**
 * Step 5 — Skills, languages, certifications, training and professional links.
 * Tag inputs with searchable suggestions; nothing is invented for the user.
 */
import { useState } from "react";
import { Award, Link as LinkIcon, Link2 } from "lucide-react";
import TagInput from "@/components/common/TagInput";
import InputField from "@/components/common/InputField";
import { suggestedLanguages, suggestedSkills } from "@/lib/kenya-data";
import { validateUrl } from "@/lib/validation";
import type { JobSeekerSkills } from "@/lib/onboarding-types";
import styles from "./SkillsCertifications.module.css";

type SkillsCertificationsProps = {
  value: JobSeekerSkills;
  onChange: (value: JobSeekerSkills) => void;
};

export default function SkillsCertifications({ value, onChange }: SkillsCertificationsProps) {
  const update = (patch: Partial<JobSeekerSkills>) => onChange({ ...value, ...patch });

  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Skills &amp; certifications
        </h2>
        <p className={styles.lead}>
          Skills help employers find you in search. Type your own or pick from the
          suggestions — only add what you genuinely have.
        </p>
      </div>

      <TagInput
        label="Technical skills"
        name="technical-skills"
        tags={value.technicalSkills}
        suggestions={suggestedSkills}
        onChange={(technicalSkills) => update({ technicalSkills })}
        placeholder="e.g. React, Welding"
        helperText="Tools, software and trade skills."
      />

      <TagInput
        label="Professional skills"
        name="professional-skills"
        tags={value.professionalSkills}
        suggestions={suggestedSkills.filter((skill) =>
          [
            "Communication", "Teamwork", "Leadership", "Time Management", "Negotiation",
            "Problem Solving", "Customer Service", "Project Management", "Report Writing",
            "Critical Thinking", "Adaptability", "Attention to Detail",
          ].includes(skill),
        )}
        onChange={(professionalSkills) => update({ professionalSkills })}
        placeholder="e.g. Teamwork"
        helperText="Also called soft or transferable skills."
      />

      <TagInput
        label="Languages"
        name="languages"
        tags={value.languages}
        suggestions={suggestedLanguages}
        onChange={(languages) => update({ languages })}
        placeholder="e.g. Swahili"
      />

      <TagInput
        label="Certifications"
        name="certifications"
        tags={value.certifications}
        onChange={(certifications) => update({ certifications })}
        placeholder="e.g. CPA Part II, AWS Cloud Practitioner"
        helperText="Professional certificates and licences."
      />

      <TagInput
        label="Professional training"
        name="training"
        tags={value.training}
        onChange={(training) => update({ training })}
        placeholder="e.g. Google Digital Marketing Course"
      />

      <div className={styles.linksCard}>
        <p className={styles.linksTitle}>
          <Link2 size={15} aria-hidden="true" />
          Professional links
        </p>

        <InputField
          label="Portfolio website"
          name="portfolio-url"
          type="url"
          value={value.portfolioUrl}
          onChange={(portfolioUrl) => {
            update({ portfolioUrl });
            setPortfolioError(validateUrl(portfolioUrl, "portfolio link"));
          }}
          placeholder="https://yourportfolio.com"
          error={portfolioError}
        />

        <InputField
          label="GitHub or other professional profile"
          name="github-url"
          type="url"
          value={value.githubUrl}
          onChange={(githubUrl) => {
            update({ githubUrl });
            setGithubError(validateUrl(githubUrl, "profile link"));
          }}
          placeholder="https://github.com/username"
          error={githubError}
        />
      </div>

      <p className={styles.note}>
        <Award size={14} aria-hidden="true" />
        Add certifications only if you can produce them on request. Employers may
        verify them.
      </p>

      <p className={styles.note}>
        <LinkIcon size={14} aria-hidden="true" />
        Links are shown on your public profile only when you allow employer
        visibility.
      </p>
    </div>
  );
}
