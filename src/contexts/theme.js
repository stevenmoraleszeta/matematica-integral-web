import { useContext, useState, useEffect, createContext, useMemo, useCallback } from "react";

const ThemeContext = createContext();

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }) {
    // Función para obtener el tema inicial
    const getInitialTheme = () => {
        // Verificar si estamos en un entorno de navegador
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return 'light'; // Valor por defecto para SSR/build
        }
        
        // Primero verificar si hay una preferencia guardada en localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Si no hay preferencia guardada, usar la preferencia del sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    const [theme, setTheme] = useState(() => {
        // Aplicar el tema inmediatamente al inicializar el estado
        const initialTheme = getInitialTheme();
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', initialTheme);
        }
        return initialTheme;
    });

    // Aplicar el tema al documento con transición suave
    useEffect(() => {
        const root = document.documentElement;
        // Agregar clase para transición suave
        root.classList.add('theme-transitioning');
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Remover clase después de la transición
        const timer = setTimeout(() => {
            root.classList.remove('theme-transitioning');
        }, 500);
        
        return () => clearTimeout(timer);
    }, [theme]);

    // Escuchar cambios en la preferencia del sistema (solo si no hay preferencia guardada)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            // Solo actualizar si no hay preferencia guardada
            const savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        // Agregar listener
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            // Fallback para navegadores antiguos
            mediaQuery.addListener(handleChange);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }, []);

    const value = useMemo(() => ({
        theme,
        toggleTheme,
        isDark: theme === 'dark',
    }), [theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

