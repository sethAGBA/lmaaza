import React, { useState, useEffect } from 'react';
import RenderContent from './RenderContent';

const EditServices = ({ page, onSave, onCancel }) => {
  const initial = page && page.content ? page.content : '';
  const [structured, setStructured] = useState(() => (initial && typeof initial === 'object') ? initial : { title: 'Nos Services', intro: (typeof initial === 'string' ? initial : '') });

  useEffect(() => {
    const c = page && page.content ? page.content : '';
    setStructured((c && typeof c === 'object') ? c : { title: 'Nos Services', intro: (typeof c === 'string' ? c : '') });
  }, [page]);

  const handleSave = () => {
    onSave(page.id, structured);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-start justify-center p-4 pt-24 md:pt-28">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-2xl mt-6 md:mt-0">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Modifier la page « Services »</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input value={structured.title} onChange={(e) => setStructured(prev => ({ ...prev, title: e.target.value }))} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Introduction (HTML autorisé)</label>
            <textarea value={structured.intro} onChange={(e) => setStructured(prev => ({ ...prev, intro: e.target.value }))} className="mt-1 block w-full border rounded p-2 h-40" />
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

export default EditServices;
