import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AwardDetail from "@/components/public/award/AwardDetail";
import { getAwardById } from "@/services/awards";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const award = await getAwardById((await params).id);
  return { title: award ? award.title : "페이지를 찾을 수 없습니다" };
}

// Award / Activity detail. Unknown ids get the real 404 (not-found.tsx, status 404).
export default async function AwardDetailPage({ params }: Props) {
  const award = await getAwardById((await params).id);
  if (!award) notFound();
  return <AwardDetail award={award} />;
}
