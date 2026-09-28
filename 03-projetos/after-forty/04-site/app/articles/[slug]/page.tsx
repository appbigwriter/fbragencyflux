import Link from 'next/link';
import { ProductCallout } from '../../../components/ProductCallout';
import { articles } from '../../../lib/content';

export function generateStaticParams() { return articles.map(({ slug }) => ({ slug })); }

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) return <main className="not-found"><p className="eyebrow">404</p><h1>That article is not here.</h1><Link className="text-link" href="/category/all">Back to reading →</Link></main>;
  return <main><header className="site-header"><Link className="wordmark" href="/">AFTER <span>FORTY</span></Link><nav><Link href="/category/all">All reading</Link><Link className="nav-cta" href="/#newsletter">Weekly reset</Link></nav></header><article className="article-page"><p className="eyebrow">{article.category.toUpperCase()}</p><h1>{article.title}</h1><p className="article-dek">{article.dek}</p>{article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<ProductCallout category="EDITORIAL BUYING GUIDE" title="Choose by criteria, not hype." description="When we review products, we look first at safety, transparent labeling, realistic use, and fit for the stated goal." criteria={["Clear ingredients or specifications", "Evidence-aligned claims", "Practical value and usability"]} /><div className="evidence-note"><strong>Editorial note</strong><span>This is educational content, not medical advice. Claims should be read with the full evidence article and its limitations.</span></div><Link className="text-link" href="/category/all">← Continue reading</Link></article></main>;
}
