/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Augmenter la limite de taille du body pour les requêtes (notamment FormData avec images)
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/middlewareClientMaxBodySize
  middlewareClientMaxBodySize: '50mb',
};

export default nextConfig;
