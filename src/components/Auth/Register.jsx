import React, { useState } from 'react';
// Simuler l'import d'icônes
import { FaUser, FaLock, FaEnvelope, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Register = ({ onRegister }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        // Simuler l'appel API pour créer l'utilisateur
        console.log({ username, email, password });
        
        // Simuler la réussite et rediriger vers la page de connexion
        alert(`Compte créé pour ${username} ! Veuillez vous connecter.`);
        onRegister(); 
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Création de Compte</h2>
                
                {error && <p className="error-message-auth">{error}</p>}
                
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
                    <FaEnvelope className="icon" />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                
                <div className="input-group">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        placeholder="Confirmer Mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                
                <button type="submit" className="btn-primary">
                    <FaUserPlus /> Créer le Compte
                </button>
            </form>
            <button 
                onClick={() => onRegister()} // onRegister renvoie vers /login dans App.js
                className="btn-secondary create-account-btn"
            >
                <FaSignInAlt /> Retour à la Connexion
            </button>
        </div>
    );
};

export default Register;