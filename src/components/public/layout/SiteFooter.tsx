import { getSettings } from "@/services/settings";
import FooterView from "./FooterView";

// Public footer: published settings (Next cache). The admin renders FooterView itself with
// the latest settings and wraps it in an editor.
export default async function SiteFooter() {
  const settings = await getSettings();
  return <FooterView lines={settings.footerLines} />;
}
