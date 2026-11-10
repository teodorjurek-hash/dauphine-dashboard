/* ===========================================================
   firebase-config.js — Connexion à ton projet Firebase.
   Ces valeurs ne sont PAS secrètes : la sécurité réelle vient des
   règles Firestore (qui autorisent chacun à ne lire/écrire que ses
   propres données), pas du secret de ce fichier.
   Remplace les valeurs ci-dessous par celles de TON projet Firebase
   (Paramètres du projet > Tes applications > Config).
   =========================================================== */

const firebaseConfig = {
  apiKey: "COLLE_ICI_TA_CLE_API",
  authDomain: "COLLE_ICI.firebaseapp.com",
  projectId: "COLLE_ICI",
  storageBucket: "COLLE_ICI.appspot.com",
  messagingSenderId: "COLLE_ICI",
  appId: "COLLE_ICI"
};

firebase.initializeApp(firebaseConfig);

window.auth = firebase.auth();
window.db = firebase.firestore();
