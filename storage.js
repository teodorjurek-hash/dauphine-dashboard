/* ===========================================================
   storage.js — Sauvegarde des données : Firestore (en ligne, par
   compte) + copie locale dans localStorage (lecture instantanée,
   et repli si pas de réseau) + export/import JSON.
   =========================================================== */

const Storage = window.Storage || {};

Storage.CLE = "dauphineDashboardData";

// Charge les données de l'utilisateur connecté (uid Firebase).
// Retourne une Promise<state>.
Storage.charger = async function (uid) {
  try {
    const doc = await db.collection("utilisateurs").doc(uid).get();
    if (doc.exists && doc.data().json) {
      const state = Object.assign(App.defaultState(), JSON.parse(doc.data().json));
      localStorage.setItem(Storage.CLE, JSON.stringify(state));
      return state;
    }
  } catch (e) {
    console.error("Lecture en ligne impossible, on utilise la copie locale si elle existe.", e);
  }
  // Repli hors-ligne : copie locale la plus récente, sinon données par défaut
  try {
    const brut = localStorage.getItem(Storage.CLE);
    if (brut) return Object.assign(App.defaultState(), JSON.parse(brut));
  } catch (e) {
    console.error("Copie locale illisible.", e);
  }
  return App.defaultState();
};

// Sauvegarde : copie locale immédiate + envoi en ligne (non bloquant).
Storage.sauvegarder = function (state, uid) {
  localStorage.setItem(Storage.CLE, JSON.stringify(state));
  if (!uid) return;
  db.collection("utilisateurs").doc(uid).set({
    json: JSON.stringify(state),
    misAJour: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function (e) {
    console.error("Sauvegarde en ligne impossible (restera en local jusqu'à la prochaine tentative).", e);
  });
};

Storage.exporterJSON = function (state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = "dauphine-dashboard-" + date + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// callback(nouvelEtat) est appelé une fois le fichier lu avec succès
Storage.importerJSON = function (fichier, callback, onErreur) {
  const lecteur = new FileReader();
  lecteur.onload = function () {
    try {
      const data = JSON.parse(lecteur.result);
      const state = Object.assign(App.defaultState(), data);
      callback(state);
    } catch (e) {
      onErreur && onErreur(e);
    }
  };
  lecteur.onerror = function (e) {
    onErreur && onErreur(e);
  };
  lecteur.readAsText(fichier);
};

window.Storage = Storage;
