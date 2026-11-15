// GET /sitemap.xml — public pages plus every published blog post, built on request.
import express from 'express';
import { BlogPost } from '../models/index.js';
import { escapeHtml } from '../utils/format.js';

const router = express.Router();

const PAGES = ['/', '/about', '/services', '/wifi-plans', '/coverage', '/blog', '/faqs', '/contact', '/vacancies'];

router.get('/sitemap.xml', async (req, res) => {
  const site = (process.env.FRONTEND_URL || 'https://optimaswifi.co.ke').split(',')[0].trim().replace(/\/$/, '');
  const posts = await BlogPost.findAll({
    where: { published: true },
    attributes: ['slug', 'updatedAt'],
    order: [['publishedAt', 'DESC']]
  });

  const urls = [
    ...PAGES.map((path) => `  <url><loc>${escapeHtml(site + path)}</loc></url>`),
    ...posts.map((post) => `  <url><loc>${escapeHtml(`${site}/blog/${post.slug}`)}</loc><lastmod>${post.updatedAt.toISOString().slice(0, 10)}</lastmod></url>`)
  ];

  res.type('application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
});

export default router;
