/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // No ignoramos los errores de ESLint durante la compilación
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig 