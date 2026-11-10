/* ===========================================================
   auth.js — Garde d'authentification partagée.
   Sur toute page protégée, appeler Auth.exiger() avant de charger
   les données : résout avec l'utilisateur connecté, ou redirige
   vers login.html si personne n'est connecté.
   =========================================================== */

const Auth = window.Auth || {};

Auth.exiger = function () {
  return new Promise(function (resolve) {
    const arreter = auth.onAuthStateChanged(function (utilisateur) {
      arreter();
      if (utilisateur) {
        resolve(utilisateur);
      } else {
        window.location.href = "login.html";
      }
    });
  });
};

Auth.deconnecter = function () {
  auth.signOut().then(function () {
    window.location.href = "login.html";
  });
};

window.Auth = Auth;
