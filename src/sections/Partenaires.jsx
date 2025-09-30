import React from 'react';
import './Partenaires.css';

const PartenairesSection = ({ setActiveSection }) => (
  <section className="partenaires-section">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="title">Nos Partenaires</h2>
        <p className="sub">Un écosystème de collaboration pour l'innovation technologique</p>
      </div>

      <div className="partners-grid">
        {[
          { name: "KA Technologies Group", type: "Partenaire Technologique", logo: "🏢" },
          { name: "Tilitu Lab", type: "Incubateur", logo: "🚀" },
          { name: "Nunya Lab", type: "Hub d'Innovation", logo: "💡" },
          { name: "GRASE-Population", type: "ONG Partenaire", logo: "🤝" }
        ].map((p, i) => (
          <div key={i} className="partner-card">
            <div className="logo">{p.logo}</div>
            <h3 className="partner-name">{p.name}</h3>
            <p className="partner-type">{p.type}</p>
          </div>
        ))}
      </div>

      <div className="cta-box">
        <h3>Recherche de Partenaires</h3>
        <p className="cta-desc">Nous sommes toujours à la recherche de nouveaux partenaires pour étendre notre impact et développer des solutions technologiques innovantes ensemble.</p>
        <button className="btn-primary" onClick={() => setActiveSection && setActiveSection('contact')}>Devenir Partenaire</button>
      </div>
    </div>
  </section>
);

export default PartenairesSection;
