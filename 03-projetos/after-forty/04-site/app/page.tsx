import Link from 'next/link';

const pillars = [
  { eyebrow: 'SKIN HEALTH', title: 'A simpler way to care for changing skin.', copy: 'Ingredient explainers, routines, and realistic product decisions for adults 40+.' },
  { eyebrow: 'STRENGTH & MOVEMENT', title: 'Build capacity—not pressure.', copy: 'Beginner-friendly training, mobility, and cardio guidance for real life.' },
  { eyebrow: 'RECOVERY & LONGEVITY', title: 'Better habits, clearer evidence.', copy: 'Sleep, stress, nutrition, and supplement questions without miracle claims.' },
];

const featuredArticles = [
  { category: 'SKIN / EVIDENCE', title: 'Retinol vs. Bakuchiol: What the Evidence Says', copy: 'A calmer way to choose an active ingredient.' },
  { category: 'RECOVERY / SLEEP', title: 'Sleep Optimization After 40', copy: 'Build better circadian signals without a “reset” hack.' },
  { category: 'MOVEMENT / HOME', title: 'Building Muscle at 45', copy: 'A realistic starting point with bands and dumbbells.' },
];

export default function HomePage() {
  return <main>
    <header className="site-header"><Link className="wordmark" href="/">AFTER <span>FORTY</span></Link><nav aria-label="Primary"><a href="#read">Read</a><a href="#about">About Heidi</a><a className="nav-cta" href="#newsletter">Weekly reset</a></nav></header>
    <section className="hero"><p className="eyebrow">THE CALM, EVIDENCE-LED GUIDE TO MIDlife</p><h1>Feel and look <em>stronger</em> after forty.</h1><p className="dek">Practical, research-informed guidance for skin health, strength, recovery, and the decisions that make healthy aging feel less overwhelming.</p><div className="hero-actions"><a className="button button-primary" href="#read">Explore the latest</a><a className="text-link" href="#about">Meet Heidi Braun →</a></div></section>
    <section className="trust-strip"><span>Evidence, not anxiety.</span><span>Simple next steps.</span><span>No miracle promises.</span></section>
    <section id="read" className="section"><div className="section-heading"><p className="eyebrow">START HERE</p><h2>Three ways to feel more at home in your body.</h2></div><div className="pillar-grid">{pillars.map((pillar) => <article className="pillar-card" key={pillar.eyebrow}><p className="eyebrow">{pillar.eyebrow}</p><h3>{pillar.title}</h3><p>{pillar.copy}</p><a className="text-link" href="#newsletter">Read the evidence →</a></article>)}</div></section>
    <section className="section featured-section"><div className="section-heading"><div><p className="eyebrow">EDITOR&apos;S PICKS</p><h2>Start with one useful question.</h2></div><a className="text-link" href="#newsletter">View all reading →</a></div><div className="featured-grid">{featuredArticles.map((article) => <article className="featured-card" key={article.title}><p className="eyebrow">{article.category}</p><h3>{article.title}</h3><p>{article.copy}</p><a className="text-link" href="#newsletter">Read the evidence →</a></article>)}</div></section>
    <section id="about" className="about-section"><div className="about-mark">HB</div><div><p className="eyebrow">ABOUT HEIDI</p><h2>Confident, not corrective.</h2><p>After Forty is hosted by Heidi Braun, an editorial point of view built around transparent sourcing, practical routines, and respect for the lived experience of aging. We explain what the evidence can—and cannot—tell us.</p></div></section>
    <section id="newsletter" className="newsletter"><p className="eyebrow">THE WEEKLY RESET</p><h2>One thoughtful note for your next good decision.</h2><p>No hype. Just a short, useful read for your skin, strength, and recovery.</p><form><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" placeholder="you@example.com" required /><button className="button button-primary" type="submit">Join the list</button></form></section>
    <footer><span>© After Forty by Heidi Braun</span><span>Educational content. Not medical advice.</span></footer>
  </main>;
}
