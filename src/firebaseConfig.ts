// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth"; // If using auth
// Optional: Import Analytics if you plan to use it
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration from your project settings
const firebaseConfig = {
  apiKey: "AIzaSyAm4DC3NXdfeFHE5ygdhDnss2CnH5U0f08",
  authDomain: "eventease-d4fc1.firebaseapp.com",
  projectId: "eventease-d4fc1",
  storageBucket: "eventease-d4fc1.appspot.com", // Adjusted based on standard naming convention
  messagingSenderId: "915822003807",
  appId: "1:915822003807:web:0eaafadf671c3d6dce3dea",
  measurementId: "G-8F770J9XWD" // Added measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional)
// const analytics = getAnalytics(app);

// Get Firebase services
const db = getFirestore(app);
const functions = getFunctions(app); // Optional: specify region if needed e.g., getFunctions(app, 'europe-west1')
const auth = getAuth(app); // If using auth

// --- Export callable functions (makes calling cleaner) ---
const callAcceptQuote = httpsCallable(functions, 'acceptQuote');
const callDeclineQuote = httpsCallable(functions, 'declineQuote');
// Add other callable function exports here as needed (e.g., createInquiry, sendQuote)
// const callCreateInquiry = httpsCallable(functions, 'createInquiry');
// const callSendQuote = httpsCallable(functions, 'sendQuote');


export {
    db,
    auth,
    functions,
    callAcceptQuote,
    callDeclineQuote,
    // Export other functions as needed
    // callCreateInquiry,
    // callSendQuote
    // analytics // Export analytics if initialized and needed
}; 