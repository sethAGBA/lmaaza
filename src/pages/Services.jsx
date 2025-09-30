import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { services } from '../data';

const Services = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Services</h2>
          <p className="text-xl text-gray-600">Trois axes stratégiques pour votre réussite technologique</p>
        </div>

        {services.map((category, index) => (
          <div key={index} className="mb-12">
            <h3 className="text-2xl font-bold text-purple-600 mb-8 text-center">
              Axe {index + 1}: {category.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((service, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow border-l-4 border-purple-600">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg mr-4">
                      {service.icon}
                    </div>
                    <h4 className="font-bold text-gray-800">{service.name}</h4>
                  </div>
                  <p className="text-gray-600">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-purple-50 p-8 rounded-lg mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Axe 3: Gestion des Projets
          </h3>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gray-600 mb-6">
              Nous élaborons des projets de formation spécialement conçus pour les jeunes filles dans les milieux ruraux, 
              visant à démystifier la technologie et encourager l'orientation vers les filières technologiques.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">Démystification</h4>
                <p className="text-sm text-gray-600">Montrer que la technologie n'est pas une boîte noire mystérieuse</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">Pratique</h4>
                <p className="text-sm text-gray-600">Lier les cours théoriques à la pratique concrète</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">Orientation</h4>
                <p className="text-sm text-gray-600">Encourager les carrières technologiques post-BEPC</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/projets"
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors inline-flex items-center"
          >
            Voir nos projets réalisés <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
