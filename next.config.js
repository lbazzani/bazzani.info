/** @type {import('next').NextConfig} */


const nextConfig = {

    logging: {
      fetches: {
        fullUrl: true,
      },
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

