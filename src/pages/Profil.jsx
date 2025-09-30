import React from 'react';
import Login from '../components/Login';
import Logout from '../components/Logout';
import UserDashboard from '../components/UserDashboard';
import Admin from './Admin';

const Profil = ({ onLogin, onLogout, isLoggedIn, role }) => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Profil</h1>
            {isLoggedIn ? (
                <div>
                    <Logout onLogout={onLogout} />
                    {role === 'user' ? <UserDashboard /> : <Admin />}
                </div>
            ) : (
                <Login onLogin={onLogin} />
            )}
        </div>
    );
};

export default Profil;