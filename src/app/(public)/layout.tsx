import type { ReactNode } from "react";
import SiteFooter from "@/components/public/layout/SiteFooter";
import SiteHeader from "@/components/public/layout/SiteHeader";

// Public site chrome: header and footer around every public page.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
