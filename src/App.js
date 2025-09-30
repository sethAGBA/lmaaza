import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Accueil from './pages/Accueil';
import APropos from './pages/APropos';
import Services from './pages/Services';
import Solutions from './pages/Solutions';
import Produits from './pages/Produits';
import Formations from './pages/Formations';
import Projets from './pages/Projets';
import Blog from './pages/Blog';
import Partenaires from './pages/Partenaires';
import Contact from './pages/Contact';
import Profil from './pages/Profil';
import Admin from './pages/Admin';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('user');

  const handleLogin = (selectedRole) => {
    setIsLoggedIn(true);
    setRole(selectedRole);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole('user');
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/accueil" element={<Accueil />} />
          <Route path="/apropos" element={<APropos />} />
          <Route path="/services" element={<Services />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/produits" element={<Produits />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/projets" element={<Projets />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/partenaires" element={<Partenaires />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profil" element={<Profil onLogin={handleLogin} onLogout={handleLogout} isLoggedIn={isLoggedIn} role={role} />} />
          <Route path="/admin" element={isLoggedIn && role === 'admin' ? <Admin /> : <Navigate to="/profil" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
