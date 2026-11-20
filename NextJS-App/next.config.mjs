/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Safely expose public non-sensitive configuration to client-side code.
    // Client secrets and database connection strings must NEVER be included here.
    GOOGLE_CLIENT_ID:
      process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    FACEBOOK_APP_ID:
      process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
    API_URL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
