/**
 * Post a Job — server page reading ?id= (continue a draft) from searchParams
 * and handing it to the client wizard.
 */
import PostJobContent from "@/components/employer/PostJobContent";

export const instant = false;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PostJobPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.id;
  const draftId = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  return <PostJobContent draftId={draftId} />;
}
