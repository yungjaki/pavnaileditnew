/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: false,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

module.exports = nextConfig;
