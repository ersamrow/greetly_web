import {collectionGuides} from '@/lib/collection-guides';
export default function CollectionGuide({slug}:{slug:string}){
 const guide=collectionGuides[slug];
 if(!guide)return null;
 return <section className="editorial-guide" aria-labelledby="guide-title">
  <p className="eyebrow">WORDS & PRACTICAL HELP</p><h2 id="guide-title">{guide.title}</h2><p>{guide.intro}</p>
  <div className="guide-examples">{guide.examples.map(example=><article key={example.recipient}><h3>{example.recipient}</h3><blockquote>{example.message}</blockquote><p>{example.tip}</p></article>)}</div>
  <h3>Before you send</h3><ol>{guide.steps.map(step=><li key={step}>{step}</li>)}</ol>
  <h3>{guide.question}</h3><p>{guide.answer}</p><a href="/help">How to create, download and share a card →</a>
 </section>;
}
