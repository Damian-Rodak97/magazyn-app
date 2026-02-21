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
            const warehouses = JSON.parse(warehousesJson);
            console.log('📦 Warehouses to save:', warehouses);
            const userId = currentUser.uid;
            console.log('🔑 User ID:', userId);

            // Save to user's document
            const userDocRef = doc(db, 'users', userId);
            await setDoc(userDocRef, {
                warehouses: warehouses,
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
                console.log('✅ Warehouses loaded from Firestore:', data.warehouses);
                return { success: true, data: JSON.stringify(data.warehouses || []) };
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

// ============================================
// File Download/Upload Functions for Backup/Restore
// ============================================

window.downloadFile = function(fileName, contentOrBase64String) {
    try {
        let blob;
        
        // Check if it's JSON (starts with { or [) or base64 PDF
        if (typeof contentOrBase64String === 'string' && 
            (contentOrBase64String.trim().startsWith('{') || contentOrBase64String.trim().startsWith('['))) {
            // JSON content - download as text file
            blob = new Blob([contentOrBase64String], { type: 'application/json' });
        } else {
            // Base64 PDF content
            const byteCharacters = atob(contentOrBase64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: 'application/pdf' });
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('File downloaded:', fileName);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Błąd podczas pobierania pliku: ' + error.message);
    }
};

// Setup file import functionality
let dotNetReference = null;

window.setupFileImport = function(dotNetHelper) {
    dotNetReference = dotNetHelper;
    
    // Create hidden file input if it doesn't exist
    if (!document.getElementById('backupFileInput')) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'backupFileInput';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    await dotNetReference.invokeMethodAsync('HandleFileContent', text);
                } catch (error) {
                    console.error('Error reading file:', error);
                    alert('Błąd podczas odczytu pliku: ' + error.message);
                }
            }
            // Reset value so the same file can be selected again
            fileInput.value = '';
        });
    }
};

window.triggerFileInput = function() {
    const fileInput = document.getElementById('backupFileInput');
    if (fileInput) {
        fileInput.click();
    }
};

console.log('Firebase services loaded successfully');
