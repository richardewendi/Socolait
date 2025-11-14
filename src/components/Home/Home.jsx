import React from 'react';
import CardButton from './CardButton';
// Simuler l'import d'icônes
import { FaPlus, FaCamera, FaHistory, FaSignOutAlt } from 'react-icons/fa';

const Home = ({ onLogout, onNavigate }) => {
    return (
        <div className="home-container">
            <header className="header">
                <h1>Tableau de Bord des Relevés</h1>
                <button onClick={onLogout} className="btn-logout">
                    <FaSignOutAlt /> Déconnexion
                </button>
            </header>
            
            <div className="card-grid">
                <CardButton
                    icon={FaPlus}
                    title="Enregistrer un Compteur"
                    description="Ajouter un nouvel identifiant de compteur dans le système."
                    onClick={() => onNavigate('/nouveau-compteur')}
                />
                
                <CardButton
                    icon={FaCamera}
                    title="Relever les Compteurs"
                    description="Scanner le code-barres ou saisir l'index manuellement."
                    onClick={() => onNavigate('/releve')}
                />
                
                <CardButton
                    icon={FaHistory}
                    title="Historique des Documents"
                    description="Consulter la consommation, les index et les dates des relevés passés."
                    onClick={() => onNavigate('/historique')}
                />
            </div>
        </div>
    );
};

export default Home;