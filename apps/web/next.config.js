/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@mynaga/shared', '@mynaga/ai-core'],
    output: 'standalone',
};

module.exports = nextConfig;
