/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      // 배포 s3 버킷
      {
        protocol: 'https',
        hostname: 'textok-prod-bucket.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'textok-prod-bucket.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },

      // --- textok dev images ---
      {
        protocol: 'https',
        hostname: 'next5-dev-images.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'next5-dev-images.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },

      // --- shorlog dev images ---
      {
        protocol: 'https',
        hostname: 'shorlog-dev-images.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'shorlog-dev-images.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },

      //google
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      //kakao
      {
        protocol: 'http',
        hostname: 'img1.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 't1.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't1.kakaocdn.net',
        pathname: '/**',
      },

      // --- Kakao profile (추가 필요 시) ---
      {
        protocol: 'https',
        hostname: 'k.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'k.kakaocdn.net',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
