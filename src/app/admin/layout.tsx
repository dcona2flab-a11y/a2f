import type { Metadata } from "next";
import type { ReactNode } from "react";

// Admin area: no public nav/footer by default and never indexed (proxy.ts also sends
// X-Robots-Tag). No admin-specific page styling here — admin pages show the public design.
export const metadata: Metadata = {
  title: { default: "A2F Admin", template: "%s | A2F Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
