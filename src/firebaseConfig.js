// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Remplacez ces valeurs par celles de votre configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAdIom0qlw9C5B3BfLJ2-uhBEX_KMxYqAs",
    authDomain: "wecanscape.sii-lemans.fr",
    projectId: "wekanscape",
    storageBucket: "gs://wekanscape.appspot.com",
    messagingSenderId: "803651484787",
    appId: "1:803651484787:web:736c6d72fac9994ae77e06",
    measurementId: "G-M8SG90GSJ1"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);