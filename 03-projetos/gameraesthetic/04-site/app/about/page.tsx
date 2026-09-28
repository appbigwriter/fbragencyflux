import Link from 'next/link';

export default function About() {
  return (
    <main className="shell prose-page">
      <Link className="text-link" href="/">
        ← Gamer Aesthetic
      </Link>
      <p className="eyebrow">About</p>
      <h1>Gear advice with context.</h1>

      {/* Box Editorial do Gestor */}
      <div className="author-box">
        <div className="author-avatar">
          <img src="/images/authors/tara-lindqvist.png" alt="Tara Lindqvist" />
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem' }}>Tara Lindqvist</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
            Editorial Lead & Hardware Curator · Scandinavian clean aesthetic & setup enthusiast.
          </p>
        </div>
      </div>

      <p>
        Gamer Aesthetic is an editorial guide for gamers choosing displays, audio and setup accessories across platforms. We focus on constraints, compatibility and trade-offs—not hype.
      </p>
      <p>
        Our standard is simple: explain what a product solves, what it does not solve and when keeping what you already own is the better decision.
      </p>
    </main>
  );
}
