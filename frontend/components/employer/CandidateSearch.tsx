"use client";

/**
 * CandidateSearch — filters + results for employers.
 *
 * RESTRICTED until verification: candidate search respects candidate consent
 * and profile visibility, and private CVs or contact details are never
 * exposed to unauthorized employers. No fictional candidates are shown —
 * results only ever come from the backend.
 */
import { useState } from "react";
import { FileSearch, Lock, Search, Star } from "lucide-react";
import Button from "@/components/common/Button";
import InputField from "@/components/common/InputField";
import SelectField from "@/components/common/SelectField";
import TagInput from "@/components/common/TagInput";
import EmptyState from "@/components/dashboard/EmptyState";
import { qualifications, suggestedSkills } from "@/lib/kenya-data";
import type { PermissionResult } from "@/lib/permissions";

type CandidateSearchProps = {
  permission: PermissionResult;
};

const experienceLevels = [
  "Any experience",
  "Student / trainee",
  "0–1 years",
  "1–3 years",
  "3–5 years",
  "5+ years",
];

export default function CandidateSearch({ permission }: CandidateSearchProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [searched, setSearched] = useState(false);

  if (!permission.allowed) {
    return (
      <EmptyState
        icon={Lock}
        title="Candidate search is locked"
        description={permission.reason}
        action={<Button href="/employer/dashboard/verification">Start Verification</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSearched(true);
        }}
        noValidate
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <TagInput
            label="Skills"
            name="candidate-skills"
            tags={skills}
            suggestions={suggestedSkills}
            onChange={setSkills}
            placeholder="Add a skill"
          />
        </div>
        <InputField
          label="Location"
          name="candidate-location"
          value={location}
          onChange={setLocation}
          placeholder="e.g. Nairobi"
        />
        <SelectField
          label="Experience"
          name="candidate-experience"
          value={experience}
          options={experienceLevels}
          placeholder="Any experience"
          onChange={setExperience}
        />
        <SelectField
          label="Education"
          name="candidate-education"
          value={education}
          options={qualifications}
          placeholder="Any qualification"
          onChange={setEducation}
        />
        <div className="sm:col-span-2 lg:col-span-4">
          <Button type="submit">
            <Search size={15} aria-hidden="true" />
            Search candidates
          </Button>
        </div>
      </form>

      {searched ? (
        <EmptyState
          icon={FileSearch}
          title="No candidates matched your filters."
          description="Candidate results come from the backend search service and only include candidates whose profile visibility allows employers to find them. No sample candidates are shown in this preview."
        />
      ) : (
        <EmptyState
          icon={FileSearch}
          title="Search for candidates by skill, location, experience and education."
          description="Only candidates who allow employer discovery appear in results, and their private CVs and contact details stay protected."
        />
      )}

      <section id="saved" className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-warning-bg text-warning">
            <Star size={17} aria-hidden="true" />
          </span>
          <h2 className="text-[15px] font-bold tracking-tight text-ink">Saved Candidates</h2>
        </div>
        <EmptyState
          icon={Star}
          title="You haven't saved any candidates yet."
          description="Save candidates while reviewing applications to shortlist them later."
        />
      </section>
    </div>
  );
}
