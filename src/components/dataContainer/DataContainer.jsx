import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './DataContainer.css';
import { collection, addDoc } from 'firebase/firestore';
import { read, utils } from 'xlsx';
import { db } from '../../firebase/firebase';
import { MdUpload } from 'react-icons/md';

const DataContainer = memo(({ searchTerm, handleSearch, openModal, fetchFunction, dbCollection, children }) => {
    const { t } = useTranslation();
    
    const handleFileUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const confirmUpload = window.confirm(t('common.uploadConfirm'));
        if (!confirmUpload) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = utils.sheet_to_json(worksheet);

                for (const register of jsonData) {
                    try {
                        await addDoc(collection(db, dbCollection), register);
                    } catch (error) {
                        console.error("Error adding document from Excel: ", error);
                    }
                }

                if (fetchFunction) {
                    await fetchFunction();
                }
                alert(t('common.uploadSuccess'));
            } catch (error) {
                console.error("Error processing file: ", error);
                alert(t('common.uploadError'));
            }
        };

        reader.readAsArrayBuffer(file);
    }, [dbCollection, fetchFunction, t]);

    return (
        <div className="data-container">
            <div className="add-container">
                <button className="add-button" onClick={openModal}>{t('common.addRecord')}</button>
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
                placeholder={t('common.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
            />
            <div className="data-list">
                {children}
            </div>
        </div>
    );
});

DataContainer.displayName = 'DataContainer';

export default DataContainer;
