
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaTag, FaMapMarkerAlt, FaWater, FaCalendarAlt, FaBarcode } from 'react-icons/fa';
import Modal from '../UI/Modal'; // Import Modal
import './ModifierCompteur.css';
import { API_BASE_URL } from '../../api';

const ModifierCompteur = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        numero_compteur: '',
        code_barre: '',
        adresse_installation: '',
        type_compteur: 'Eau froide',
        diametre_nominal: '',
        statut: 'actif',
        date_installation: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [modalState, setModalState] = useState({ show: false, type: '', title: '', message: '' });

    useEffect(() => {
        const fetchCompteur = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/compteurs/${id}`);
                if (!response.ok) {
                    throw new Error('Compteur non trouvé');
                }
                const data = await response.json();
                const formattedDate = data.date_installation ? new Date(data.date_installation).toISOString().split('T')[0] : '';
                setFormData({
                    ...data,
                    date_installation: formattedDate
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCompteur();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/compteurs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erreur lors de la mise à jour' }));
                throw new Error(errorData.message);
            }
            setModalState({
                show: true,
                type: 'success',
                title: 'Succès',
                message: 'Compteur mis à jour avec succès !'
            });
        } catch (err) {
            setModalState({
                show: true,
                type: 'error',
                title: 'Erreur',
                message: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        if (modalState.type === 'success') {
            navigate('/liste-compteurs');
        }
        setModalState({ show: false, type: '', title: '', message: '' });
    };
    
    if (loading && !modalState.show) return <div>Chargement...</div>;
    if (error) return <div>Erreur: {error}</div>;

    return (
        <>
            <Modal
                show={modalState.show}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
                onConfirm={handleModalClose}
                onCancel={handleModalClose}
            />
            <div className="form-container">
                <h2><FaSave /> Modifier le Compteur</h2>
                <form onSubmit={handleSubmit} className="new-compteur-form">
                    {/* Form inputs remain the same */}
                    <div className="input-group">
                        <label><FaTag /> Numéro de compteur</label>
                        <input type="text" name="numero_compteur" value={formData.numero_compteur} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label><FaBarcode /> Code-barres</label>
                        <input type="text" name="code_barre" value={formData.code_barre} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label><FaMapMarkerAlt /> Adresse d'Installation</label>
                        <input type="text" name="adresse_installation" value={formData.adresse_installation} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label><FaWater /> Type de Compteur</label>
                        <select name="type_compteur" value={formData.type_compteur} onChange={handleChange}>
                            <option value="Eau froide">Eau froide</option>
                            <option value="Eau chaude">Eau chaude</option>
                            <option value="Irrigation">Irrigation</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Diamètre Nominal (mm)</label>
                        <input type="number" step="0.01" name="diametre_nominal" value={formData.diametre_nominal} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label><FaCalendarAlt /> Date d'Installation</label>
                        <input type="date" name="date_installation" value={formData.date_installation} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Statut</label>
                        <select name="statut" value={formData.statut} onChange={handleChange}>
                            <option value="actif">Actif</option>
                            <option value="inactif">Inactif</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <div className="button-group">
                        <button type="button" onClick={() => navigate('/liste-compteurs')} disabled={loading}><FaTimes /> Annuler</button>
                        <button type="submit" disabled={loading}>{loading ? 'Mise à jour...' : 'Confirmer les modifications'}</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ModifierCompteur;
