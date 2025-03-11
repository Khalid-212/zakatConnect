/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  // Configure static generation and optimization
  experimental: {
    optimizeCss: false, // Disable CSS optimization to avoid critters dependency
  },
  // Set environment variables fallbacks for build time
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
  },
  // Configure static page generation
  output: 'standalone',
};

if (process.env.NEXT_PUBLIC_TEMPO) {
  // Keep existing tempo configuration
  if (!nextConfig.experimental) {
    nextConfig.experimental = {};
  }
  // NextJS 14.1.3 to 14.2.11:
  nextConfig.experimental.swcPlugins = [[require.resolve('tempo-devtools/swc/0.90'), {}]];
}

module.exports = nextConfig;
