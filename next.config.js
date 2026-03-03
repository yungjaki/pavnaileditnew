/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js to treat 'ogl' as an ESM external (don't bundle it server-side)
  experimental: {
    esmExternals: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

module.exports = nextConfig;
