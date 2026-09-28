import type { MetadataRoute } from 'next';
import { articles } from '../lib/content';
export default function sitemap(): MetadataRoute.Sitemap { const base='https://gameraesthetic.fbr.news'; return [{url:base, lastModified:new Date()}, {url:`${base}/articles`, lastModified:new Date()}, ...articles.map(a=>({url:`${base}/articles/${a.slug}`, lastModified:new Date(a.date)})), ...['about','contact','disclaimer'].map(path=>({url:`${base}/${path}`,lastModified:new Date()}))]; }
