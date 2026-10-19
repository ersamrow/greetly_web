import './about-section.css';

export default function AboutSection() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="about-copy">
        <span className="eyebrow">ABOUT GREETLO</span>
        <h2 id="about-heading">A little more connection.</h2>
        <p>Greetlo helps you make someone’s day with personalised greeting cards for life’s celebrations and everyday moments. Choose a design, add your own words and photos, and share something personal.</p>
      </div>
      <article className="founder-card" aria-labelledby="founder-name">
        <img src="/team/gobind-singh-samrow.webp" alt="Gobind Singh Samrow" width="400" height="427" loading="lazy" decoding="async" />
        <h3 id="founder-name">Gobind Singh Samrow</h3>
        <p>Founder &amp; Project Manager</p>
      </article>
    </section>
  );
}
