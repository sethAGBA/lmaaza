import React from 'react';
import { Link } from 'react-router-dom';
import Login from '../components/Login';
import Logout from '../components/Logout';
import UserDashboard from '../components/UserDashboard';
import Admin from './Admin';
import { useAuth } from '../contexts/AuthContext';

const Profil = ({ menuItems, setMenuItems, services, setServices }) => {
  const { isLoggedIn, isAdmin, login, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Profil</h1>
      {isLoggedIn ? (
        <div>
          <Logout onLogout={logout} />
          {isAdmin ? (
            <div className="mt-6 space-y-4">
              <Admin
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                services={services}
                setServices={setServices}
              />
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-purple-800 mb-2">
                  Administration du blog
                </h2>
                <p className="text-gray-600 mb-3">
                  Gérez les articles, brouillons et publications du blog.
                </p>
                <Link
                  to="/admin/blog"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Ouvrir le tableau de bord blog
                </Link>
              </div>
            </div>
          ) : (
            <UserDashboard />
          )}
        </div>
      ) : (
        <Login onLogin={login} />
      )}
    </div>
  );
};

export default Profil;
