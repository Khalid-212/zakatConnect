/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  // Disable static generation for pages that need Supabase client
  experimental: {
    // Setting this to true ensures pages that need data fetching run on-demand
    optimizeCss: true,
  },
  // Set environment variables fallbacks for build time
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
  },
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
