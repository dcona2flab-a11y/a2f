import NotFoundView from "@/components/public/layout/NotFoundView";
import SiteFooter from "@/components/public/layout/SiteFooter";
import SiteHeader from "@/components/public/layout/SiteHeader";

// Unmatched URLs anywhere: the public chrome around the same minimal 404 body.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <NotFoundView />
      <SiteFooter />
    </>
  );
}
