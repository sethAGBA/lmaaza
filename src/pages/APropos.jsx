import React from 'react';
import { Target, Zap, Award, Users } from 'lucide-react';
import { teamMembers } from '../data';

const APropos = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">À Propos de L'Maaza</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une startup technologique innovante au cœur de la transformation digitale togolaise
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Target className="w-6 h-6 mr-3 text-purple-600" />
              Notre Raison d'Être
            </h3>
            <div className="space-y-4 text-gray-600">
              <p>Dans la région de la Kara, nous avons identifié un manque crucial de structures proposant des solutions technologiques innovantes. L'Maaza se positionne comme une entreprise technologique locale pour combler ce vide.</p>
              <p>Nous répondons à trois défis majeurs :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>L'insuffisance de compétences technologiques locales</li>
                <li>Le manque de solutions technologiques adaptées</li>
                <li>La faible orientation des jeunes, surtout les filles, vers les filières technologiques</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-purple-600" />
              Notre Vision & Mission
            </h3>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h4 className="font-semibold text-purple-600 mb-2">Vision</h4>
              <p className="text-gray-600">Développer des solutions technologiques innovantes dans l'Agriculture, la Santé, l'Éducation et la Protection de l'environnement.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-purple-600 mb-2">Mission</h4>
              <p className="text-gray-600">Contribuer au développement de solutions technologiques de qualité et accompagner les structures éducatives par des formations adaptées à l'employabilité des jeunes.</p>
            </div>
          </div>
        </div>

        {/* Valeurs */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Nos Valeurs</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {['Accessibilité', 'Professionnalisme', 'Innovation', 'Acquisition continue du savoir', 'Respect'].map((valeur, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-800 text-center">{valeur}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Équipe */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Notre Équipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 text-center mb-2">{member.name}</h4>
                <p className="text-purple-600 text-sm text-center mb-3">{member.role}</p>
                {member.experience && (
                  <p className="text-gray-600 text-sm text-center mb-3">{member.experience}</p>
                )}
                <div className="space-y-1">
                  {member.specialties.map((specialty, idx) => (
                    <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded text-center">
                      {specialty}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APropos;
