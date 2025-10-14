import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const Accueil = ({ menuItems }) => {
  // Mot de bienvenue du directeur
  const directorWelcome = `Mot de bienvenue du Directeur :\n\nBienvenue à toutes et à tous sur le site de L'Maaza.\n\nNotre StartUp s'engage fermement à développer des solutions technologiques innovantes et durables pour améliorer la vie de nos communautés. Depuis notre création en 2022, nous nous efforçons de démocratiser l'accès aux technologies et de former les jeunes, particulièrement les filles aux metiers technologiques de demains, aux métiers de demain.\n\nNous croyons en un avenir où l'innovation technologique et la tradition se rencontrent harmonieusement pour créer un impact positif et durable. Rejoignez-nous dans cette mission passionnante !\n\nBEBINESSO Toï Bebezseky\nDirecteur de L'Maaza`;

  const accueilPage = menuItems.find(item => item.id === 'accueil');
  const content = accueilPage ? accueilPage.content : null;

  const lead = content && typeof content === 'object' ? content.lead : (content || "");
  const subtext = content && typeof content === 'object' ? content.subtext : "";
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
    <>
      <SEO 
        title="L'Maaza - Innover au service des communautés"
        description="L'Maaza développe des solutions technologiques innovantes pour l'Agriculture, la Santé, l'Éducation et l'Environnement au Togo. Formation des jeunes, projets technologiques et innovation durable."
        keywords="L'Maaza, technologie, innovation, agriculture, santé, éducation, environnement, Togo, formation, électronique, Arduino, développement web, énergie solaire, BEBINESSO Toï Bebezseky"
        canonical="https://lmaaza.net"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "L'Maaza - Accueil",
          "description": "Page d'accueil de L'Maaza, organisation développant des solutions technologiques innovantes au Togo",
          "url": "https://lmaaza.net",
          "mainEntity": {
            "@type": "Organization",
            "name": "L'Maaza",
            "founder": {
              "@type": "Person",
              "name": "BEBINESSO Toï Bebezseky",
              "jobTitle": "Directeur"
            }
          }
        }}
      />
      <div className={`min-h-screen ${heroBg}`}>
        {/* Hero Section */}
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">L'Maaza - Solutions Technologiques Innovantes au Togo</h1>
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

          {/* Director welcome */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900 py-16 shadow-xl">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-purple-600 mb-2">Mot de bienvenue</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-purple-500">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-md">
                    <img src="/images/directeur.jpeg" alt="BEBINESSO Toï Bebezseky" className="object-cover w-full h-full" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">BEBINESSO Toï Bebezseky</h3>
                  <p className="text-lg text-purple-600 font-medium">Directeur de L'Maaza</p>
                </div>
                {directorWelcome.split('\n').map((p, i) => (
                  <p key={i} className={`mb-4 text-gray-700 leading-relaxed ${i === 0 ? 'text-lg font-semibold text-purple-600' : i === 1 ? 'text-xl font-medium text-gray-800' : 'text-base'}`}>
                    {p}
                  </p>
                ))}
              </div>
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
    </>
  );
};

export default Accueil;