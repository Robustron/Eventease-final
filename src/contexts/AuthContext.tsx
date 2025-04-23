import * as React from 'react';
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth, db } from '@/firebaseConfig'; // Import db
import { User, onAuthStateChanged, Unsubscribe, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'; // Import auth methods
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; // Import firestore methods

// Define the shape of the context data
interface AuthContextType {
    currentUser: User | null;       // Firebase User object or null
    authLoading: boolean;         // Loading initial auth state?
    isLoading: boolean;           // General loading state (used by OrganizerLogin, maybe rename/refactor later if needed)
    login: (email: string, password: string) => Promise<void>; 
    signUp: (email: string, password: string) => Promise<void>; // Add signUp function type
    // Add logout here if needed globally
    logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Define props for the provider component
interface AuthProviderProps {
    children: ReactNode; 
}

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true); // Loading initial state?
    const [isLoading, setIsLoading] = useState(false); // General loading

    // Listener for initial auth state
    useEffect(() => {
        const unsubscribe: Unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setAuthLoading(false); 
        });
        return unsubscribe;
    }, []); 

    // Login function implementation
    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            // Simply sign in. Role checks will happen elsewhere (e.g., page load, protected routes).
            await signInWithEmailAndPassword(auth, email, password);
            // No role check here. Successful sign-in updates currentUser via listener.
        } catch (error) {
            console.error("AuthContext Login Error:", error);
            // Re-throw the error for the calling component to handle UI feedback
            throw error; 
        } finally {
            setIsLoading(false);
        }
    };

    // --- SignUp Function (for Customers) ---
    const signUp = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            // 1. Create Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // 2. Create user document in Firestore
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                role: 'customer', // Explicitly set role
                createdAt: serverTimestamp(),
            });
            // Listener will set currentUser
        } catch (error) {
            console.error("AuthContext SignUp Error:", error);
            throw error; // Re-throw for component UI feedback
        } finally {
             setIsLoading(false);
        }
    };

    // --- Logout Function ---
    const logout = async (): Promise<void> => {
        try {
            await signOut(auth);
            // currentUser will become null via listener
        } catch (error) {
             console.error("AuthContext Logout Error:", error);
             throw error;
        }
    };

    // Value provided by the context
    const value: AuthContextType = {
        currentUser,
        authLoading,
        isLoading,
        login,       // Provide login function
        signUp,       // Provide signUp function
        logout,       // Provide logout function
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Render children only after initial auth state is resolved */}
            {!authLoading && children} 
        </AuthContext.Provider>
    );
};
