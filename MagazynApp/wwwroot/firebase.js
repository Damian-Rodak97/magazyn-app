// Firebase configuration and services for Magazyn App
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC6WpxPuYGrPcg6UETqfE5pMK8vZr44Jx8",
    authDomain: "magazyn-app-137df.firebaseapp.com",
    projectId: "magazyn-app-137df",
    storageBucket: "magazyn-app-137df.firebasestorage.app",
    messagingSenderId: "627898949603",
    appId: "1:627898949603:web:f46601e9a8573b3ac04ad6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase initialized successfully');

// Auth state change listener
let currentUser = null;
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        console.log('User logged in:', user.email);
    } else {
        console.log('User logged out');
    }
});

// ============================================
// Authentication Functions
// ============================================

window.firebaseAuth = {
    // Sign in with email and password
    signIn: async function(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Sign in successful:', userCredential.user.email);
            return { success: true, user: userCredential.user.email };
        } catch (error) {
            console.error('Sign in error:', error.code, error.message);
            return { success: false, error: error.message };
        }
    },

    // Create new user (first time setup)
    createUser: async function(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User created:', userCredential.user.email);
            return { success: true, user: userCredential.user.email };
        } catch (error) {
            console.error('Create user error:', error.code, error.message);
            return { success: false, error: error.message };
        }
    },

    // Sign out
    signOut: async function() {
        try {
            await signOut(auth);
            console.log('Sign out successful');
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get current user
    getCurrentUser: function() {
        if (currentUser) {
            return { email: currentUser.email, uid: currentUser.uid };
        }
        return null;
    },

    // Check if user is logged in
    isLoggedIn: function() {
        return currentUser !== null;
    }
};

// ============================================
// Firestore Database Functions
// ============================================

window.firebaseDb = {
    // Save all warehouses for current user
    saveWarehouses: async function(warehousesJson) {
        console.log('🔵 saveWarehouses called');
        try {
            if (!currentUser) {
                console.error('❌ No user logged in!');
                return { success: false, error: 'No user logged in' };
            }

            console.log('✅ User logged in:', currentUser.email);
            const data = JSON.parse(warehousesJson);
            console.log('📦 Original data:', data);
            const userId = currentUser.uid;
            console.log('🔑 User ID:', userId);

            // Convert nested arrays to JSON strings (Firestore doesn't support nested arrays)
            const warehousesForFirestore = data.warehouses.map(warehouse => ({
                ...warehouse,
                Grid: JSON.stringify(warehouse.Grid || []),
                Corridors: JSON.stringify(warehouse.Corridors || []),
                Taken: JSON.stringify(warehouse.Taken || []),
                TakenDates: JSON.stringify(warehouse.TakenDates || [])
            }));

            console.log('📦 Converted for Firestore:', warehousesForFirestore);

            // Save to user's document
            const userDocRef = doc(db, 'users', userId);
            await setDoc(userDocRef, {
                warehouses: warehousesForFirestore,
                nextId: data.nextId || 1,
                lastUpdated: new Date().toISOString()
            });

            console.log('✅ Warehouses saved to Firestore successfully!');
            return { success: true };
        } catch (error) {
            console.error('❌ Save warehouses error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            return { success: false, error: error.message };
        }
    },

    // Load all warehouses for current user
    loadWarehouses: async function() {
        console.log('🔵 loadWarehouses called');
        try {
            if (!currentUser) {
                console.error('❌ No user logged in!');
                return { success: false, error: 'No user logged in', data: '[]' };
            }

            console.log('✅ User logged in:', currentUser.email);
            const userId = currentUser.uid;
            console.log('🔑 User ID:', userId);
            const userDocRef = doc(db, 'users', userId);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('✅ Data from Firestore:', data);
                
                // Convert JSON strings back to arrays
                const warehouses = (data.warehouses || []).map(warehouse => ({
                    ...warehouse,
                    Grid: JSON.parse(warehouse.Grid || '[]'),
                    Corridors: JSON.parse(warehouse.Corridors || '[]'),
                    Taken: JSON.parse(warehouse.Taken || '[]'),
                    TakenDates: JSON.parse(warehouse.TakenDates || '[]')
                }));

                console.log('✅ Converted warehouses:', warehouses);
                
                // Return in the same format as saved (with nextId)
                const result = {
                    warehouses: warehouses,
                    nextId: data.nextId || 1
                };
                
                return { success: true, data: JSON.stringify(result) };
            } else {
                console.log('ℹ️ No warehouses found in Firestore, returning empty array');
                return { success: true, data: '[]' };
            }
        } catch (error) {
            console.error('❌ Load warehouses error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            return { success: false, error: error.message, data: '[]' };
        }
    },

    // Delete all data for current user
    deleteAllData: async function() {
        try {
            if (!currentUser) {
                return { success: false, error: 'No user logged in' };
            }

            const userId = currentUser.uid;
            const userDocRef = doc(db, 'users', userId);
            await deleteDoc(userDocRef);

            console.log('All data deleted from Firestore');
            return { success: true };
        } catch (error) {
            console.error('Delete data error:', error);
            return { success: false, error: error.message };
        }
    }
};

// For backwards compatibility - keep hashPassword function
window.hashPassword = async function(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

console.log('Firebase services loaded successfully');
