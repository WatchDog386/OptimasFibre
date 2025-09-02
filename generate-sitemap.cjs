const sitemapGenerator = require('sitemap-generator');

// Use your actual Netlify URL
const generator = sitemapGenerator('https://optimas-fibre.netlify.app/', {
  stripQuerystring: true,
  filepath: './public/sitemap.xml',
  maxDepth: 0,
});

generator.on('done', () => {
  console.log('✅ Sitemap generation complete');
});

generator.start();
