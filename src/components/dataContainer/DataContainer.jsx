import './DataContainer.css';
import { collection, addDoc } from 'firebase/firestore';
import { read, utils } from 'xlsx';
import { db } from '../../firebase/firebase';
import { MdUpload } from 'react-icons/md';  // Importa el ícono de carga

const DataContainer = ({ searchTerm, handleSearch, openModal, fetchFunction, dbCollection, children }) => {
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const confirmUpload = window.confirm("¿Está seguro de que desea cargar estos datos? Esta acción es irreversible.");
        if (!confirmUpload) {
            e.target.value = ''; // Reset file input
            return;
        }

        const reader = new FileReader();
        
        reader.onerror = () => {
            alert("Error al leer el archivo. Por favor, intente de nuevo.");
            e.target.value = '';
        };

        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = read(data, { type: 'array' });
                
                if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                    alert("El archivo no contiene hojas de cálculo válidas.");
                    e.target.value = '';
                    return;
                }

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = utils.sheet_to_json(worksheet);

                if (!jsonData || jsonData.length === 0) {
                    alert("El archivo no contiene datos válidos.");
                    e.target.value = '';
                    return;
                }

                let successCount = 0;
                let errorCount = 0;

                for (const register of jsonData) {
                    try {
                        await addDoc(collection(db, dbCollection), register);
                        successCount++;
                    } catch (error) {
                        console.error("Error adding document from Excel: ", error);
                        errorCount++;
                    }
                }

                await fetchFunction();
                e.target.value = ''; // Reset file input
                
                if (errorCount > 0) {
                    alert(`Datos cargados parcialmente. Exitosos: ${successCount}, Errores: ${errorCount}`);
                } else {
                    alert(`Los datos han sido cargados exitosamente. Total: ${successCount} registros.`);
                }
            } catch (error) {
                console.error("Error processing file: ", error);
                alert("Error al procesar el archivo. Por favor, verifique que el formato sea correcto.");
                e.target.value = '';
            }
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
