/** @type {import('next').NextJSConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Nếu sau này bạn có dùng thêm domain ảnh khác thì khai báo thêm ở đây
    ],
  },
};

export default nextConfig;
