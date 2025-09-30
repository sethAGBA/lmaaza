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
import { menuItems as initialMenuItems, services as initialServices } from './data';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('user');
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [services, setServices] = useState(initialServices);

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
      <Layout menuItems={menuItems}>
        <Routes>
          <Route path="/" element={<Accueil menuItems={menuItems} />} />
          <Route path="/accueil" element={<Accueil menuItems={menuItems} />} />
          <Route path="/apropos" element={<APropos menuItems={menuItems} />} />
          <Route path="/services" element={<Services menuItems={menuItems} services={services} />} />
          <Route path="/solutions" element={<Solutions menuItems={menuItems} />} />
          <Route path="/produits" element={<Produits menuItems={menuItems} />} />
          <Route path="/formations" element={<Formations menuItems={menuItems} />} />
          <Route path="/projets" element={<Projets menuItems={menuItems} />} />
          <Route path="/blog" element={<Blog menuItems={menuItems} />} />
          <Route path="/partenaires" element={<Partenaires menuItems={menuItems} />} />
          <Route path="/contact" element={<Contact menuItems={menuItems} />} />
          <Route path="/profil" element={<Profil onLogin={handleLogin} onLogout={handleLogout} isLoggedIn={isLoggedIn} role={role} menuItems={menuItems} setMenuItems={setMenuItems} services={services} setServices={setServices} />} />
          <Route path="/admin" element={isLoggedIn && role === 'admin' ? <Admin menuItems={menuItems} setMenuItems={setMenuItems} services={services} setServices={setServices} /> : <Navigate to="/profil" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
