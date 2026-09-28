import type { MetadataRoute } from 'next';

const routes = ['', 'about', 'contact', 'privacy', 'affiliate-disclosure', 'category/all', 'articles/retinol-vs-bakuchiol', 'articles/sleep-optimization-after-40', 'articles/building-muscle-at-45'];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: `https://afterforty.fbr.news/${route}`, lastModified: new Date(), changeFrequency: route.startsWith('articles/') ? 'monthly' : 'weekly', priority: route === '' ? 1 : route.startsWith('articles/') ? 0.7 : 0.8 }));
}
