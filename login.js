/* ===========================================================
   login.js — Logique de la page de connexion
   =========================================================== */

(function () {
  const champEmail = document.getElementById("email");
  const champMotDePasse = document.getElementById("mot-de-passe");
  const zoneErreur = document.getElementById("message-erreur");

  // Déjà connecté ? On file directement au tableau de bord.
  auth.onAuthStateChanged(function (utilisateur) {
    if (utilisateur) window.location.href = "index.html";
  });

  function afficherErreur(erreur) {
    const messages = {
      "auth/invalid-email": "Adresse email invalide.",
      "auth/missing-password": "Entre un mot de passe.",
      "auth/weak-password": "Le mot de passe doit faire au moins 6 caractères.",
      "auth/email-already-in-use": "Un compte existe déjà avec cet email. Essaie « Se connecter ».",
      "auth/invalid-credential": "Email ou mot de passe incorrect.",
      "auth/wrong-password": "Email ou mot de passe incorrect.",
      "auth/user-not-found": "Aucun compte avec cet email. Essaie « Créer un compte »."
    };
    zoneErreur.hidden = false;
    zoneErreur.textContent = messages[erreur.code] || ("Erreur : " + erreur.message);
  }

  document.getElementById("bouton-connexion").addEventListener("click", function () {
    zoneErreur.hidden = true;
    auth.signInWithEmailAndPassword(champEmail.value, champMotDePasse.value)
      .then(function () { window.location.href = "index.html"; })
      .catch(afficherErreur);
  });

  document.getElementById("bouton-creation").addEventListener("click", function () {
    zoneErreur.hidden = true;
    auth.createUserWithEmailAndPassword(champEmail.value, champMotDePasse.value)
      .then(function () { window.location.href = "index.html"; })
      .catch(afficherErreur);
  });

  document.getElementById("bouton-oubli").addEventListener("click", function () {
    zoneErreur.hidden = true;
    if (!champEmail.value) {
      zoneErreur.hidden = false;
      zoneErreur.textContent = "Entre d'abord ton email ci-dessus, puis reclique ici.";
      return;
    }
    auth.sendPasswordResetEmail(champEmail.value)
      .then(function () {
        zoneErreur.hidden = false;
        zoneErreur.textContent = "Email de réinitialisation envoyé (vérifie aussi les spams).";
      })
      .catch(afficherErreur);
  });
})();
