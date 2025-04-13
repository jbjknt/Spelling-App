import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDg1e-iiEpMGgDRMyarD7-nVrllV17C4uk",
    authDomain: "spell4kids-dc55c.firebaseapp.com",
    projectId: "spell4kids-dc55c",
    storageBucket: "spell4kids-dc55c.firebasestorage.app",
    messagingSenderId: "839908256660",
    appId: "1:839908256660:web:f9276c3c4c95ebac33bd81",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);