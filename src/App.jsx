import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';


// Components
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProfilePage from './pages/ProfilePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import LoginPage from './pages/LogInPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import CollectionsPage from './pages/CollectionsPage';

const App = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // Render a more comprehensive loading state that takes up the full viewport
  if (isLoading) {
    return (
      <div className="app loading-state" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#121212',
        color: 'white'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/" element={<CatalogPage />} />
        <Route path="/" element={<CollectionsPage />} />
        <Route path="/" element={<AnimeDetailPage />} />
        
        {/* Auth Routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/profile" replace /> : <LoginPage />
        } />
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/profile" replace /> : <RegisterPage />
        } />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={
            <div className="not-found-container">
            <div className="not-found-content">
              <h1 className="not-found-title">404 - Page Not Found</h1>
              <p className="not-found-text">Looks like you've ventured into unknown territory. The page you're looking for doesn't exist or has been moved.</p>
              <Link to="/" className="back-home-button">
                Back to Home
              </Link>
            </div>
          </div>
          } 
        />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;