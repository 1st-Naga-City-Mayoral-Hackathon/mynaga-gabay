const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@mynaga/shared', '@mynaga/ai-core'],
    output: 'standalone',
    eslint: {
        // Vercel installs with `npm ci --ignore-scripts` and may not include devDeps.
        // Don’t fail production builds on ESLint availability.
        ignoreDuringBuilds: true,
    },
    webpack: (config) => {
        config.resolve.alias['@'] = path.join(__dirname, 'src');
        return config;
    },
};

module.exports = nextConfig;
