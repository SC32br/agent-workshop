const isPages = process.env.GITHUB_PAGES === "1";
const basePath = isPages ? "/agent-workshop" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};
export default nextConfig;
