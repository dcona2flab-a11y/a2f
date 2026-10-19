import type { ReactNode } from "react";
import AdminBar from "@/components/admin/AdminBar";
import Editable from "@/components/admin/edit/Editable";
import FooterTextEditor from "@/components/admin/editors/FooterTextEditor";
import FooterView from "@/components/public/layout/FooterView";
import SiteHeader from "@/components/public/layout/SiteHeader";
import { DEFAULT_CONTENT } from "@/config/defaults";
import { requireAdmin } from "@/lib/auth/session";
import { getPublishedDocument } from "@/services/content";

// Every page under (protected) is authorized here on the server (signature + expiry + epoch).
// Admin Server Actions must still call requireAdmin() themselves.
// The admin shows the same public header/footer; editing is added around them (CLAUDE.md §7C).
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const { username } = await requireAdmin();
  const settings = await getPublishedDocument("settings"); // cached latest (same tag as the public site)
  const footerLines = settings?.data.footerLines ?? DEFAULT_CONTENT.settings.data.footerLines;

  return (
    <>
      <AdminBar username={username} />
      <SiteHeader basePath="/admin" />
      {children}
      <Editable label="푸터 문구" editor={<FooterTextEditor lines={footerLines} version={settings?.version ?? 0} />}>
        <FooterView lines={footerLines} />
      </Editable>
    </>
  );
}
