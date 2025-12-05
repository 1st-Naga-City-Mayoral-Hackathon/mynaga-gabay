/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@mynaga/shared', '@mynaga/ai-core'],
};

module.exports = nextConfig;
