const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-8478941ccce048548a3fffebf4c7d51f.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'd3ay14vkclriu.cloudfront.net',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
  webpack(config, { webpack }) {
    config.cache = false;
    config.plugins.push(
      new webpack.DefinePlugin({
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1/'),
        'import.meta.env.VITE_CDN_URL': JSON.stringify('/uploads'),
        'import.meta.env.VITE_APP_BACKEND_URL': JSON.stringify('/uploads/'),
        'import.meta.env.VITE_APP_URL': JSON.stringify('http://localhost:3000'),
        'import.meta.env.VITE_GOOGLE_AUTH_URL': JSON.stringify('https://server-nataka.chathurakavindu.me/oauth2/authorization/google'),
      })
    );
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
