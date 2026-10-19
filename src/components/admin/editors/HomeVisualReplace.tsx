"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { saveHomeVisual } from "@/app/admin/(protected)/home-actions";
import ImageReplace from "@/components/admin/edit/ImageReplace";
import type { HomeVisualGroup } from "@/config/home";

type Props = {
  group: HomeVisualGroup;
  index: number;
  version: number;
  children: ReactNode; // the public collage photo
};

// "이미지 변경" on a Home collage photo: upload, then save the new photo into its slot at once.
export default function HomeVisualReplace({ group, index, version, children }: Props) {
  const router = useRouter();
  return (
    <ImageReplace
      fill
      kind="home"
      entityId={`${group}-${index}`}
      onReplace={async (image) => {
        const outcome = await saveHomeVisual(version, group, index, image);
        if (outcome.ok) router.refresh();
        return outcome;
      }}
    >
      {children}
    </ImageReplace>
  );
}
