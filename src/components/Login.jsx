import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [role, setRole] = useState('user');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(role);
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
                        id="email"
                        type="email" 
                        placeholder="Email"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Mot de passe
                    </label>
                    <input 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
                        id="password"
                        type="password" 
                        placeholder="******************"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                        Rôle
                    </label>
                    <select 
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
                    >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                    </select>
                </div>
                <div className="flex items-center justify-center md:justify-between">
                    <button 
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm md:text-base"
                        type="submit"
                    >
                        Se connecter
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;