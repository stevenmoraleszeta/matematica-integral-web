import React from 'react';
import './DataContainer.css';

const DataContainer = ({ searchTerm, handleSearch, openModal, children }) => {
    return (
        <div className="data-container">
            <button className="add-button" onClick={openModal}>Agregar Registro</button>
            <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
            />
            <div className="data-list">
                {children}
            </div>
        </div>
    );
};

export default DataContainer;
