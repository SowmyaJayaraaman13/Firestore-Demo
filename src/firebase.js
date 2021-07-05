import firebase from "firebase";

const firebaseApp = firebase.initializeApp({                              // firebase initialization
    apiKey: "AIzaSyB6CRYntOOBCwCoxY9fmAjRTD19lDzezes",
    authDomain: "spike2-firestore-f7e94.firebaseapp.com",
    projectId: "spike2-firestore-f7e94",
    storageBucket: "spike2-firestore-f7e94.appspot.com",
    messagingSenderId: "463235598683",
    appId: "1:463235598683:web:80909fa037d2176483727e",
    measurementId: "G-LZXYMH0GQ1"
});

const db = firebaseApp.firestore();                            // creating an instance or the firestore

export default db ;