/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.peptly.in', 'peptly.in', 'localhost', 's3.amazonaws.com'],
    unoptimized: true,
  },
}
module.exports = nextConfig
