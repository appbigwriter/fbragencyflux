import Link from 'next/link';

type ProductCalloutProps = {
  category: string;
  title: string;
  description: string;
  criteria: string[];
  href?: string;
};

export function ProductCallout({ category, title, description, criteria, href = '/#newsletter' }: ProductCalloutProps) {
  return <aside className="product-callout" aria-label={`Product guide: ${title}`}>
    <div><p className="eyebrow">{category}</p><h3>{title}</h3><p>{description}</p><ul>{criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul></div>
    <div className="product-callout-action"><Link className="button button-primary" href={href}>See our criteria</Link><small>Affiliate links may earn After Forty a commission. We only publish recommendations after editorial review.</small></div>
  </aside>;
}
