import React from 'react';
import { Award, Cpu, Code, Wrench } from 'lucide-react';
import data from '../data';
import './Projets.css';

const { projets } = data;

const ProjetsSection = () => (
  <section className="projets-section">
    <div className="container">
      <div className="intro text-center">
        <h2 className="projets-title">Nos Projets Réalisés</h2>
        <p className="projets-sub">Des actions concrètes pour l'éveil technologique des jeunes</p>
      </div>

      <div className="projets-grid">
        {projets.map((projet, index) => (
          <article key={index} className="projet-card">
            <header className="projet-head">
              <div className="badge"><Award className="icon" /></div>
              <div>
                <h3 className="projet-name">{projet.name}</h3>
                <div className="projet-full">{projet.fullName}</div>
              </div>
            </header>

            <p className="projet-desc">{projet.description}</p>

            <div className="projet-meta">
              <div>
                <div className="meta-label">Année</div>
                <div className="meta-value">{projet.year}</div>
              </div>
              <div>
                <div className="meta-label">Lieu</div>
                <div className="meta-value">{projet.location}</div>
              </div>
            </div>

            <div className="projet-impact">Impact: <strong>{projet.impact}</strong></div>
          </article>
        ))}
      </div>

      <div className="featured card">
        <h3>Formation Arduino chez Tilitu Lab</h3>
        <p>En collaboration avec Tilitu Lab, nous avons organisé une formation Arduino couplée d'initiation aux NTIC pendant les congés de Pâques.</p>
        <div className="module-grid">
          <div className="module"><Cpu className="ic"/>Arduino<br/><small>Découverte des potentiels électroniques</small></div>
          <div className="module"><Code className="ic"/>Programmation<br/><small>Écriture de programmes simples</small></div>
          <div className="module"><Wrench className="ic"/>Pratique<br/><small>Réalisation de montages électroniques</small></div>
        </div>
      </div>
    </div>
  </section>
);

export default ProjetsSection;
