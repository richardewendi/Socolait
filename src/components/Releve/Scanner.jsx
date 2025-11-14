import React from 'react';
import { FaQrcode } from 'react-icons/fa';

const Scanner = ({ onScanSuccess }) => (
    <div className="scanner-mock">
        <FaQrcode className="scanner-icon" />
        <p>Simulation de Scan. Cliquez pour identifier le compteur CPT-123.</p>
        <button onClick={() => onScanSuccess('CPT-123')} className="btn-mock-scan">
            Scanner Code-Barres
        </button>
    </div>
);

export default Scanner;