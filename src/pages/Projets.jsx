import React from 'react';
import { Award, Cpu, Code, Wrench } from 'lucide-react';
import { projets } from '../data';

const Projets = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Projets Réalisés</h2>
          <p className="text-xl text-gray-600">Des actions concrètes pour l'éveil technologique des jeunes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {projets.map((projet, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{projet.name}</h3>
                  <p className="text-purple-600 font-medium">{projet.fullName}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{projet.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Année</div>
                  <div className="font-semibold text-gray-800">{projet.year}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Lieu</div>
                  <div className="font-semibold text-gray-800">{projet.location}</div>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-500">Impact</div>
                <div className="font-semibold text-purple-600">{projet.impact}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Formation Arduino chez Tilitu Lab</h3>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 mb-6">
              En collaboration avec Tilitu Lab, nous avons organisé une formation Arduino couplée d'initiation aux NTIC 
              pendant les congés de Pâques. Cette formation vise à maintenir une veille technologique chez les participants 
              et à les pousser vers la créativité et l'innovation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <Cpu className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Arduino</h4>
                <p className="text-sm text-gray-600">Découverte des potentiels électroniques du kit Arduino</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <Code className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Programmation</h4>
                <p className="text-sm text-gray-600">Écriture de programmes simples en langage Arduino</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <Wrench className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Pratique</h4>
                <p className="text-sm text-gray-600">Réalisation de montages électroniques sur platine</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Modules P.E.T.E (Collège Adel)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {['Fablabs / Incubateurs', 'Machines à commande numérique', 'Programmer un objet avec Arduino', 'Prototypage et professionalisation', 'Imprimer en 3D', 'Fabrication numérique'].map((module, index) => (
              <div key={index} className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                <span className="font-semibold text-purple-600">{module}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projets;
