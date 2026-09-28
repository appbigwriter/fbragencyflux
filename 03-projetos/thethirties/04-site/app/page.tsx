import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <p className="eyebrow">The Thirties · by Maia Mendes</p>
      <h1>Evidence-based living, in your thirties.</h1>
      <p className="lede">The decade when everything changes at once. Practical notes on wellness, relationships, identity and the life you are actually living.</p>
      <section className="card" aria-labelledby="featured-heading">
        <p className="kicker">Featured draft</p>
        <h2 id="featured-heading">A Capsule Wardrobe for the Life You Actually Have</h2>
        <p>A smaller wardrobe is useful when it serves your calendar—not an imaginary woman with twelve weddings a year.</p>
        <Link className="link" href="/about">Meet Maia →</Link>
      </section>
      <p className="disclosure">Maia is a declared editorial persona and AI-assisted guide, not a doctor or therapist. Recommendations and affiliate relationships are disclosed clearly.</p>
    </main>
  );
}
