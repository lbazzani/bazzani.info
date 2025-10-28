/** @type {import('next').NextConfig} */


const nextConfig = {
    // Add cache busting for PWA updates
    generateBuildId: async () => {
      return `build-${Date.now()}`;
    },

    logging: {
      fetches: {
        fullUrl: true,
      },
    },

    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=0, must-revalidate',
            },
          ],
        },
      ];
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve = {
          ...config.resolve,
          fallback: {
            net: false,
            dns: false,
            tls: false,
            assert: false,
            path: false,
            fs: false,
            events: false,
            process: false,
            child_process : false
          }
        };
      }
      config.module.exprContextCritical = false; // Workaround to suppress next-i18next warning, see https://github.com/isaachinman/next-i18next/issues/1545
  
      return config;
    },
}

export default nextConfig;

