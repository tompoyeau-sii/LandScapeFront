// functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Fonction déclenchée lors de la création d'un utilisateur
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const userRecord = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        providerData: user.providerData,
        createdAt: new Date()
    };

    // Ajouter les informations de l'utilisateur dans Firestore
    await admin.firestore().collection('users').doc(user.uid).set(userRecord);
});

// Fonction déclenchée lors de la suppression d'un utilisateur
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
    await admin.firestore().collection('users').doc(user.uid).delete();
});
