import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the on-screen dev-mode route indicator (the floating button in the
  // corner and its "INP Issue" popups). Dev-only — never shows in production
  // — but distracting while testing locally. Compile/runtime errors still surface.
  devIndicators: false,
};

export default nextConfig;
