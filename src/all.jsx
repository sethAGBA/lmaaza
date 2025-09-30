import React, { useState, useEffect } from 'react';
// Icons are imported inside each section component when needed
import Header from './components/Header';
import Footer from './components/Footer';
import AccueilSection from './sections/Accueil';
import AProposSection from './sections/APropos';
import Services from './sections/Services';
import ProduitsSection from './sections/Produits';
import SolutionsSection from './sections/Solutions';
import FormationsSection from './sections/Formations';
import ProjetsSection from './sections/Projets';
import PartenairesSection from './sections/Partenaires';
import ContactSection from './sections/Contact';
import data from './data';

// Re-export existing variable names from the shared data module for backwards compatibility
const { menuItems, services } = data;

const LmaazaApp = () => {
  const [activeSection, setActiveSection] = useState('accueil');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Advance to the next menu item (cycles back to start)
  const goToNext = () => {
    const ids = menuItems.map(m => m.id);
    const currentIndex = ids.indexOf(activeSection);
    const nextIndex = (currentIndex + 1) % ids.length;
    const next = ids[nextIndex];
    setActiveSection(next);
    // small UX: scroll to top when changing sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  

  // Footer component moved to `src/components/Footer.jsx`

  const renderSection = () => {
    switch(activeSection) {
      case 'accueil': return <AccueilSection onDiscoverServices={() => setActiveSection('services')} onContact={() => setActiveSection('contact')} />;
      case 'apropos': return <AProposSection />;
  case 'services': return <Services services={services} onSeeProjects={() => setActiveSection('projets')} />;
      case 'solutions': return <SolutionsSection />;
  case 'produits': return <ProduitsSection setActiveSection={setActiveSection} />;
      case 'formations': return <FormationsSection />;
      case 'projets': return <ProjetsSection />;
      case 'partenaires': return <PartenairesSection />;
      case 'contact': return <ContactSection />;
      default: return <AccueilSection />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        isScrolled={isScrolled}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        menuItems={menuItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <main>
        {renderSection()}
      </main>
      {/* Floating next-screen button */}
      <button
        aria-label="Écran suivant"
        title="Écran suivant"
        onClick={goToNext}
        className="next-screen-btn"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 26,
          background: '#6b21a8',
          color: '#fff',
          border: 'none',
          padding: '12px 16px',
          borderRadius: 9999,
          boxShadow: '0 6px 20px rgba(107,33,168,0.18)',
          cursor: 'pointer',
          zIndex: 1200,
          fontWeight: 700
        }}
      >
        Écran suivant
      </button>
      <Footer />
    </div>
  );
};

export default LmaazaApp;