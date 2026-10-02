import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false, // stop `next dev` from appending rules to our CLAUDE.md
};

export default nextConfig;
