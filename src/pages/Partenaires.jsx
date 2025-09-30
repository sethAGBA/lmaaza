import React from 'react';
import { Link } from 'react-router-dom';

const Partenaires = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Partenaires</h2>
          <p className="text-xl text-gray-600">Ensemble pour l'innovation technologique au Togo</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {['KA Technologies Group', 'Tilitu Lab', 'Nunya Lab', 'GRASE-Population'].map((partenaire, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">{partenaire.charAt(0)}</span>
                </div>
                <h3 className="font-semibold text-gray-800">{partenaire}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Devenez Partenaire</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Rejoignez notre réseau de partenaires et contribuons ensemble au développement technologique 
            de la région de la Kara et du Togo.
          </p>
          <Link 
            to="/contact"
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
          >
            Nous contacter pour un partenariat
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Partenaires;
