import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Import des Composants (Assurez-vous qu'ils utilisent tous l'extension .jsx !)
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import Home from './components/Home/Home.jsx';
import NouveauCompteur from './components/Home/NouveauCompteur.jsx';
import ReleveCompteur from './components/Releve/ReleveCompteur.jsx';
import Historique from './components/Historique/Historique.jsx';
import ListeCompteurs from './components/ListeCompteurs/ListeCompteurs.jsx';
import ModifierCompteur from './components/Home/ModifierCompteur.jsx';

// Import des Styles
import './styles/base.css'; 
import './styles/auth.css';
import './styles/home.css';
import './styles/releve.css';
import './styles/historique.css';

const AppContent = () => {
    // Initialiser à false, ou vérifier le stockage local si l'utilisateur doit rester connecté
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const navigate = useNavigate();

    // 🛑 AJUSTEMENT : Rediriger vers la page de connexion au premier chargement si non authentifié
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        } else {
            // Optionnel: rediriger vers la home si déjà connecté mais sur une route invalide
            // navigate('/home', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Simule la connexion
    const handleLogin = () => {
        setIsAuthenticated(true);
        // La redirection vers '/home' est gérée par la route ci-dessous si l'authentification réussit
        // Si vous utilisez useEffect, vous pouvez le laisser vide ici.
    };

    // Simule la déconnexion
    const handleLogout = () => {
        setIsAuthenticated(false);
        // La redirection vers '/login' est gérée par useEffect
    };

    // Redirection après enregistrement
    const handleRegister = () => {
        navigate('/login');
    };

    // --- Routes Publiques (si non authentifié) ---
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} onNavigateToRegister={() => navigate('/register')} />} />
                <Route path="/register" element={<Register onRegister={handleRegister} />} />
                
                {/* 🛑 CORRECTION: Redirige tous les autres chemins vers /login */}
                <Route path="*" element={<Login onLogin={handleLogin} onNavigateToRegister={() => navigate('/register')} />} />
            </Routes>
        );
    }

    // --- Routes Protégées (si authentifié) ---
    return (
        <Routes>
            <Route path="/home" element={<Home onLogout={handleLogout} onNavigate={navigate} />} />
            
            {/* 🛑 CORRECTION CRITIQUE : Passer les props de navigation */}
            <Route 
                path="/nouveau-compteur" 
                element={<NouveauCompteur 
                    onCompteurAdded={() => navigate('/home')} // Après ajout réussi
                    onCancel={() => navigate('/home')}         // Bouton Annuler/Retour
                />} 
            />
            
            <Route path="/releve" element={<ReleveCompteur />} />
            <Route path="/historique" element={<Historique />} />
            <Route path="/liste-compteurs" element={<ListeCompteurs />} />
            <Route path="/modifier-compteur/:id" element={<ModifierCompteur />} />

            {/* Redirection par défaut vers Home si la route n'est pas trouvée (et que l'utilisateur est connecté) */}
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