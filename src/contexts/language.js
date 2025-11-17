import { useContext, useState, useEffect, createContext, useMemo, useCallback } from "react";
import i18n from '../i18n';

const LanguageContext = createContext();

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export function LanguageProvider({ children }) {
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

    const [language, setLanguage] = useState(() => {
        const initialLanguage = getInitialLanguage();
        // Cambiar el idioma de i18n inmediatamente
        i18n.changeLanguage(initialLanguage);
        // Actualizar el atributo lang del HTML
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('lang', initialLanguage);
        }
        return initialLanguage;
    });

    // Cambiar el idioma en i18n y actualizar el HTML cuando cambie
    useEffect(() => {
        i18n.changeLanguage(language);
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('lang', language);
            localStorage.setItem('language', language);
        }
    }, [language]);

    const changeLanguage = useCallback((lang) => {
        if (lang === 'es' || lang === 'en') {
            setLanguage(lang);
        }
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(prevLang => prevLang === 'es' ? 'en' : 'es');
    }, []);

    const value = useMemo(() => ({
        language,
        changeLanguage,
        toggleLanguage,
        isSpanish: language === 'es',
        isEnglish: language === 'en',
    }), [language, changeLanguage, toggleLanguage]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}
