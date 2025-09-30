import React from 'react';
import { CheckCircle, Cpu } from 'lucide-react';
import './Produits.css';

const ProduitsSection = ({ setActiveSection }) => {
  return (
    <section className="produits-section" aria-labelledby="produits-heading">
      <div className="container">
        <header className="produits-header" role="banner">
          <h2 id="produits-heading" className="produits-title">Nos Produits Phares</h2>
          <p className="produits-subtitle">Innovation au service de la tradition</p>
        </header>

        <div className="produits-card-wrapper">
          <article className="produits-card gradient" aria-describedby="produit-desc">
            <div className="produits-left">
              <div className="produits-icon-wrap" aria-hidden>
                <div className="produits-icon-bg">
                  <Cpu className="produits-icon" />
                </div>
                <h3 className="produits-card-title">Serveur Automatique</h3>
              </div>
            </div>

            <div className="produits-right">
              <h3 className="produits-right-title">Serveur Automatique de Boissons Locales</h3>
              <p id="produit-desc" className="produits-desc">Une solution innovante pour servir les boissons traditionnelles (Tchoukoutou, Tchakpalo, Baam, Liha, etc.) dans des conditions sanitaires optimales tout en préservant nos traditions.</p>

              <div className="produits-features" role="list">
                <div className="feature" role="listitem">🏥 Santé<p className="feature-desc">Conditions sanitaires optimales</p></div>
                <div className="feature" role="listitem">🏛️ Tradition<p className="feature-desc">Respect des coutumes locales</p></div>
                <div className="feature" role="listitem">💰 Économique<p className="feature-desc">Gestion automatisée des ventes</p></div>
              </div>

              <div className="produits-checks">
                <div className="check"><CheckCircle className="check-icon" aria-hidden/> <span>Service hygiénique sans contact direct</span></div>
                <div className="check"><CheckCircle className="check-icon" aria-hidden/> <span>Préservation de l'ambiance traditionnelle</span></div>
                <div className="check"><CheckCircle className="check-icon" aria-hidden/> <span>Dosage précis et équitable</span></div>
                <div className="check"><CheckCircle className="check-icon" aria-hidden/> <span>Protection contre le vol</span></div>
              </div>
            </div>
          </article>
        </div>

        <div className="produits-cta text-center">
          <button onClick={() => setActiveSection('contact')} className="btn-primary" aria-label="Demander une démonstration">Demander une démonstration</button>
        </div>
      </div>
    </section>
  );
};

export default ProduitsSection;
