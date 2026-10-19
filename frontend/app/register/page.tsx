import type { Metadata } from "next";
import RegisterChooser from "./RegisterChooser";

export const metadata: Metadata = {
  title: "Create your account — KaziHub KE",
  description:
    "Join KaziHub KE as a job seeker or employer. Find jobs, internships, attachments, remote work and online opportunities, or post vacancies.",
};

export const instant = false;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.type;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const initialType = value === "employer" || value === "job-seeker" ? value : null;

  return <RegisterChooser initialType={initialType} />;
}
