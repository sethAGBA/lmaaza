import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Accueil = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Hero Section */}
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            L'Maaza
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Première plateforme technologique innovante de la région de la Kara
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto opacity-80">
            Nous développons des solutions technologiques pour l'Agriculture, la Santé, l'Éducation et l'Environnement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/services"
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              Découvrir nos services <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/10 backdrop-blur-md py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accueil;
