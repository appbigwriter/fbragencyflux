import Link from 'next/link';
import { articles, categories } from '../../lib/content';

export default function ArticlesPage() {
  return (
    <main className="shell">
      <header className="page-header">
        <Link className="text-link" href="/">
          ← Gamer Aesthetic
        </Link>
        <p className="eyebrow">The field guide</p>
        <h1>Guides for better gear decisions.</h1>
        <p className="lede">
          Compare the trade-offs, check compatibility and know when to skip the upgrade.
        </p>
      </header>

      <div className="filter-row" aria-label="Categories">
        {categories().map((c) => (
          <span className="chip" key={c}>
            {c}
          </span>
        ))}
      </div>

      <section className="article-grid">
        {articles.map((article) => (
          <article className="card" key={article.slug}>
            {article.image && (
              <div className="card-thumb">
                <img src={article.image} alt={article.title} loading="lazy" />
              </div>
            )}
            <div className="card-body">
              <div className="card-meta">
                <span>{article.category}</span>
                <span>{article.readTime}</span>
              </div>
              <h3>
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h3>
              <p>{article.description}</p>
              <Link className="text-link" href={`/articles/${article.slug}`}>
                Read guide →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
