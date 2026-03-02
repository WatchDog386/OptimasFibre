/**
 * @typedef {Object} Article
 * @property {string} slug
 * @property {string} title
 * @property {string} excerpt
 * @property {string} content
 * @property {string} author
 * @property {string} date
 * @property {string} image
 * @property {string} category
 * @property {string} readTime
 * @property {string[]} tags
 * @property {boolean} isFeatured
 * @property {string} [background]
 */

export const articles = [
  {
    slug: "fiber-internet-light-speed",
    title: "The Power of Fiber: Internet That Moves at Light Speed",
    excerpt: "Explore why fiber internet is a game-changer in connectivity.",
    content: `Fiber internet uses light to transmit data at blazing speeds, offering higher bandwidth and lower latency compared to traditional copper lines. With Kenya rapidly deploying fiber across urban and rural zones, the digital divide is shrinking fast.`,
    author: "Tech Editorial Team",
    date: "2025-05-26",
    image: "/fibre.webp",         // ✅ public path
    category: "technology",
    readTime: "5 min",
    tags: ["Innovation", "Infrastructure"],
    isFeatured: true,
    background: "/deep.jpg",      // ✅ public path
  },
  {
    slug: "rural-connectivity-benefits",
    title: "Connecting the Unconnected: The Benefits of Rural Internet",
    excerpt: "High-speed internet in rural areas enables access to education, health, and economic growth.",
    content: `Rural internet opens doors to digital education, telemedicine, e-commerce, and much more. It's a catalyst for community transformation, enabling local talent to thrive in the global economy.`,
    author: "Knoxfill Research Team",
    date: "2025-04-10",
    image: "/fibre2.webp",       // ✅ public path
    category: "community",
    readTime: "4 min",
    tags: ["Access", "Community", "Equity"],
    isFeatured: false,
    background: "/download.jpg",  // ✅ public path
  },
  {
    slug: "installation-process-guide",
    title: "Smooth Installation: What to Expect and How to Prepare",
    excerpt: "Understand the steps involved in setting up your fiber connection at home or office.",
    content: `From checking local infrastructure to scheduling and access requirements, this guide walks you through how to get your fiber installed without delays.`,
    author: "Customer Support",
    date: "2025-03-22",
    image: "/fibre3.webp",         // ✅ public path
    category: "guides",
    readTime: "3 min",
    tags: ["Installation", "Customer Help"],
    isFeatured: false,
    background: "/deep.jpg",      // ✅ public path
  },
];
