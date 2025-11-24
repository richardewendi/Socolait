
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaHome } from 'react-icons/fa';
import Modal from '../UI/Modal'; // Import Modal
import './ListeCompteurs.css';

const ListeCompteurs = () => {
    const [compteurs, setCompteurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [counterToDelete, setCounterToDelete] = useState(null);

    const fetchCompteurs = async () => {
        // No need to set loading true here as it's handled in the initial load
        try {
            const response = await fetch('http://localhost:3000/api/compteurs');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            const data = await response.json();
            if (Array.isArray(data.compteurs)) {
                setCompteurs(data.compteurs);
            } else {
                setError('Le format des données est incorrect.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchCompteurs();
    }, []);

    // Open modal and set counter to delete
    const handleDeleteClick = (id) => {
        setCounterToDelete(id);
        setShowDeleteModal(true);
    };

    // Close modal
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setCounterToDelete(null);
    };

    // Confirm deletion and close modal
    const confirmDelete = async () => {
        if (counterToDelete) {
            try {
                const response = await fetch(`http://localhost:3000/api/compteurs/${counterToDelete}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression');
                }
                fetchCompteurs(); // Re-fetch data
            } catch (err) {
                alert(err.message); // For now, we'll keep alert for errors
            } finally {
                cancelDelete();
            }
        }
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>Erreur: {error}</div>;
    }

    return (
        <>
            <Modal
                show={showDeleteModal}
                type="confirm"
                title="Confirmer la Suppression"
                message="Êtes-vous sûr de vouloir supprimer ce compteur ? Cette action est irréversible."
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
            <div className="liste-compteurs-container">
                <h2>Liste des Compteurs</h2>
                <button onClick={() => navigate('/home')} className="btn-home">
                    <FaHome />
                    Retour à l'Accueil
                </button>
                <table className="compteurs-table">
                    <thead>
                        <tr>
                            <th>Numéro du Compteur</th>
                            <th>Code-barres</th>
                            <th>Adresse</th>
                            <th>Type</th>
                            <th>Diamètre (mm)</th>
                            <th>Date d'Installation</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {compteurs.map((compteur) => (
                            <tr key={compteur.id}>
                                <td data-label="Numéro">{compteur.numero_compteur}</td>
                                <td data-label="Code-barres">{compteur.code_barre}</td>
                                <td data-label="Adresse">{compteur.adresse_installation}</td>
                                <td data-label="Type">{compteur.type_compteur}</td>
                                <td data-label="Diamètre (mm)">{compteur.diametre_nominal != null ? compteur.diametre_nominal : 'N/A'}</td>
                                <td data-label="Installé le">{compteur.date_installation ? new Date(compteur.date_installation).toLocaleDateString() : ''}</td>
                                <td data-label="Statut">{compteur.statut}</td>
                                <td data-label="Actions">
                                    <button onClick={() => navigate(`/modifier-compteur/${compteur.id}`)} className="btn-edit">
                                        <FaEdit /> Modifier
                                    </button>
                                    <button onClick={() => handleDeleteClick(compteur.id)} className="btn-delete">
                                        <FaTrash /> Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ListeCompteurs;
