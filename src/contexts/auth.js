import { useContext, useState, useEffect, createContext, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        }, (error) => {
            console.error('Auth state change error:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const updateCurrentUser = useCallback((user) => {
        setCurrentUser(user);
    }, []);

    const value = {
        currentUser,
        updateCurrentUser,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
