import React, { useEffect, useState } from 'react';
import { services as initialServices } from '../data';

const EditServicesFull = ({ page, onSave, onCancel, services, setServices }) => {
  // page.content may be string (intro) or object { title, intro }
  const initialPage = page && page.content ? (typeof page.content === 'object' ? page.content : { title: 'Nos Services', intro: page.content }) : { title: 'Nos Services', intro: '' };

  const [title, setTitle] = useState(initialPage.title || 'Nos Services');
  const [intro, setIntro] = useState(initialPage.intro || '');
  const [localServices, setLocalServices] = useState(() => (services && services.length ? JSON.parse(JSON.stringify(services)) : JSON.parse(JSON.stringify(initialServices))));

  useEffect(() => {
    const c = page && page.content ? page.content : '';
    setTitle(c && typeof c === 'object' ? c.title || 'Nos Services' : 'Nos Services');
    setIntro(c && typeof c === 'object' ? c.intro || '' : (typeof c === 'string' ? c : ''));
  setLocalServices((services && services.length) ? JSON.parse(JSON.stringify(services)) : JSON.parse(JSON.stringify(initialServices)));
  }, [page, services]);

  const updateCategory = (index, key, value) => setLocalServices(prev => prev.map((c, i) => i === index ? { ...c, [key]: value } : c));
  const updateItem = (catIndex, itemIndex, key, value) => setLocalServices(prev => prev.map((c, i) => i === catIndex ? { ...c, items: c.items.map((it, j) => j === itemIndex ? { ...it, [key]: value } : it) } : c));
  const addCategory = () => setLocalServices(prev => [...prev, { category: 'Nouvelle catégorie', items: [{ name: 'Nouveau service', desc: '' }] }]);
  const removeCategory = (index) => setLocalServices(prev => prev.filter((_, i) => i !== index));
  const addItem = (catIndex) => setLocalServices(prev => prev.map((c, i) => i === catIndex ? { ...c, items: [...c.items, { name: 'Nouveau service', desc: '' }] } : c));
  const removeItem = (catIndex, itemIndex) => setLocalServices(prev => prev.map((c, i) => i === catIndex ? { ...c, items: c.items.filter((_, j) => j !== itemIndex) } : c));

  const handleSave = () => {
    // update services list and the page content (title/intro)
    if (setServices) setServices(localServices);
    onSave(page.id, { title, intro });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-start justify-center p-4 pt-24 md:pt-28">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl w-full max-w-4xl mt-6 md:mt-0">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Modifier la page « Services »</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Introduction (HTML autorisé)</label>
            <textarea value={intro} onChange={(e) => setIntro(e.target.value)} className="mt-1 block w-full border rounded p-2 h-32" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Catégories & services</h3>
            {localServices && localServices.length > 0 ? (
              localServices.map((cat, ci) => (
                <div key={ci} className="p-3 border rounded mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <input value={cat.category} onChange={(e) => updateCategory(ci, 'category', e.target.value)} className="font-semibold text-lg w-1/2 border rounded p-1" />
                    <div>
                      <button onClick={() => addItem(ci)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">+ Service</button>
                      <button onClick={() => removeCategory(ci)} className="bg-red-500 text-white px-2 py-1 rounded">Suppr Cat.</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {cat.items.map((it, ii) => (
                      <div key={ii} className="p-2 border rounded">
                        <div className="flex gap-2 items-center">
                  <input value={it.name} onChange={(e) => updateItem(ci, ii, 'name', e.target.value)} className="flex-1 border rounded p-1" />
                  <input value={it.desc} onChange={(e) => updateItem(ci, ii, 'desc', e.target.value)} className="flex-2 border rounded p-1" />
                  <input value={it.icon || ''} onChange={(e) => updateItem(ci, ii, 'icon', e.target.value)} placeholder="Icon name (ex: Cpu)" className="w-28 border rounded p-1" />
                  <button onClick={() => removeItem(ci, ii)} className="bg-red-500 text-white px-2 py-1 rounded">Suppr</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 mb-2">Aucune catégorie définie.</div>
            )}
            <div>
              <button onClick={addCategory} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">+ Ajouter une catégorie</button>
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

export default EditServicesFull;
