import React, { useState } from 'react';

const EditPage = ({ page, onSave, onCancel }) => {
    const [content, setContent] = useState('');

    const handleSave = () => {
        console.log(`Saving content for page ${page.id}:`, content);
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
            <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-2xl">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Modifier la page : {page.label}</h2>
                <textarea 
                    className="w-full h-48 md:h-64 p-2 border rounded text-sm md:text-base"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="mt-4 md:mt-6 flex justify-end">
                    <button 
                        onClick={onCancel}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 text-sm md:text-base"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPage;