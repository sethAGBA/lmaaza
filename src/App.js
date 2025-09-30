import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
