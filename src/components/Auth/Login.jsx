import React, { useState } from 'react';
// Simuler l'import d'icônes
import { FaUser, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Login = ({ onLogin, onNavigateToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logique de connexion (à implémenter)
        alert(`Tentative de connexion pour ${username}`);
        onLogin(); // Redirige vers l'accueil
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Connexion</h2>
                <div className="input-group">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary">
                    <FaSignInAlt /> Se Connecter
                </button>
            </form>
            <button 
                onClick={onNavigateToRegister} 
                className="btn-secondary create-account-btn"
            >
                <FaUserPlus /> Créer un Compte
            </button>
        </div>
    );
};

export default Login;