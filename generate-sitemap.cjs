const sitemapGenerator = require('sitemap-generator');

// Temporarily suppress the TLS warning
process.removeAllListeners('warning');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // If it is needed for crawler

// Use your actual domain URL (you should change this to your new Vercel domain or your custom domain)
const domain = process.env.VITE_PUBLIC_URL || 'https://optimasfibre.com';

const generator = sitemapGenerator(domain, {
  stripQuerystring: true,
  filepath: './public/sitemap.xml',
  maxDepth: 1, // Limiting depth can prevent timeouts on serverless functions like Vercel
});

generator.on('done', () => {
  console.log('✅ Sitemap generation complete for ' + domain);
});

generator.on('error', (error) => {
  console.error('❌ Sitemap generation error:', error);
});

generator.start();
