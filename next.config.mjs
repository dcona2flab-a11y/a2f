// Publication is an external Notion page. The old /publication URL follows it when the URL
// is configured (read at build time, like the GNB link); without it, /publication is a 404.
const publicationUrl = process.env.NOTION_PUBLICATION_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next dev` would otherwise append its own agent notes to CLAUDE.md (project rules file).
  agentRules: false,
  // Home is the Award & Activity list; there is no /award list page.
  async redirects() {
    return [
      { source: "/award", destination: "/#award", permanent: false },
      { source: "/admin/award", destination: "/admin#award", permanent: false },
      ...(publicationUrl ? [{ source: "/publication", destination: publicationUrl, permanent: false }] : []),
    ];
  },
  images: {
    // Any Vercel Blob public store, so moving to another account's store needs no config change.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
