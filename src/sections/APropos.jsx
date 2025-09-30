import React from 'react';
import { Target, Zap, Award, Users } from 'lucide-react';
import data from '../data';
import './APropos.css';

const { teamMembers } = data;

const AProposSection = () => (
  <section className="apropos-section">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="apropos-title">À Propos de L'Maaza</h2>
        <p className="apropos-lead">Une startup technologique innovante au cœur de la transformation digitale togolaise</p>
      </div>

      <div className="grid two-col gap-12 mb-16">
        <div>
          <h3 className="section-heading"><Target className="ic"/>Notre Raison d'Être</h3>
          <div className="text-muted">
            <p>Dans la région de la Kara, nous avons identifié un manque crucial de structures proposant des solutions technologiques innovantes. L'Maaza se positionne comme une entreprise technologique locale pour combler ce vide.</p>
            <p>Nous répondons à trois défis majeurs :</p>
            <ul className="list">
              <li>L'insuffisance de compétences technologiques locales</li>
              <li>Le manque de solutions technologiques adaptées</li>
              <li>La faible orientation des jeunes, surtout les filles, vers les filières technologiques</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="section-heading"><Zap className="ic"/>Notre Vision & Mission</h3>
          <div className="card">
            <h4 className="card-title">Vision</h4>
            <p>Développer des solutions technologiques innovantes dans l'Agriculture, la Santé, l'Éducation et la Protection de l'environnement.</p>
          </div>
          <div className="card">
            <h4 className="card-title">Mission</h4>
            <p>Contribuer au développement de solutions technologiques de qualité et accompagner les structures éducatives par des formations adaptées à l'employabilité des jeunes.</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-12">
        <h3 className="section-heading">Nos Valeurs</h3>
        <div className="values-grid">
          {['Accessibilité', 'Professionnalisme', 'Innovation', 'Acquisition continue du savoir', 'Respect'].map((valeur, index) => (
            <div key={index} className="value-card">
              <div className="value-icon"><Award className="ic-small"/></div>
              <h4 className="value-title">{valeur}</h4>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="section-heading">Notre Équipe</h3>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar"><Users className="ic"/></div>
              <h4 className="team-name">{member.name}</h4>
              <p className="team-role">{member.role}</p>
              {member.experience && <p className="team-exp">{member.experience}</p>}
              <div className="team-tags">
                {member.specialties.map((s, i) => <span key={i} className="tag">{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AProposSection;
