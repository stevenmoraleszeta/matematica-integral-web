import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FieldMappingModal = ({ showModal, closeModal, data, onSubmit }) => {
    const { t } = useTranslation();
    const [mappings, setMappings] = useState({});

    const handleMappingChange = (index, field) => {
        setMappings(prevMappings => ({
            ...prevMappings,
            [index]: field
        }));
    };

    const handleSubmit = () => {
        onSubmit(mappings);
    };

    return (
        showModal && (
            <div className="modal">
                <div className="modal-content">
                    <h2>{t('fieldMapping.title')}</h2>
                    {data[0] && Object.keys(data[0]).map((columnName, index) => (
                        <div key={index}>
                            <label>
                                <span>{t('fieldMapping.column')} "{columnName}": </span>
                                <select 
                                    value={mappings[index] || ''}
                                    onChange={(e) => handleMappingChange(index, e.target.value)}
                                >
                                    <option value="">{t('fieldMapping.selectField')}</option>
                                    <option value="name">{t('formFields.name')}</option>
                                    <option value="email">{t('formFields.email')}</option>
                                    <option value="parentEmail">{t('formFields.parentEmail')}</option>
                                    <option value="phone">{t('formFields.phone')}</option>
                                    <option value="parentPhone">{t('formFields.parentPhone')}</option>
                                    <option value="groupId">{t('formFields.group')}</option>
                                </select>
                            </label>
                        </div>
                    ))}
                    <button onClick={handleSubmit}>{t('fieldMapping.saveMapping')}</button>
                    <button onClick={closeModal}>{t('common.cancel')}</button>
                </div>
            </div>
        )
    );
};

export default FieldMappingModal;
