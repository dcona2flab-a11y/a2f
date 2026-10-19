import Image from "next/image";
import activityIcon from "@/assets/icons/activity.svg";
import awardIcon from "@/assets/icons/award.svg";
import type { AwardActivityType } from "@/types/content";

// Figma type icons (green): trophy for Award, the Activity mark for Activity.
export const AWARD_TYPE_META: Record<AwardActivityType, { label: string; icon: typeof awardIcon }> = {
  AWARD: { label: "Award", icon: awardIcon },
  ACTIVITY: { label: "Activity", icon: activityIcon },
};

export default function AwardTypeIcon({ type, className }: { type: AwardActivityType; className?: string }) {
  const { label, icon } = AWARD_TYPE_META[type];
  return <Image className={className} src={icon} alt={label} unoptimized />;
}
