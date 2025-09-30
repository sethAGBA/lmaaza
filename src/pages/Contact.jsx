import React from 'react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import RenderContent from '../components/RenderContent';

const Contact = ({ menuItems }) => {
  const contactPage = menuItems.find(item => item.id === 'contact');

  return (
    <div className="py-16 bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Contactez-Nous</h2>
            <div className="text-xl text-white opacity-90">
              {contactPage ? <RenderContent content={contactPage.content} /> : "Chargement du contenu..."}
            </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Informations de contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-white text-center">
            <div className="flex flex-col items-center"><MapPin className="w-8 h-8 mb-2" /><span>Région de la Kara, Togo</span></div>
            <div className="flex flex-col items-center"><Phone className="w-8 h-8 mb-2" /><span>+228 93 89 29 19 / 90 09 26 72</span></div>
            <div className="flex flex-col items-center"><Mail className="w-8 h-8 mb-2" /><span>contact@lmaaza.tg</span></div>
            <div className="flex flex-col items-center"><Globe className="w-8 h-8 mb-2" /><span>www.lmaaza.tg</span></div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Envoyez-nous un message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Nom complet</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="votre@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Sujet</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="Objet de votre message" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Domaine d'intervention</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                  <option value="">Sélectionnez un domaine</option>
                  <option value="education">Éducation</option>
                  <option value="agriculture">Agriculture/Élevage</option>
                  <option value="sante">Santé</option>
                  <option value="environnement">Environnement</option>
                  <option value="technologie">Technologie</option>
                  <option value="formation">Formation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Message</label>
                <textarea rows="5" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="Votre message..."></textarea>
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Envoyer le message
              </button>
            </form>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Rejoignez la Révolution Technologique</h3>
            <p className="text-white opacity-90 mb-6 max-w-2xl mx-auto">Ensemble, construisons l'avenir technologique du Togo et de l'Afrique</p>
            <div className="flex justify-center space-x-4">
              <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors">Demander un Devis</button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors">Planifier une Rencontre</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Contact;