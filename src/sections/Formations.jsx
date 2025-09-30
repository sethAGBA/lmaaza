import React from 'react';
import { ArrowRight } from 'lucide-react';
import data from '../data';
import './Formations.css';

const { services } = data;

const FormationsSection = () => (
  <section className="formations-section">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="formations-title">Nos Formations</h2>
        <p className="formations-sub">Formations théoriques et pratiques adaptées au marché de l'emploi</p>
      </div>

      <div className="formations-grid">
        {services[1].items.map((formation, index) => (
          <article key={index} className="formation-card">
            <div className="formation-left">
              <div className="formation-icon">{/* icon from data */}{/* will render via external renderIcon if needed */}</div>
            </div>
            <div className="formation-body">
              <h3 className="formation-name">{formation.name}</h3>
              <p className="formation-desc">{formation.desc}</p>
              <div className="formation-more"><span>Modalités</span><ArrowRight className="icon" /></div>
            </div>
          </article>
        ))}
      </div>

      <div className="objectifs card">
        <h3>Objectifs de Nos Formations</h3>
        <div className="obj-grid">
          <div>
            <h4>Pour les Élèves et Étudiants</h4>
            <ul>
              <li>Démystifier les préjugés technologiques</li>
              <li>Encourager l'orientation vers les filières tech</li>
              <li>Lien entre théorie et pratique</li>
              <li>Spécial focus sur les jeunes filles</li>
            </ul>
          </div>
          <div>
            <h4>Pour les Artisans et Professionnels</h4>
            <ul>
              <li>Recyclage et mise à niveau technologique</li>
              <li>Adaptation aux nouvelles technologies</li>
              <li>Amélioration de l'employabilité</li>
              <li>Entrepreneuriat technologique</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="formations-cta">
        <div className="cta-panel">
          <h3>Groupe Cible Prioritaire</h3>
          <p>Nous nous concentrons particulièrement sur les jeunes filles en milieu rural pour leur offrir l'opportunité de découvrir et d'embrasser les technologies.</p>
          <div className="cta-actions">
            <button className="btn-primary">Voir nos projets réalisés</button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default FormationsSection;
