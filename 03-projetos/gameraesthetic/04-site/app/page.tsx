import Link from 'next/link';
import { articles, categories } from '../lib/content';

export default function Home() {
  return (
    <main className="shell">
      {/* Hero com Imagem Imersiva */}
      <header className="hero-wrapper">
        <div className="hero-bg">
          <img 
            src="/images/hero/hero-main.png" 
            alt="Minimalist Battlestation Gaming Setup" 
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <p className="eyebrow">Gamer Aesthetic · Tara Lindqvist</p>
          <h1>Better gear decisions, without the hype.</h1>
          <p className="lede">
            Contextual guides, comparisons and setup advice for gamers who want to know what fits—and when to skip the purchase.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/articles">
              Explore guides
            </Link>
            <Link className="button" href="/about">
              Our editorial approach
            </Link>
          </div>
        </div>
      </header>

      {/* Grid de Guias e Artigos com Thumbnails */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The field guide</p>
            <h2>Read before you buy</h2>
          </div>
          <Link href="/articles" className="text-link">
            View all guides →
          </Link>
        </div>
        <div className="article-grid">
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
        </div>
      </section>

      {/* Pilares */}
      <section className="section pillars">
        <div>
          <p className="eyebrow">How we think</p>
          <h2>Function first. Context always.</h2>
        </div>
        <div className="pillar-grid">
          {categories().map((category) => (
            <div className="pillar" key={category}>
              <strong>{category}</strong>
              <p>Compatibility, space, budget and actual use—not hype.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rodapé */}
      <footer className="footer">
        <span>Specifications and availability change. Verify before purchase.</span>
        <nav>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </nav>
      </footer>
    </main>
  );
}
