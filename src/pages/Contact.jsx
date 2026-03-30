import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { MapPin, Phone, Mail, Globe, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import RenderContent from '../components/RenderContent';
import WhatsAppIcon from '../components/WhatsAppIcon';

// Form ID chargé depuis la variable d'environnement (locale: .env.local, prod: Vercel dashboard)
const FORMSPREE_ID = process.env.REACT_APP_FORMSPREE_ID;

const Contact = ({ menuItems }) => {
  const contactPage = menuItems.find(item => item.id === 'contact');
  const [state, handleSubmit] = useForm(FORMSPREE_ID);
  const [domaine, setDomaine] = useState('');

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
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 mb-2" />
              <span>Région de la Kara, Togo</span>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 mb-2" />
              <a href="https://wa.me/22893892919" target="_blank" rel="noopener noreferrer" className="flex items-center">
                <WhatsAppIcon className="w-5 h-5 mr-1" />
                <span>+228 93 89 29 19</span>
              </a>
              <span>+228 90 09 26 72</span>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 mb-2" />
              <span>startuplmaaza228@gmail.com</span>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="w-8 h-8 mb-2" />
              <span>www.lmaaza.net</span>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Envoyez-nous un message</h3>

            {/* Message de succès */}
            {state.succeeded ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h4 className="text-xl font-bold text-gray-800">Message envoyé avec succès !</h4>
                <p className="text-gray-600 max-w-md">
                  Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Erreur globale Formspree */}
                {state.errors && state.errors.length > 0 && (
                  <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Une erreur s'est produite. Veuillez réessayer ou nous contacter directement par email.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nom" className="block text-gray-700 mb-2 font-semibold">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="nom"
                      type="text"
                      name="nom"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                      placeholder="Votre nom"
                    />
                    <ValidationError prefix="Nom" field="nom" errors={state.errors} className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2 font-semibold">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                      placeholder="votre@email.com"
                    />
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                <div>
                  <label htmlFor="sujet" className="block text-gray-700 mb-2 font-semibold">
                    Sujet <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="sujet"
                    type="text"
                    name="sujet"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                    placeholder="Objet de votre message"
                  />
                  <ValidationError prefix="Sujet" field="sujet" errors={state.errors} className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label htmlFor="domaine" className="block text-gray-700 mb-2 font-semibold">
                    Domaine d'intervention
                  </label>
                  <select
                    id="domaine"
                    name="domaine"
                    value={domaine}
                    onChange={e => setDomaine(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                  >
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
                  <label htmlFor="message" className="block text-gray-700 mb-2 font-semibold">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition resize-none"
                    placeholder="Votre message..."
                  />
                  <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-sm mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={state.submitting}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {state.submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <span>Envoyer le message</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* CTA bas de page */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Rejoignez la Révolution Technologique</h3>
            <p className="text-white opacity-90 mb-6 max-w-2xl mx-auto">
              Ensemble, construisons l'avenir technologique du Togo et de l'Afrique
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors">
                Demander un Devis
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors">
                Planifier une Rencontre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;