/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Node.js-native packages on server side only (imapflow, mailparser, node-cron)
  serverExternalPackages: ['imapflow', 'mailparser', 'node-cron'],
};

export default nextConfig;
