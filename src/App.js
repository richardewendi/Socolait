import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Import des Composants
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';
import ReleveCompteur from './components/Releve/ReleveCompteur';
import Historique from './components/Historique/Historique';

// Import des Styles
import './styles/base.css'; 
import './styles/auth.css';
import './styles/home.css';
import './styles/releve.css';
import './styles/historique.css';

const AppContent = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Simule la connexion
    const handleLogin = () => {
        setIsAuthenticated(true);
        navigate('/home');
    };

    // Simule la déconnexion
    const handleLogout = () => {
        setIsAuthenticated(false);
        navigate('/login');
    };

    // Redirection après enregistrement
    const handleRegister = () => {
        navigate('/login');
    };

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} onNavigateToRegister={() => navigate('/register')} />} />
                <Route path="/register" element={<Register onRegister={handleRegister} />} />
                {/* Redirection par défaut vers Login si non connecté */}
                <Route path="*" element={<Login onLogin={handleLogin} onNavigateToRegister={() => navigate('/register')} />} />
            </Routes>
        );
    }

    // Routes protégées (accessibles seulement si isAuthenticated = true)
    return (
        <Routes>
            <Route path="/home" element={<Home onLogout={handleLogout} onNavigate={navigate} />} />
            <Route path="/releve" element={<ReleveCompteur />} />
            <Route path="/historique" element={<Historique />} />
            {/* Ajoutez ici la route pour l'enregistrement d'un nouveau compteur */}
            <Route path="*" element={<Home onLogout={handleLogout} onNavigate={navigate} />} />
        </Routes>
    );
};

const App = () => (
    <Router>
        <AppContent />
    </Router>
);

export default App;