import React from 'react';
import './Services.css';
// Icons are rendered via data or section components when needed

const Services = ({ services, onSeeProjects }) => (
  <div className="services-section">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="section-title">Nos Services</h2>
        <p className="section-sub">Trois axes stratégiques pour votre réussite technologique</p>
      </div>

      {services.map((category, index) => (
        <div key={index} className="service-category">
          <h3 className="category-title">Axe {index + 1}: {category.category}</h3>
          <div className="service-grid">
            {category.items.map((service, idx) => (
              <div key={idx} className="service-card">
                <div className="service-card-top">
                  <div className="service-icon">{service.icon ? service.icon : null}</div>
                  <h4 className="service-name">{service.name}</h4>
                </div>
                <p className="service-desc">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="project-axe">
        <h3 className="category-title">Axe 3: Gestion des Projets</h3>
        <div className="project-description">
          <p>
            Nous élaborons des projets de formation spécialement conçus pour les jeunes filles dans les milieux ruraux,
            visant à démystifier la technologie et encourager l'orientation vers les filières technologiques.
          </p>
          <div className="project-cards">
            <div className="project-card">
              <h4>Démystification</h4>
              <p>Montrer que la technologie n'est pas une boîte noire mystérieuse</p>
            </div>
            <div className="project-card">
              <h4>Pratique</h4>
              <p>Lier les cours théoriques à la pratique concrète</p>
            </div>
            <div className="project-card">
              <h4>Orientation</h4>
              <p>Encourager les carrières technologiques post-BEPC</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta">
        <button className="cta-button" onClick={onSeeProjects}>Demander une démonstration</button>
      </div>
    </div>
  </div>
);

export default Services;
