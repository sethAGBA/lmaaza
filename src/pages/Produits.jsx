import React from 'react';
import RenderContent from '../components/RenderContent';
import { Link } from 'react-router-dom';
import { Cpu, CheckCircle, Heart, Building, DollarSign } from 'lucide-react';

const Produits = ({ menuItems }) => {
  const produitsPage = menuItems.find(item => item.id === 'produits');

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Produits Phares</h2>
          <div className="text-xl text-gray-600">
            {produitsPage ? <RenderContent content={produitsPage.content} /> : "Chargement du contenu..."}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 bg-white/10 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cpu className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Serveur Automatique</h3>
                </div>
              </div>
              <div className="md:w-2/3 p-8 text-white">
                <h3 className="text-3xl font-bold mb-6">Serveur Automatique de Boissons Locales</h3>
                <p className="text-lg mb-6 opacity-90">
                  Une solution innovante pour servir les boissons traditionnelles (Tchoukoutou, Tchakpalo, Baam, Liha, etc.) 
                  dans des conditions sanitaires optimales tout en préservant nos traditions.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center"><Heart className="w-5 h-5 mr-2" />Santé</h4>
                    <p className="text-sm opacity-80">Conditions sanitaires optimales</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center"><Building className="w-5 h-5 mr-2" />Tradition</h4>
                    <p className="text-sm opacity-80">Respect des coutumes locales</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center"><DollarSign className="w-5 h-5 mr-2" />Économique</h4>
                    <p className="text-sm opacity-80">Gestion automatisée des ventes</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
                    <span>Service hygiénique sans contact direct</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
                    <span>Préservation de l'ambiance traditionnelle</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
                    <span>Dosage précis et équitable</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
                    <span>Protection contre le vol</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/contact"
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
          >
            Demander une démonstration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Produits;
