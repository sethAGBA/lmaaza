import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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
import Article from './pages/Article';
import Partenaires from './pages/Partenaires';
import Contact from './pages/Contact';
import Profil from './pages/Profil';
import Admin from './pages/Admin';
import LoginPage from './pages/Login';
import Maintenance from './pages/Maintenance';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { BlogProvider, useBlog } from './contexts/BlogContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import BlogAdminDashboard from './components/admin/AdminDashboard';
import ArticleEditorPage from './pages/admin/ArticleEditor';
import { menuItems as initialMenuItems, services as initialServices } from './data';

const MAINTENANCE_MODE = process.env.REACT_APP_MAINTENANCE_MODE === 'true';

function BlogAdminRoutes() {
  const { articleService, mediaService } = useBlog();

  return (
    <Routes>
      <Route
        index
        element={<BlogAdminDashboard articleService={articleService} />}
      />
      <Route
        path="new"
        element={
          <ArticleEditorPage
            articleService={articleService}
            mediaService={mediaService}
          />
        }
      />
      <Route
        path="edit/:id"
        element={
          <ArticleEditorPage
            articleService={articleService}
            mediaService={mediaService}
          />
        }
      />
    </Routes>
  );
}

function AppRoutes() {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [services, setServices] = useState(initialServices);

  return (
    <Router>
      <Layout menuItems={menuItems}>
        <Routes>
          <Route path="/" element={<Accueil menuItems={menuItems} />} />
          <Route path="/accueil" element={<Accueil menuItems={menuItems} />} />
          <Route path="/apropos" element={<APropos menuItems={menuItems} />} />
          <Route
            path="/services"
            element={<Services menuItems={menuItems} services={services} />}
          />
          <Route path="/solutions" element={<Solutions menuItems={menuItems} />} />
          <Route path="/produits" element={<Produits menuItems={menuItems} />} />
          <Route path="/formations" element={<Formations menuItems={menuItems} />} />
          <Route path="/projets" element={<Projets menuItems={menuItems} />} />
          <Route path="/blog" element={<Blog menuItems={menuItems} />} />
          <Route path="/blog/:id" element={<Article />} />
          <Route path="/partenaires" element={<Partenaires menuItems={menuItems} />} />
          <Route path="/contact" element={<Contact menuItems={menuItems} />} />
          <Route
            path="/profil"
            element={
              <Profil
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                services={services}
                setServices={setServices}
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin
                  menuItems={menuItems}
                  setMenuItems={setMenuItems}
                  services={services}
                  setServices={setServices}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blog/*"
            element={
              <ProtectedRoute>
                <ErrorBoundary title="Erreur dans l'administration du blog">
                  <BlogAdminRoutes />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  if (MAINTENANCE_MODE) {
    return (
      <HelmetProvider>
        <Maintenance />
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <AuthProvider>
        <BlogProvider>
          <AppRoutes />
        </BlogProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
