/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // Limite de taille du body pour les requêtes qui traversent le middleware
    // (FormData : images de biens, PDF d'étiquettes et de fiches descriptives).
    // Doit rester sous `experimental` : déclarée à la racine, la clé était
    // ignorée et le plafond par défaut de 10 Mo s'appliquait, ce qui faisait
    // silencieusement échouer l'upload des PDF d'étiquette.
    middlewareClientMaxBodySize: '50mb',
  },
};

export default nextConfig;
