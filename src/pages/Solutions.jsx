import React from 'react';
import RenderContent from '../components/RenderContent';
import { ArrowRight } from 'lucide-react';
import { solutions } from '../data';

const Solutions = ({ menuItems }) => {
  const solutionsPage = menuItems.find(item => item.id === 'solutions');

  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Solutions par Secteur</h2>
          <div className="text-xl text-gray-600">
            {solutionsPage ? <RenderContent content={solutionsPage.content} /> : "Chargement du contenu..."}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className={`h-2 ${solution.color}`}></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{solution.domain}</h3>
                <p className="text-gray-600 mb-4">{solution.desc}</p>
                <div className="flex items-center text-purple-600 hover:text-purple-800 cursor-pointer">
                  <span className="text-sm font-semibold">En savoir plus</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Approche Innovation Ouverte</h3>
            <p className="text-gray-600 mb-6">
              Nous combinons l'expertise métier, l'expérience et la maîtrise des nouvelles technologies 
              avec l'agilité des startups pour déployer des solutions innovantes répondant aux besoins 
              du grand public et des grandes entreprises publiques et privées.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              {['Éducation', 'Informatique', 'Télécom', 'Environnement', 'Agriculture', 'Commerce'].map((domaine) => (
                <div key={domaine} className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-sm font-semibold text-purple-600">{domaine}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solutions;
