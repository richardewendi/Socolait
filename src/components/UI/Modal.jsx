
import React from 'react';
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import './Modal.css';

const Modal = ({ type = 'info', title, message, onConfirm, onCancel, show }) => {
    if (!show) {
        return null;
    }

    const Icon = () => {
        switch (type) {
            case 'confirm':
                return <FaExclamationTriangle className="modal-icon confirm" />;
            case 'success':
                return <FaCheckCircle className="modal-icon success" />;
            case 'error':
                return <FaExclamationTriangle className="modal-icon error" />;
            default:
                return null;
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <button onClick={onCancel} className="modal-close-btn">&times;</button>
                <div className="modal-header">
                    <Icon />
                    <h2>{title}</h2>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    {type === 'confirm' ? (
                        <>
                            <button onClick={onCancel} className="btn-modal-cancel">Annuler</button>
                            <button onClick={onConfirm} className="btn-modal-confirm">Confirmer</button>
                        </>
                    ) : (
                        <button onClick={onConfirm} className="btn-modal-ok">OK</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
