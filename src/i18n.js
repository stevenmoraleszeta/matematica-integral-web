import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

// Función para obtener el idioma inicial
const getInitialLanguage = () => {
    // Verificar si estamos en un entorno de navegador
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return 'es'; // Valor por defecto para SSR/build
    }
    
    // Primero verificar si hay una preferencia guardada en localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        return savedLanguage;
    }
    
    // Si no hay preferencia guardada, detectar el idioma del navegador
    if (typeof navigator !== 'undefined') {
        const browserLanguage = navigator.language || navigator.userLanguage;
        
        // Detectar si el navegador está en español o inglés
        if (browserLanguage.startsWith('es')) {
            return 'es';
        } else if (browserLanguage.startsWith('en')) {
            return 'en';
        }
    }
    
    // Por defecto español si no se puede detectar
    return 'es';
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslations
            },
            es: {
                translation: esTranslations
            }
        },
        lng: getInitialLanguage(),
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false // React ya escapa los valores por defecto
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
