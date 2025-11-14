import React from 'react';

const CardButton = ({ icon: Icon, title, description, onClick }) => (
    <div className="card-button" onClick={onClick}>
        <Icon className="card-icon" />
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

export default CardButton;