import React from 'react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import './Contact.css';

const ContactSection = () => (
  <section className="contact-section">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="title">Contactez-Nous</h2>
        <p className="sub">Prêt à transformer votre vision technologique en réalité ?</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <h3>Informations de Contact</h3>
          <div className="info-list">
            <div className="info-item"><MapPin className="ic"/>Région de la Kara, Togo</div>
            <div className="info-item"><Phone className="ic"/>+228 93 89 29 19 / 90 09 26 72</div>
            <div className="info-item"><Mail className="ic"/>contact@lmaaza.tg</div>
            <div className="info-item"><Globe className="ic"/>www.lmaaza.tg</div>
          </div>

          <div className="domains">
            <h4>Nos Domaines d'Intervention</h4>
            <div className="domains-grid">
              {['Éducation', 'Agriculture/Élevage', 'Santé', 'Environnement', 'Technologie', 'Formation'].map((d) => (
                <div key={d} className="domain-pill">{d}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="contact-form">
          <h3>Envoyez-nous un Message</h3>
          <div className="form-fields">
            <label>Nom Complet<input type="text" placeholder="Votre nom complet"/></label>
            <label>Email<input type="email" placeholder="votre@email.com"/></label>
            <label>Téléphone<input type="tel" placeholder="+228 XX XX XX XX"/></label>
            <label>Service d'Intérêt<select>
              <option>Formations</option>
              <option>Solutions Technologiques</option>
              <option>Serveur Automatique</option>
              <option>Impression 3D</option>
              <option>Partenariat</option>
              <option>Autre</option>
            </select></label>
            <label>Message<textarea rows={4} placeholder="Décrivez votre projet ou vos besoins..."></textarea></label>
            <button className="btn-submit" onClick={() => alert('Message envoyé avec succès!')}>Envoyer le Message</button>
          </div>
        </div>
      </div>

      <div className="cta-join">
        <div className="cta-panel">
          <h3>Rejoignez la Révolution Technologique</h3>
          <p>Ensemble, construisons l'avenir technologique du Togo et de l'Afrique</p>
          <div className="cta-actions">
            <button className="btn-primary">Demander un Devis</button>
            <button className="btn-outline">Planifier une Rencontre</button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ContactSection;
