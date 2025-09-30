import React, { useState, useEffect } from 'react';

const EditAccueil = ({ page, onSave, onCancel }) => {
  // page.content is expected to be an object { title, lead, subtext, stats }
  const defaultStats = [
    { value: '20+', label: "Années d'expérience" },
    { value: '5', label: "Domaines d'expertise" },
    { value: '25+', label: 'Jeunes formées (P.A.M.F)' },
    { value: '3', label: 'Axes stratégiques' }
  ];

  const initial = page && page.content ? page.content : { title: '', lead: '', subtext: '', stats: defaultStats, heroBg: '', ctaPrimary: { text: '', link: '' }, ctaSecondary: { text: '', link: '' } };
  const [title, setTitle] = useState(initial.title || '');
  const [lead, setLead] = useState(initial.lead || '');
  const [subtext, setSubtext] = useState(initial.subtext || '');
  const [stats, setStats] = useState(initial.stats || []);
  const [heroBg, setHeroBg] = useState(initial.heroBg || '');
  const [ctaPrimary, setCtaPrimary] = useState(initial.ctaPrimary || { text: '', link: '' });
  const [ctaSecondary, setCtaSecondary] = useState(initial.ctaSecondary || { text: '', link: '' });

  useEffect(() => {
  const c = page && page.content ? page.content : { title: '', lead: '', subtext: '', stats: defaultStats, heroBg: '', ctaPrimary: { text: '', link: '' }, ctaSecondary: { text: '', link: '' } };
  setTitle(c.title || '');
  setLead(c.lead || '');
  setSubtext(c.subtext || '');
  setStats((c.stats && c.stats.length > 0) ? c.stats : defaultStats);
  setHeroBg(c.heroBg || '');
  setCtaPrimary(c.ctaPrimary || { text: '', link: '' });
  setCtaSecondary(c.ctaSecondary || { text: '', link: '' });
  }, [page]);

  const handleStatChange = (index, key, value) => {
    setStats(prev => prev.map((s, i) => i === index ? { ...s, [key]: value } : s));
  };

  const handleAddStat = () => setStats(prev => [...prev, { value: '', label: '' }]);
  const handleRemoveStat = (index) => setStats(prev => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const newContent = { title, lead, subtext, stats, heroBg, ctaPrimary, ctaSecondary };
    onSave(page.id, newContent);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-start justify-center p-4 pt-24 md:pt-28">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-2xl mt-6 md:mt-0">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Modifier la page d'accueil</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lead</label>
            <textarea value={lead} onChange={(e) => setLead(e.target.value)} className="mt-1 block w-full border rounded p-2 h-24" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sous-texte</label>
            <textarea value={subtext} onChange={(e) => setSubtext(e.target.value)} className="mt-1 block w-full border rounded p-2 h-20" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Classe hero (heroBg)</label>
            <input value={heroBg} onChange={(e) => setHeroBg(e.target.value)} placeholder="ex: bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700" className="mt-1 block w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CTA principal</label>
            <div className="flex gap-2 mt-2">
              <input value={ctaPrimary.text} onChange={(e) => setCtaPrimary(prev => ({ ...prev, text: e.target.value }))} placeholder="Texte bouton" className="flex-1 border rounded p-2" />
              <input value={ctaPrimary.link} onChange={(e) => setCtaPrimary(prev => ({ ...prev, link: e.target.value }))} placeholder="Lien (ex: /services)" className="flex-1 border rounded p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CTA secondaire</label>
            <div className="flex gap-2 mt-2">
              <input value={ctaSecondary.text} onChange={(e) => setCtaSecondary(prev => ({ ...prev, text: e.target.value }))} placeholder="Texte bouton" className="flex-1 border rounded p-2" />
              <input value={ctaSecondary.link} onChange={(e) => setCtaSecondary(prev => ({ ...prev, link: e.target.value }))} placeholder="Lien (ex: /contact)" className="flex-1 border rounded p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statistiques</label>
            <div className="space-y-2 mt-2">
              {stats.map((s, idx) => (
                <div key={idx} className="flex gap-2">
                  <input value={s.value} onChange={(e) => handleStatChange(idx, 'value', e.target.value)} placeholder="Valeur" className="flex-1 border rounded p-2" />
                  <input value={s.label} onChange={(e) => handleStatChange(idx, 'label', e.target.value)} placeholder="Label" className="flex-2 border rounded p-2" />
                  <button onClick={() => handleRemoveStat(idx)} className="bg-red-500 text-white px-2 rounded">Suppr</button>
                </div>
              ))}
              <div>
                <button onClick={handleAddStat} className="bg-green-500 text-white px-3 py-1 rounded">Ajouter statistique</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">Annuler</button>
          <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default EditAccueil;
