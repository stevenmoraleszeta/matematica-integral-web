import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import './DataManagement.css';

function DataManagement() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    // Función para eliminar todos los documentos de una colección
    const deleteAllFromCollection = async (collectionName) => {
        try {
            const snapshot = await getDocs(collection(db, collectionName));
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            return snapshot.size;
        } catch (error) {
            console.error(`Error deleting from ${collectionName}:`, error);
            throw error;
        }
    };

    // Función para eliminar todos los datos
    const deleteAllData = async () => {
        setLoading(true);
        setStatus('Eliminando datos existentes...');
        
        try {
            const collections = [
                'students', 'teachers', 'groups', 'sessions', 
                'scores', 'homeworks', 'mockExams', 'forms', 
                'responses', 'reports'
            ];

            let totalDeleted = 0;
            for (const collectionName of collections) {
                const deleted = await deleteAllFromCollection(collectionName);
                totalDeleted += deleted;
                setStatus(`${t('common.delete')} ${deleted} ${t('common.documents')} de ${collectionName}...`);
            }

            setStatus(`${t('dataManagement.deleteSuccess')} ${totalDeleted} ${t('dataManagement.deleteSuccessFull')}`);
        } catch (error) {
            setStatus(`${t('dataManagement.deleteError')}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Función para generar datos ficticios
    const generateFakeData = async () => {
        setLoading(true);
        setStatus(`${t('dataManagement.generateFake')}...`);

        try {
            // 1. Crear profesores
            setStatus('Creando profesores...');
            const teachers = [
                { identificator: 'T001', name: 'Prof. María González', email: 'maria.gonzalez@academia.edu', phone: '+50688881234', subject: 'Matemáticas' },
                { identificator: 'T002', name: 'Prof. Carlos Rodríguez', email: 'carlos.rodriguez@academia.edu', phone: '+50688881235', subject: 'Verbal' },
                { identificator: 'T003', name: 'Prof. Ana Martínez', email: 'ana.martinez@academia.edu', phone: '+50688881236', subject: 'Matemáticas' },
                { identificator: 'T004', name: 'Prof. Luis Fernández', email: 'luis.fernandez@academia.edu', phone: '+50688881237', subject: 'Verbal' },
                { identificator: 'T005', name: 'Prof. Sofía Ramírez', email: 'sofia.ramirez@academia.edu', phone: '+50688881238', subject: 'Matemáticas' },
                { identificator: 'T006', name: 'Prof. Diego Morales', email: 'diego.morales@academia.edu', phone: '+50688881239', subject: 'Verbal' },
                { identificator: 'T007', name: 'Prof. Laura Jiménez', email: 'laura.jimenez@academia.edu', phone: '+50688881240', subject: 'Matemáticas' },
                { identificator: 'T008', name: 'Prof. Andrés Herrera', email: 'andres.herrera@academia.edu', phone: '+50688881241', subject: 'Verbal' }
            ];

            const teacherIds = [];
            for (const teacher of teachers) {
                const docRef = await addDoc(collection(db, 'teachers'), teacher);
                teacherIds.push(docRef.id);
            }

            // 2. Crear grupos
            setStatus('Creando grupos...');
            const groups = [
                { identificator: 'G001', name: 'Grupo A - Mañana', description: 'Grupo de nivel básico, horario matutino', teacherMath: teacherIds[0], teacherVerbal: teacherIds[1] },
                { identificator: 'G002', name: 'Grupo B - Tarde', description: 'Grupo de nivel intermedio, horario vespertino', teacherMath: teacherIds[2], teacherVerbal: teacherIds[3] },
                { identificator: 'G003', name: 'Grupo C - Avanzado', description: 'Grupo de nivel avanzado, preparación intensiva', teacherMath: teacherIds[4], teacherVerbal: teacherIds[5] },
                { identificator: 'G004', name: 'Grupo D - Sábados', description: 'Grupo de fin de semana, nivel intermedio', teacherMath: teacherIds[6], teacherVerbal: teacherIds[7] },
                { identificator: 'G005', name: 'Grupo E - Intensivo', description: 'Curso intensivo de verano', teacherMath: teacherIds[0], teacherVerbal: teacherIds[1] },
                { identificator: 'G006', name: 'Grupo F - Nocturno', description: 'Grupo para estudiantes trabajadores', teacherMath: teacherIds[2], teacherVerbal: teacherIds[3] }
            ];

            const groupIds = [];
            for (const group of groups) {
                const docRef = await addDoc(collection(db, 'groups'), group);
                groupIds.push(docRef.id);
            }

            // 3. Crear estudiantes
            setStatus('Creando estudiantes...');
            const studentNames = [
                ['Juan', 'Pérez', 'juan.perez@email.com', '+50688882001', 'María Pérez', 'maria.perez@email.com', '+50688882002'],
                ['María', 'García', 'maria.garcia@email.com', '+50688882003', 'Carlos García', 'carlos.garcia@email.com', '+50688882004'],
                ['Carlos', 'López', 'carlos.lopez@email.com', '+50688882005', 'Ana López', 'ana.lopez@email.com', '+50688882006'],
                ['Ana', 'Martínez', 'ana.martinez@email.com', '+50688882007', 'Luis Martínez', 'luis.martinez@email.com', '+50688882008'],
                ['Luis', 'González', 'luis.gonzalez@email.com', '+50688882009', 'Sofía González', 'sofia.gonzalez@email.com', '+50688882010'],
                ['Sofía', 'Rodríguez', 'sofia.rodriguez@email.com', '+50688882011', 'Diego Rodríguez', 'diego.rodriguez@email.com', '+50688882012'],
                ['Diego', 'Fernández', 'diego.fernandez@email.com', '+50688882013', 'Laura Fernández', 'laura.fernandez@email.com', '+50688882014'],
                ['Laura', 'Ramírez', 'laura.ramirez@email.com', '+50688882015', 'Andrés Ramírez', 'andres.ramirez@email.com', '+50688882016'],
                ['Andrés', 'Morales', 'andres.morales@email.com', '+50688882017', 'Patricia Morales', 'patricia.morales@email.com', '+50688882018'],
                ['Patricia', 'Jiménez', 'patricia.jimenez@email.com', '+50688882019', 'Roberto Jiménez', 'roberto.jimenez@email.com', '+50688882020'],
                ['Roberto', 'Herrera', 'roberto.herrera@email.com', '+50688882021', 'Carmen Herrera', 'carmen.herrera@email.com', '+50688882022'],
                ['Carmen', 'Vargas', 'carmen.vargas@email.com', '+50688882023', 'Jorge Vargas', 'jorge.vargas@email.com', '+50688882024'],
                ['Jorge', 'Castro', 'jorge.castro@email.com', '+50688882025', 'Mónica Castro', 'monica.castro@email.com', '+50688882026'],
                ['Mónica', 'Méndez', 'monica.mendez@email.com', '+50688882027', 'Ricardo Méndez', 'ricardo.mendez@email.com', '+50688882028'],
                ['Ricardo', 'Sánchez', 'ricardo.sanchez@email.com', '+50688882029', 'Elena Sánchez', 'elena.sanchez@email.com', '+50688882030'],
                ['Elena', 'Torres', 'elena.torres@email.com', '+50688882031', 'Fernando Torres', 'fernando.torres@email.com', '+50688882032'],
                ['Fernando', 'Díaz', 'fernando.diaz@email.com', '+50688882033', 'Gloria Díaz', 'gloria.diaz@email.com', '+50688882034'],
                ['Gloria', 'Ruiz', 'gloria.ruiz@email.com', '+50688882035', 'Héctor Ruiz', 'hector.ruiz@email.com', '+50688882036'],
                ['Héctor', 'Ortega', 'hector.ortega@email.com', '+50688882037', 'Isabel Ortega', 'isabel.ortega@email.com', '+50688882038'],
                ['Isabel', 'Navarro', 'isabel.navarro@email.com', '+50688882039', 'Javier Navarro', 'javier.navarro@email.com', '+50688882040'],
                ['Javier', 'Ramos', 'javier.ramos@email.com', '+50688882041', 'Karla Ramos', 'karla.ramos@email.com', '+50688882042'],
                ['Karla', 'Moreno', 'karla.moreno@email.com', '+50688882043', 'Leonardo Moreno', 'leonardo.moreno@email.com', '+50688882044'],
                ['Leonardo', 'Cruz', 'leonardo.cruz@email.com', '+50688882045', 'Natalia Cruz', 'natalia.cruz@email.com', '+50688882046'],
                ['Natalia', 'Reyes', 'natalia.reyes@email.com', '+50688882047', 'Óscar Reyes', 'oscar.reyes@email.com', '+50688882048'],
                ['Óscar', 'Gutiérrez', 'oscar.gutierrez@email.com', '+50688882049', 'Paola Gutiérrez', 'paola.gutierrez@email.com', '+50688882050'],
                ['Paola', 'Medina', 'paola.medina@email.com', '+50688882051', 'Quique Medina', 'quique.medina@email.com', '+50688882052'],
                ['Quique', 'Aguilar', 'quique.aguilar@email.com', '+50688882053', 'Rosa Aguilar', 'rosa.aguilar@email.com', '+50688882054'],
                ['Rosa', 'Silva', 'rosa.silva@email.com', '+50688882055', 'Sergio Silva', 'sergio.silva@email.com', '+50688882056'],
                ['Sergio', 'Mendoza', 'sergio.mendoza@email.com', '+50688882057', 'Teresa Mendoza', 'teresa.mendoza@email.com', '+50688882058'],
                ['Teresa', 'Vega', 'teresa.vega@email.com', '+50688882059', 'Ulises Vega', 'ulises.vega@email.com', '+50688882060']
            ];

            const studentIds = [];
            let studentCounter = 1;
            for (let i = 0; i < studentNames.length; i++) {
                const [firstName, lastName, email, phone, parentName, parentEmail, parentPhone] = studentNames[i];
                const student = {
                    identificator: `S${String(studentCounter).padStart(3, '0')}`,
                    name: `${firstName} ${lastName}`,
                    email,
                    phone,
                    parentName,
                    parentEmail,
                    parentPhone,
                    groupId: groupIds[i % groupIds.length]
                };
                const docRef = await addDoc(collection(db, 'students'), student);
                studentIds.push(docRef.id);
                studentCounter++;
            }

            // 4. Crear sesiones
            setStatus('Creando sesiones...');
            const sessionNames = [
                'Introducción a Álgebra', 'Ecuaciones Lineales', 'Sistemas de Ecuaciones', 'Funciones y Gráficas',
                'Geometría Básica', 'Trigonometría', 'Álgebra Avanzada', 'Cálculo Diferencial',
                'Comprensión Lectora I', 'Análisis de Textos', 'Redacción y Ortografía', 'Literatura',
                'Gramática Avanzada', 'Vocabulario y Sinónimos', 'Análisis Literario', 'Ensayo Académico'
            ];

            const sessionDates = [];
            const today = new Date();
            for (let i = 0; i < 20; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (20 - i));
                sessionDates.push(date.toISOString().split('T')[0]);
            }

            for (let i = 0; i < 20; i++) {
                const groupId = groupIds[i % groupIds.length];
                const group = groups[i % groups.length];
                // Alternar entre profesor de matemáticas y verbal
                const teacherId = i % 2 === 0 ? group.teacherMath : group.teacherVerbal;
                
                // Obtener estudiantes del grupo
                const groupIndex = groupIds.indexOf(groupId);
                const groupStudents = studentIds.filter((_, idx) => idx % groupIds.length === groupIndex);
                
                const attendance = {};
                groupStudents.forEach(studentId => {
                    const rand = Math.random();
                    attendance[studentId] = rand > 0.2 ? 'present' : (rand > 0.1 ? 'absent' : 'excusedAbsence');
                });

                const session = {
                    identificator: `SES${String(i + 1).padStart(3, '0')}`,
                    name: sessionNames[i % sessionNames.length],
                    date: sessionDates[i],
                    groupId,
                    teacherId,
                    attendance
                };
                await addDoc(collection(db, 'sessions'), session);
            }

            // 5. Crear calificaciones
            setStatus('Creando calificaciones...');
            const scoreNames = [
                'Quiz 1 - Álgebra Básica', 'Quiz 2 - Ecuaciones', 'Examen Parcial 1', 'Quiz 3 - Funciones',
                'Quiz 4 - Geometría', 'Examen Parcial 2', 'Quiz 5 - Trigonometría', 'Examen Final',
                'Quiz Comprensión Lectora', 'Examen de Redacción', 'Quiz Vocabulario', 'Examen de Literatura'
            ];

            for (let i = 0; i < 15; i++) {
                const groupId = groupIds[i % groupIds.length];
                const groupIndex = groupIds.indexOf(groupId);
                const groupStudents = studentIds.filter((_, idx) => idx % groupIds.length === groupIndex);
                
                const scores = {};
                groupStudents.forEach(studentId => {
                    scores[studentId] = String(Math.floor(Math.random() * 30) + 70); // Calificaciones entre 70-100
                });

                const score = {
                    identificator: `SC${String(i + 1).padStart(3, '0')}`,
                    name: scoreNames[i % scoreNames.length],
                    date: sessionDates[i % sessionDates.length],
                    groupId,
                    scores
                };
                await addDoc(collection(db, 'scores'), score);
            }

            // 6. Crear tareas
            setStatus('Creando tareas...');
            const homeworkNames = [
                'Tarea 1 - Ejercicios de Álgebra', 'Tarea 2 - Problemas de Ecuaciones', 'Tarea 3 - Funciones',
                'Tarea 4 - Geometría', 'Tarea 5 - Trigonometría', 'Proyecto Final de Matemáticas',
                'Tarea 1 - Análisis de Texto', 'Tarea 2 - Redacción', 'Tarea 3 - Ensayo',
                'Tarea 4 - Literatura', 'Tarea 5 - Gramática', 'Proyecto Final de Verbal'
            ];

            for (let i = 0; i < 18; i++) {
                const groupId = groupIds[i % groupIds.length];
                const group = groups[i % groups.length];
                // Alternar entre profesor de matemáticas y verbal
                const teacherId = i % 2 === 0 ? group.teacherMath : group.teacherVerbal;
                const groupIndex = groupIds.indexOf(groupId);
                const groupStudents = studentIds.filter((_, idx) => idx % groupIds.length === groupIndex);
                
                const startDate = new Date(today);
                startDate.setDate(startDate.getDate() - (25 - i));
                const submitDate = new Date(startDate);
                submitDate.setDate(submitDate.getDate() + 7);

                const scores = {};
                groupStudents.forEach(studentId => {
                    const rand = Math.random();
                    scores[studentId] = rand > 0.3 ? 'submited' : 'notSubmited';
                });

                const homework = {
                    identificator: `HW${String(i + 1).padStart(3, '0')}`,
                    name: homeworkNames[i % homeworkNames.length],
                    startDate: startDate.toISOString().split('T')[0],
                    submitDate: submitDate.toISOString().split('T')[0],
                    groupId,
                    teacherId,
                    scores
                };
                await addDoc(collection(db, 'homeworks'), homework);
            }

            // 7. Crear simulacros
            setStatus('Creando simulacros...');
            const mockExamNames = [
                'Simulacro 1 - Prueba de Admisión', 'Simulacro 2 - Matemáticas', 'Simulacro 3 - Verbal',
                'Simulacro 4 - Completo', 'Simulacro 5 - Final', 'Simulacro 6 - Repaso General'
            ];

            for (let i = 0; i < 8; i++) {
                const startDate = new Date(today);
                startDate.setDate(startDate.getDate() - (30 - i * 4));
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);

                const attendance = {};
                studentIds.forEach(studentId => {
                    const rand = Math.random();
                    attendance[studentId] = rand > 0.15 ? 'present' : 'absent';
                });

                const mockExam = {
                    identificator: `ME${String(i + 1).padStart(3, '0')}`,
                    name: mockExamNames[i % mockExamNames.length],
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    attendance
                };
                await addDoc(collection(db, 'mockExams'), mockExam);
            }

            // 8. Crear formularios
            setStatus('Creando formularios...');
            const formSubjects = ['Matemáticas', 'Verbal', 'Matemáticas', 'Verbal', 'General'];
            const formNames = [
                'Evaluación de Álgebra',
                'Test de Comprensión Lectora',
                'Examen de Geometría',
                'Evaluación de Redacción',
                'Encuesta de Satisfacción'
            ];

            const formIds = [];
            for (let i = 0; i < 5; i++) {
                const questions = [];
                
                if (i < 2) {
                    // Formularios con preguntas de opción múltiple
                    for (let q = 1; q <= 5; q++) {
                        questions.push({
                            type: 'multiple-choice',
                            questionText: `Pregunta ${q}: ¿Cuál es la respuesta correcta?`,
                            options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
                            correctAnswers: ['Opción B'],
                            imageUrl: ''
                        });
                    }
                } else if (i === 2) {
                    // Formulario con checkboxes
                    for (let q = 1; q <= 4; q++) {
                        questions.push({
                            type: 'checkboxes',
                            questionText: `Pregunta ${q}: Selecciona todas las opciones correctas:`,
                            options: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
                            correctAnswers: ['Opción 1', 'Opción 3'],
                            imageUrl: ''
                        });
                    }
                } else if (i === 3) {
                    // Formulario con texto
                    for (let q = 1; q <= 3; q++) {
                        questions.push({
                            type: 'text',
                            questionText: `Pregunta ${q}: Escribe tu respuesta:`,
                            options: [],
                            correctAnswers: [],
                            imageUrl: ''
                        });
                    }
                } else {
                    // Formulario mixto
                    questions.push({
                        type: 'multiple-choice',
                        questionText: 'Pregunta 1: ¿Cómo calificarías el curso?',
                        options: ['Excelente', 'Bueno', 'Regular', 'Malo'],
                        correctAnswers: [],
                        imageUrl: ''
                    });
                    questions.push({
                        type: 'text',
                        questionText: 'Pregunta 2: ¿Qué mejorarías?',
                        options: [],
                        correctAnswers: [],
                        imageUrl: ''
                    });
                }

                const form = {
                    identificator: `F${String(i + 1).padStart(3, '0')}`,
                    name: formNames[i],
                    subject: formSubjects[i],
                    estado: i < 3 ? 'Activo' : 'Inactivo',
                    timeLimit: i === 4 ? '0' : String((i + 1) * 15),
                    questions
                };
                const docRef = await addDoc(collection(db, 'forms'), form);
                formIds.push(docRef.id);
            }

            // 9. Crear respuestas a formularios
            setStatus('Creando respuestas a formularios...');
            const formsSnapshot = await getDocs(collection(db, 'forms'));
            const formsList = formsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            
            for (let i = 0; i < 25; i++) {
                const form = formsList[i % formsList.length];
                
                if (form && form.questions && form.questions.length > 0) {
                    const responses = form.questions.map((q, idx) => {
                        if (q.type === 'multiple-choice') {
                            return q.options[Math.floor(Math.random() * q.options.length)];
                        } else if (q.type === 'checkboxes') {
                            const selected = [];
                            q.options.forEach(opt => {
                                if (Math.random() > 0.5) selected.push(opt);
                            });
                            return selected.length > 0 ? selected.join(', ') : '';
                        } else {
                            return `Respuesta ${idx + 1} del estudiante`;
                        }
                    });

                    // Calcular calificación
                    let correct = 0;
                    form.questions.forEach((q, idx) => {
                        if (q.type === 'multiple-choice' && q.correctAnswers && q.correctAnswers.length > 0) {
                            if (responses[idx] === q.correctAnswers[0]) correct++;
                        } else if (q.type === 'checkboxes' && q.correctAnswers && q.correctAnswers.length > 0) {
                            const responseSet = new Set(responses[idx].split(', ').filter(r => r));
                            const correctSet = new Set(q.correctAnswers);
                            if (responseSet.size === correctSet.size && 
                                [...responseSet].every(x => correctSet.has(x))) {
                                correct++;
                            }
                        }
                    });
                    const grade = form.questions.length > 0 
                        ? Math.round((correct / form.questions.length) * 100) 
                        : null;

                    const response = {
                        formId: form.id,
                        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                        responses,
                        grade
                    };
                    await addDoc(collection(db, 'responses'), response);
                }
            }

            // 10. Crear reportes
            setStatus('Creando reportes...');
            const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
            const scoresSnapshot = await getDocs(collection(db, 'scores'));
            const mockExamsSnapshot = await getDocs(collection(db, 'mockExams'));

            const sessionsList = sessionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const scoresList = scoresSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const mockExamsList = mockExamsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            for (let i = 0; i < 12; i++) {
                const groupId = groupIds[i % groupIds.length];
                const session = sessionsList[i % sessionsList.length];
                const score = scoresList[i % scoresList.length];
                const mockExam = i % 3 === 0 ? mockExamsList[i % mockExamsList.length] : null;

                const report = {
                    groupId,
                    sessionId: session.id,
                    scoreId: score.id,
                    mockExamId: mockExam ? mockExam.id : '',
                    date: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                };
                await addDoc(collection(db, 'reports'), report);
            }

            setStatus(t('dataManagement.generateSuccess'));
        } catch (error) {
            setStatus(`${t('dataManagement.generateError')}: ${error.message}`);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para hacer todo el proceso
    const resetAndGenerateData = async () => {
        if (!window.confirm(t('dataManagement.confirmReset'))) {
            return;
        }

        await deleteAllData();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar un segundo
        await generateFakeData();
    };

    return (
        <div className="data-management">
            <div className="data-management-container">
                <h1>{t('dataManagement.title')}</h1>
                <p className="warning">
                    {t('dataManagement.warning')}
                </p>

                <div className="actions">
                    <button 
                        onClick={deleteAllData} 
                        disabled={loading}
                        className="btn btn-danger"
                    >
                        {t('dataManagement.deleteAll')}
                    </button>

                    <button 
                        onClick={generateFakeData} 
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {t('dataManagement.generateFake')}
                    </button>

                    <button 
                        onClick={resetAndGenerateData} 
                        disabled={loading}
                        className="btn btn-warning"
                    >
                        {t('dataManagement.resetAndGenerate')}
                    </button>
                </div>

                {status && (
                    <div className={`status ${status.startsWith('✓') ? 'success' : status.startsWith('✗') ? 'error' : 'info'}`}>
                        {status}
                    </div>
                )}

                {loading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>{t('dataManagement.processing')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DataManagement;

