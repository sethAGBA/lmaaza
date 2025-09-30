import React from 'react';
import { ArrowRight } from 'lucide-react';
import './Accueil.css';

const AccueilSection = ({ onDiscoverServices, onContact }) => (
  <section className="accueil-hero" aria-label="Accueil">
    <div className="accueil-inner">
      <h1 className="accueil-title">L'Maaza</h1>
      <p className="accueil-sub">Première plateforme technologique innovante de la région de la Kara</p>
      <p className="accueil-lead">Nous développons des solutions technologiques pour l'Agriculture, la Santé, l'Éducation et l'Environnement</p>

      <div className="accueil-cta">
        <button onClick={onDiscoverServices} className="btn-white">Découvrir nos services <ArrowRight className="icon" /></button>
        <button onClick={onContact} className="btn-outline">Nous contacter</button>
      </div>

      <div className="accueil-stats">
        <div className="stats-grid">
          <div>
            <div className="stat-number">20+</div>
            <div className="stat-label">Années d'expérience</div>
          </div>
          <div>
            <div className="stat-number">5</div>
            <div className="stat-label">Domaines d'expertise</div>
          </div>
          <div>
            <div className="stat-number">25+</div>
            <div className="stat-label">Jeunes formées (P.A.M.F)</div>
          </div>
          <div>
            <div className="stat-number">3</div>
            <div className="stat-label">Axes stratégiques</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AccueilSection;
