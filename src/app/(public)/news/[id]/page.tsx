import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SITE } from "@/config/site";
import { awardPath, awardSlug } from "@/lib/content-paths";
import AwardDetail from "@/components/public/award/AwardDetail";
import { getAwardBySegment } from "@/services/awards";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const award = await getAwardBySegment((await params).id);
  if (!award) return { title: "페이지를 찾을 수 없습니다" };
  return {
    title: award.title,
    alternates: { canonical: awardPath(award) },
    openGraph: { title: `${award.title} | ${SITE.name}` },
  };
}

// Award / Activity detail. Unknown ids get the real 404 (not-found.tsx, status 404).
export default async function AwardDetailPage({ params }: Props) {
  const { id } = await params;
  const award = await getAwardBySegment(id);
  if (!award) notFound();
  // Older or alternative addresses (e.g. /news/award-…) move to the current one; /award/… is
  // redirected in next.config.
  if (id !== awardSlug(award)) permanentRedirect(awardPath(award));
  return <AwardDetail award={award} />;
}
