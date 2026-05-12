import type { MetadataRoute } from "next";

function getBaseUrl() {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_URL;
  if (!env) return "http://localhost:3000";
  if (env.startsWith("http://") || env.startsWith("https://")) return env;
  return `https://${env}`;
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login", "/register"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

