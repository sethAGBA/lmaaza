import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { services } from '../data';

const Formations = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Formations</h2>
          <p className="text-xl text-gray-600">Formations théoriques et pratiques adaptées au marché de l'emploi</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {services[1].items.map((formation, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start">
                <div className="p-3 bg-purple-100 rounded-lg mr-4 mt-1">
                  {formation.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{formation.name}</h3>
                  <p className="text-gray-600 mb-4">{formation.desc}</p>
                  <div className="flex items-center text-purple-600">
                    <span className="text-sm font-semibold">Modalités</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Objectifs de Nos Formations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-purple-600 mb-4">Pour les Élèves et Étudiants</h4>
              <ul className="space-y-2">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Démystifier les préjugés technologiques</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Encourager l'orientation vers les filières tech</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Lien entre théorie et pratique</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Spécial focus sur les jeunes filles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-4">Pour les Artisans et Professionnels</h4>
              <ul className="space-y-2">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Recyclage et mise à niveau technologique</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Adaptation aux nouvelles technologies</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Employabilité accrue</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Innovation dans leur métier</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-lg text-white">
            <h3 className="text-2xl font-bold mb-4">Groupe Cible Prioritaire</h3>
            <p className="text-lg mb-6">
              Nous nous concentrons particulièrement sur les jeunes filles en milieu rural pour leur offrir 
              l'opportunité de découvrir et d'embrasser les technologies, en partenariat avec des ONG, 
              associations et clubs scientifiques.
            </p>
            <Link 
              to="/projets"
              className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Voir nos projets réalisés
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formations;
