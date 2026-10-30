// The backend service name is fixed inside the cluster, so the destination is
// baked in at build time. Everything under /api is proxied server-side, which
// means the browser only ever talks to the frontend origin (no CORS).
const backendUrl = process.env.BACKEND_URL || 'http://backend:5000';

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};
