import Link from 'next/link';
import { articles, getArticle } from '../../../lib/content';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  return article
    ? {
        title: `${article.title} | Gamer Aesthetic`,
        description: article.description,
        openGraph: {
          title: article.title,
          description: article.description,
          images: article.image ? [{ url: article.image }] : [],
        },
      }
    : { title: 'Guide not found' };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <main className="shell">
      <article className="article">
        <Link className="text-link" href="/articles">
          ← All guides
        </Link>
        <div className="article-kicker" style={{ marginTop: '16px' }}>
          <span>{article.category}</span>
          <span>{article.readTime}</span>
        </div>
        <h1>{article.title}</h1>
        <p className="article-intro">{article.description}</p>

        {article.image && (
          <div className="article-banner">
            <img src={article.image} alt={article.title} />
          </div>
        )}

        <div className="article-body">
          {article.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <aside className="disclosure">
          <strong>Editorial disclosure</strong>
          <p>
            This guide is informational. Specifications, prices and availability change; verify current details before purchase. Gamer Aesthetic does not promise a performance outcome.
          </p>
        </aside>
      </article>
    </main>
  );
}
