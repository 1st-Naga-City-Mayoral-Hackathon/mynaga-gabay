const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@mynaga/shared', '@mynaga/ai-core'],
    output: 'standalone',
    webpack: (config) => {
        config.resolve.alias['@'] = path.join(__dirname, 'src');
        return config;
    },
};

module.exports = nextConfig;
