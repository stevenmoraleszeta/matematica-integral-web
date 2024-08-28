import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import QuestionEditor from '../questionEditor/QuestionEditor';

function EditForm() {
    const { formId } = useParams();
    const [form, setForm] = useState({ name: '', questions: [] });

    useEffect(() => {
        const fetchForm = async () => {
            if (formId) {
                const formDoc = await getDoc(doc(db, "forms", formId));
                if (formDoc.exists()) {
                    setForm(formDoc.data());
                }
            }
        };
        fetchForm();
    }, [formId]);

    return (
        <div className="edit-form-container">
            <h1>Editando Formulario: {form.name}</h1>
            <QuestionEditor
                questions={form.questions}
                setQuestions={(questions) => setForm(prevState => ({ ...prevState, questions }))}
                formId={formId}  // Pasar formId para guardar automáticamente
            />
        </div>
    );
}

export default EditForm;
