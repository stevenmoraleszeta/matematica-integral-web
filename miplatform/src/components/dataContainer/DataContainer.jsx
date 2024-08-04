import React from 'react';
import './DataContainer.css';
import { collection, addDoc } from 'firebase/firestore';
import { read, utils } from 'xlsx';
import { db } from '../../firebase/firebase';
import { MdUpload } from 'react-icons/md';  // Importa el ícono de carga

const DataContainer = ({ searchTerm, handleSearch, openModal, fetchFunction, dbCollection, children }) => {
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = utils.sheet_to_json(worksheet);

            console.log(jsonData);

            for (const register of jsonData) {
                try {
                    await addDoc(collection(db, dbCollection), register);
                } catch (e) {
                    console.error("Error adding document from Excel: ", e);
                }
            }

            await fetchFunction();
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="data-container">
            <div className="add-container">
                <button className="add-button" onClick={openModal}>Agregar Registro</button>
                {/*Implement file upload in all modules*/}
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className='upload-input'
                    id="upload-file"
                />
                <label htmlFor="upload-file" className="upload-label">
                    <MdUpload size={30} />
                </label>
            </div>
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
