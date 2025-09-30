import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Section L'Maaza */}
          <div>
            <h3 className="text-2xl font-bold mb-4">L'Maaza</h3>
            <p className="text-gray-400">Première plateforme technologique innovante de la région de la Kara, au service de la transformation digitale togolaise.</p>
            <div className="flex space-x-2 mt-3">
              <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer"><Facebook className="w-5 h-5" /></button>
              <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer"><Instagram className="w-5 h-5" /></button>
              <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer"><Linkedin className="w-5 h-5" /></button>
              <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer"><Twitter className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Section Services */}
          <div>
            <h4 className="font-semibold mb-4">Nos Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/solutions" className="hover:text-white transition-colors">Solutions Technologiques</Link></li>
              <li><Link to="/formations" className="hover:text-white transition-colors">Formations</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Impression 3D</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Développement</Link></li>
            </ul>
          </div>

          {/* Section Domaines */}
          <div>
            <h4 className="font-semibold mb-4">Domaines</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/solutions" className="hover:text-white transition-colors">Éducation</Link></li>
              <li><Link to="/solutions" className="hover:text-white transition-colors">Agriculture</Link></li>
              <li><Link to="/solutions" className="hover:text-white transition-colors">Santé</Link></li>
              <li><Link to="/solutions" className="hover:text-white transition-colors">Environnement</Link></li>
            </ul>
          </div>

          {/* Section Contact Rapide */}
          <div>
            <h4 className="font-semibold mb-4">Contact Rapide</h4>
            <div className="text-gray-400 space-y-2">
              <p>Région de la Kara, Togo</p>
              <p>contact@lmaaza.tg</p>
              <p>+228 93 8929 19 / 90 09 26 72</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} L'Maaza - Startup Technologique. Tous droits réservés.</p>
          <p className="mt-2 text-sm">Développé avec passion pour l'innovation technologique africaine</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;