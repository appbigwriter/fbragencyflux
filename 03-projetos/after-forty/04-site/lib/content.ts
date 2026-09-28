export type Article = { slug: string; category: string; title: string; dek: string; body: string[] };

export const articles: Article[] = [
  { slug: 'retinol-vs-bakuchiol', category: 'Skin Health', title: 'Retinol vs. Bakuchiol: What the Evidence Says', dek: 'A calmer way to choose an active ingredient after 40.', body: ['Retinol has the longer evidence history for visible lines, uneven tone, and texture. Bakuchiol has encouraging early comparative research and may suit people who do not tolerate retinol well.', 'Neither ingredient is a miracle product, and neither replaces daily sun protection. The most useful choice is the one you can use safely and consistently.'] },
  { slug: 'sleep-optimization-after-40', category: 'Recovery & Longevity', title: 'Sleep Optimization After 40', dek: 'Build better circadian signals without a “reset” hack.', body: ['A stable wake time, morning light, a calmer final hour, and thoughtful caffeine timing are practical places to start.', 'Persistent insomnia, loud snoring, gasping, severe daytime sleepiness, or major mood changes deserve professional evaluation.'] },
  { slug: 'building-muscle-at-45', category: 'Strength & Movement', title: 'Building Muscle at 45', dek: 'A realistic starting point with bands and dumbbells.', body: ['Adults can build strength at 45 and beyond with consistent resistance training, gradual progression, and enough recovery.', 'Bands and dumbbells can both work. The best equipment is the option that lets you train safely and repeatably.'] },
];

export function getArticle(slug: string) { return articles.find((article) => article.slug === slug); }
