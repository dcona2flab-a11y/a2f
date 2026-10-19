import NotFoundView from "@/components/public/layout/NotFoundView";

// notFound() inside public pages (e.g. an unknown /award/[id]); header and footer come from the layout.
export default function PublicNotFound() {
  return <NotFoundView />;
}
