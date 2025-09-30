import React from 'react';
import { ArrowRight } from 'lucide-react';
import data from '../data';
import './Solutions.css';

const { solutions } = data;

const SolutionsSection = () => (
  <section className="solutions-section">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="solutions-title">Nos Solutions par Secteur</h2>
        <p className="solutions-sub">Des innovations technologiques pour transformer votre secteur d'activité</p>
      </div>

      <div className="solutions-grid">
        {solutions.map((solution, index) => (
          <article key={index} className="solution-card">
            <div className={`accent-bar ${solution.color}`} />
            <div className="solution-body">
              <h3 className="solution-domain">{solution.domain}</h3>
              <p className="solution-desc">{solution.desc}</p>
              <div className="solution-more">
                <span>En savoir plus</span>
                <ArrowRight className="icon" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionsSection;
