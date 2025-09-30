import React, { useState, useEffect } from 'react';
import RenderContent from './RenderContent';
import { teamMembers as defaultTeam } from '../data';

// Structured shape we're aiming for:
// content: {
//   title, subtitle, heroBg, heroImage, sections: [{ heading, body }], stats: [{ value, label }]
// }

const defaultStructured = (raw) => ({
  title: "À Propos de L'Maaza",
  subtitle: 'Découvrez notre histoire, notre mission et notre équipe.',
  heroBg: 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700',
  heroImage: '',
  sections: [
    { heading: '', body: raw && typeof raw === 'string' ? raw : '<p>Racontez votre histoire ici.</p>' }
  ],
  vision: 'Développer des solutions technologiques innovantes dans l\'Agriculture, la Santé, l\'Éducation et la Protection de l\'environnement.',
  mission: 'Contribuer au développement de solutions technologiques de qualité et accompagner les structures éducatives par des formations adaptées.',
  values: ['Accessibilité', 'Professionnalisme', 'Innovation', "Acquisition continue du savoir", 'Respect'],
  stats: [
    { value: '20+', label: "Années d'expérience" },
    { value: '5', label: 'Domaines d\'expertise' }
  ],
  teamMembers: defaultTeam
});

const EditAPropos = ({ page, onSave, onCancel }) => {
  const raw = page && page.content ? page.content : '';

  const [structured, setStructured] = useState(() =>
    raw && typeof raw === 'object' ? raw : defaultStructured(raw)
  );

  useEffect(() => {
    const r = page && page.content ? page.content : '';
    setStructured(r && typeof r === 'object' ? r : defaultStructured(r));
  }, [page]);

  const updateField = (key, value) => setStructured(prev => ({ ...prev, [key]: value }));

  const updateSection = (index, key, value) => {
    setStructured(prev => {
      const sections = [...(prev.sections || [])];
      sections[index] = { ...sections[index], [key]: value };
      return { ...prev, sections };
    });
  };

  const addSection = () => setStructured(prev => ({ ...prev, sections: [...(prev.sections || []), { heading: '', body: '' }] }));
  const removeSection = (index) => setStructured(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));

  const updateStat = (index, key, value) => {
    setStructured(prev => {
      const stats = [...(prev.stats || [])];
      stats[index] = { ...stats[index], [key]: value };
      return { ...prev, stats };
    });
  };

  const addStat = () => setStructured(prev => ({ ...prev, stats: [...(prev.stats || []), { value: '', label: '' }] }));
  const removeStat = (index) => setStructured(prev => ({ ...prev, stats: prev.stats.filter((_, i) => i !== index) }));

  // Values (list of strings)
  const updateValue = (index, value) => {
    setStructured(prev => {
      const values = [...(prev.values || [])];
      values[index] = value;
      return { ...prev, values };
    });
  };
  const addValue = () => setStructured(prev => ({ ...prev, values: [...(prev.values || []), ''] }));
  const removeValue = (index) => setStructured(prev => ({ ...prev, values: prev.values.filter((_, i) => i !== index) }));

  // Team members
  const updateMember = (index, key, value) => {
    setStructured(prev => {
      const team = [...(prev.teamMembers || [])];
      team[index] = { ...team[index], [key]: value };
      return { ...prev, teamMembers: team };
    });
  };
  const addMember = () => setStructured(prev => ({ ...prev, teamMembers: [...(prev.teamMembers || []), { name: '', role: '', experience: '', specialties: [] }] }));
  const removeMember = (index) => setStructured(prev => ({ ...prev, teamMembers: prev.teamMembers.filter((_, i) => i !== index) }));

  const updateMemberSpecialties = (index, value) => {
    // comma-separated input -> array
    const arr = value.split(',').map(s => s.trim()).filter(Boolean);
    updateMember(index, 'specialties', arr);
  };

  const handleSave = () => {
    // Save structured object as the page content
    onSave(page.id, structured);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-start justify-center p-4 pt-24 md:pt-28">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-4xl mt-6 md:mt-0">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Modifier la page « À Propos »</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input value={structured.title} onChange={(e) => updateField('title', e.target.value)} className="w-full border rounded p-2 mt-1 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sous-titre</label>
            <input value={structured.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} className="w-full border rounded p-2 mt-1 text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero background (tailwind classes)</label>
              <input value={structured.heroBg} onChange={(e) => updateField('heroBg', e.target.value)} className="w-full border rounded p-2 mt-1 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero image URL</label>
              <input value={structured.heroImage} onChange={(e) => updateField('heroImage', e.target.value)} className="w-full border rounded p-2 mt-1 text-sm" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Sections</h3>
            {structured.sections && structured.sections.length > 0 ? (
              structured.sections.map((sec, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Section {idx + 1}</label>
                    <button onClick={() => removeSection(idx)} className="text-red-500 text-sm">Supprimer</button>
                  </div>
                  <input placeholder="Titre de section" value={sec.heading || ''} onChange={(e) => updateSection(idx, 'heading', e.target.value)} className="w-full border rounded p-2 mb-2 text-sm" />
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenu (HTML autorisé)</label>
                  <textarea value={sec.body || ''} onChange={(e) => updateSection(idx, 'body', e.target.value)} className="w-full border rounded p-2 text-sm h-28" />
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Aucune section définie.</div>
            )}
            <div className="mt-2">
              <button onClick={addSection} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">+ Ajouter une section</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Vision & Mission</h3>
            <label className="block text-sm font-medium text-gray-700">Vision</label>
            <textarea value={structured.vision || ''} onChange={(e) => updateField('vision', e.target.value)} className="w-full border rounded p-2 mt-1 text-sm h-20 mb-2" />
            <label className="block text-sm font-medium text-gray-700">Mission</label>
            <textarea value={structured.mission || ''} onChange={(e) => updateField('mission', e.target.value)} className="w-full border rounded p-2 mt-1 text-sm h-20" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Valeurs</h3>
            {structured.values && structured.values.length > 0 ? (
              structured.values.map((v, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <input value={v} onChange={(e) => updateValue(idx, e.target.value)} className="flex-1 border rounded p-2 text-sm" />
                  <button onClick={() => removeValue(idx)} className="text-red-500 text-sm">Suppr</button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Aucune valeur définie.</div>
            )}
            <div className="mt-2">
              <button onClick={addValue} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">+ Ajouter une valeur</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Équipe</h3>
            {structured.teamMembers && structured.teamMembers.length > 0 ? (
              structured.teamMembers.map((m, idx) => (
                <div key={idx} className="p-3 border rounded mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Membre {idx + 1}</label>
                    <button onClick={() => removeMember(idx)} className="text-red-500 text-sm">Supprimer</button>
                  </div>
                  <input placeholder="Nom" value={m.name || ''} onChange={(e) => updateMember(idx, 'name', e.target.value)} className="w-full border rounded p-2 mb-2 text-sm" />
                  <input placeholder="Rôle" value={m.role || ''} onChange={(e) => updateMember(idx, 'role', e.target.value)} className="w-full border rounded p-2 mb-2 text-sm" />
                  <input placeholder="Expérience" value={m.experience || ''} onChange={(e) => updateMember(idx, 'experience', e.target.value)} className="w-full border rounded p-2 mb-2 text-sm" />
                  <input placeholder="Spécialités (séparées par des virgules)" value={(m.specialties || []).join(', ')} onChange={(e) => updateMemberSpecialties(idx, e.target.value)} className="w-full border rounded p-2 text-sm" />
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Aucun membre d'équipe défini.</div>
            )}
            <div className="mt-2">
              <button onClick={addMember} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">+ Ajouter un membre</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Statistiques (optionnel)</h3>
            {structured.stats && structured.stats.length > 0 ? (
              structured.stats.map((s, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <input placeholder="Valeur" value={s.value || ''} onChange={(e) => updateStat(idx, 'value', e.target.value)} className="w-24 border rounded p-2 text-sm" />
                  <input placeholder="Label" value={s.label || ''} onChange={(e) => updateStat(idx, 'label', e.target.value)} className="flex-1 border rounded p-2 text-sm" />
                  <button onClick={() => removeStat(idx)} className="text-red-500 text-sm">Suppr</button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Aucune statistique définie.</div>
            )}
            <div className="mt-2">
              <button onClick={addStat} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">+ Ajouter une statistique</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Aperçu du contenu principal</h3>
            <div className="border rounded p-3 bg-gray-50">
              <h4 className="font-bold text-lg">{structured.title}</h4>
              <p className="text-sm text-gray-600">{structured.subtitle}</p>
              {structured.sections && structured.sections.length > 0 && (
                <div className="mt-3 space-y-3">
                  {structured.sections.map((s, i) => (
                    <div key={i}>
                      {s.heading && <h5 className="font-semibold">{s.heading}</h5>}
                      <div className="text-sm text-gray-700"><RenderContent content={s.body} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2">Annuler</button>
          <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default EditAPropos;
