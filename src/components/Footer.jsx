import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <h3 className="brand-title">L'Maaza</h3>
          <p className="muted">Première plateforme technologique innovante de la région de la Kara, au service de la transformation digitale togolaise.</p>
          <div className="socials" style={{marginTop: '0.75rem'}}>
            {['📘', '📷', '💼', '🐦'].map((social, index) => (
              <div key={index} className="social-pill" title={social}>
                {social}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="links-title">Nos Services</h4>
          <ul className="links-list">
            <li>Solutions Technologiques</li>
            <li>Formations</li>
            <li>Impression 3D</li>
            <li>Développement</li>
          </ul>
        </div>

        <div>
          <h4 className="links-title">Domaines</h4>
          <ul className="links-list">
            <li>Éducation</li>
            <li>Agriculture</li>
            <li>Santé</li>
            <li>Environnement</li>
          </ul>
        </div>

        <div>
          <h4 className="links-title">Contact Rapide</h4>
          <div className="muted">
            <p>Région de la Kara, Togo</p>
            <p>contact@lmaaza.tg</p>
            <p>+228 93 8929 19 / 90 09 26 72</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 L'Maaza - Startup Technologique. Tous droits réservés.</p>
        <p className="mt-2">Développé avec passion pour l'innovation technologique africaine</p>
      </div>
    </div>
  </footer>
);

export default Footer;
