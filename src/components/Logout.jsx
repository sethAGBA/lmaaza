import React from 'react';

const Logout = ({ onLogout }) => {
    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-4 md:p-8 text-center">
            <h2 className="text-2xl font-bold mb-6">Bienvenue !</h2>
            <p className="text-gray-700 mb-6 text-sm md:text-base">Vous êtes connecté.</p>
            <button 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm md:text-base"
                onClick={onLogout}
            >
                Se déconnecter
            </button>
        </div>
    );
};

export default Logout;