import React, { useState, useEffect } from 'react';

import { services as initialServices } from '../data';

const EditServicesItems = ({ services, setServices, onCancel }) => {
  const [local, setLocal] = useState(() => (services && services.length) ? services : initialServices);

  useEffect(() => setLocal((services && services.length) ? services : initialServices), [services]);

  const updateCategory = (index, key, value) => {
    setLocal(prev => prev.map((c, i) => i === index ? { ...c, [key]: value } : c));
  };

  const updateItem = (catIndex, itemIndex, key, value) => {
    setLocal(prev => prev.map((c, i) => i === catIndex ? { ...c, items: c.items.map((it, j) => j === itemIndex ? { ...it, [key]: value } : it) } : c));
  };

  const addCategory = () => setLocal(prev => [...prev, { category: 'Nouvelle catégorie', items: [{ name: 'Nouveau service', desc: '' }] }]);
  const removeCategory = (index) => setLocal(prev => prev.filter((_, i) => i !== index));

  const addItem = (catIndex) => setLocal(prev => prev.map((c, i) => i === catIndex ? { ...c, items: [...c.items, { name: 'Nouveau service', desc: '' }] } : c));
  const removeItem = (catIndex, itemIndex) => setLocal(prev => prev.map((c, i) => i === catIndex ? { ...c, items: c.items.filter((_, j) => j !== itemIndex) } : c));

  const handleSave = () => {
    setServices(local);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-start justify-center p-4 pt-24 md:pt-28">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl w-full max-w-4xl mt-6 md:mt-0">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Modifier les services</h2>

        <div className="space-y-4">
          {local.map((cat, ci) => (
            <div key={ci} className="p-3 border rounded">
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
                    <div className="flex gap-2">
                      <input value={it.name} onChange={(e) => updateItem(ci, ii, 'name', e.target.value)} className="flex-1 border rounded p-1" />
                      <input value={it.desc} onChange={(e) => updateItem(ci, ii, 'desc', e.target.value)} className="flex-2 border rounded p-1" />
                      <input value={it.icon || ''} onChange={(e) => updateItem(ci, ii, 'icon', e.target.value)} placeholder="Icon name (ex: Cpu)" className="w-28 border rounded p-1" />
                      <button onClick={() => removeItem(ci, ii)} className="bg-red-500 text-white px-2 py-1 rounded">Suppr</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <button onClick={addCategory} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">+ Ajouter une catégorie</button>
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

export default EditServicesItems;
