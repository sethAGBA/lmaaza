import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Accueil = ({ menuItems }) => {
  const accueilPage = menuItems.find(item => item.id === 'accueil');
  const content = accueilPage ? accueilPage.content : null;

  const title = content && typeof content === 'object' ? content.title : (content || "L'Maaza");
  const lead = content && typeof content === 'object' ? content.lead : (content || "Bienvenue sur la page d'accueil de L'Maaza. Nous sommes ravis de vous accueillir.");
  const subtext = content && typeof content === 'object' ? content.subtext : "Nous développons des solutions technologiques pour l'Agriculture, la Santé, l'Éducation et l'Environnement";
  const heroBg = content && typeof content === 'object' ? content.heroBg || 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700';
  const ctaPrimary = content && typeof content === 'object' ? content.ctaPrimary || { text: 'Découvrir nos services', link: '/services' } : { text: 'Découvrir nos services', link: '/services' };
  const ctaSecondary = content && typeof content === 'object' ? content.ctaSecondary || { text: 'Nous contacter', link: '/contact' } : { text: 'Nous contacter', link: '/contact' };
  const stats = content && typeof content === 'object' ? content.stats || [] : [
    { value: "20+", label: "Années d'expérience" },
    { value: "5", label: "Domaines d'expertise" },
    { value: "25+", label: "Jeunes formées (P.A.M.F)" },
    { value: "3", label: "Axes stratégiques" }
  ];

  return (
  <div className={`min-h-screen ${heroBg}`}>
      {/* Hero Section */}
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">{title}</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">{lead}</p>
          <p className="text-lg mb-12 max-w-2xl mx-auto opacity-80">{subtext}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ctaPrimary.link}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              {ctaPrimary.text} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              to={ctaSecondary.link}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              {ctaSecondary.text}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/10 backdrop-blur-md py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            {stats.length > 0 ? stats.map((s, idx) => (
              <div key={idx}>
                <div className="text-3xl font-bold mb-2">{s.value}</div>
                <div className="text-sm opacity-80">{s.label}</div>
              </div>
            )) : (
              <>
                <div>
                  <div className="text-3xl font-bold mb-2">20+</div>
                  <div className="text-sm opacity-80">Années d'expérience</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">5</div>
                  <div className="text-sm opacity-80">Domaines d'expertise</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">25+</div>
                  <div className="text-sm opacity-80">Jeunes formées (P.A.M.F)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">3</div>
                  <div className="text-sm opacity-80">Axes stratégiques</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accueil;
