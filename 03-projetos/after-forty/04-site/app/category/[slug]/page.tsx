import Link from 'next/link';
import { articles } from '../../../lib/content';

export default function CategoryPage() {
  return <main><header className="site-header"><Link className="wordmark" href="/">AFTER <span>FORTY</span></Link><nav><Link href="/#about">About Heidi</Link><Link className="nav-cta" href="/#newsletter">Weekly reset</Link></nav></header><section className="category-page"><p className="eyebrow">THE LIBRARY</p><h1>Evidence for the next good decision.</h1><p className="category-dek">Explore practical, research-informed guidance for skin health, strength, recovery, and healthy aging.</p><div className="category-grid">{articles.map((article) => <article className="category-card" key={article.slug}><p className="eyebrow">{article.category.toUpperCase()}</p><h2>{article.title}</h2><p>{article.dek}</p><Link className="text-link" href={`/articles/${article.slug}`}>Read the article →</Link></article>)}</div></section></main>;
}
