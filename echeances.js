/* ===========================================================
   echeances.js — Logique de la page 3 (Échéances)
   =========================================================== */

(async function () {
  const utilisateur = await Auth.exiger();
  const state = await Storage.charger(utilisateur.uid);
  Nav.init(state, utilisateur);

  function sauvegarderEtRendre() {
    Storage.sauvegarder(state, utilisateur.uid);
    rendre();
  }

  function dessinerListe() {
    const conteneur = document.getElementById("liste-echeances");
    const triees = state.echeances.slice().sort(function (a, b) {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });

    conteneur.innerHTML = triees.map(function (e) {
      const compteARebours = e.date ? Util.compteARebours(e.date) : null;
      const dateTexte = e.date ? Util.formatDate(e.date) : "Date à vérifier";
      const badge = e.statutDate === "confirmée"
        ? '<span class="badge badge-vert">Confirmée</span>'
        : '<span class="badge badge-orange">À vérifier</span>';

      return (
        '<div class="bento-carte" style="margin-bottom:12px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">' +
        "<div>" +
        "<strong>" + e.titre + "</strong>" +
        '<div class="carte-sous">' + dateTexte + "</div>" +
        (e.description ? '<div class="carte-sous">' + e.description + "</div>" : "") +
        "</div>" +
        '<div style="text-align:right;">' +
        badge +
        (compteARebours ? '<div class="carte-sous" style="margin-top:6px;">' + compteARebours + "</div>" : "") +
        "</div>" +
        "</div>" +
        '<div class="groupe-boutons">' +
        '<button class="bouton bouton-petit" data-modifier="' + e.id + '">Modifier la date</button>' +
        '<button class="bouton bouton-discret bouton-petit" data-supprimer="' + e.id + '">Supprimer</button>' +
        "</div>" +
        "</div>"
      );
    }).join("");

    conteneur.querySelectorAll("[data-modifier]").forEach(function (b) {
      b.addEventListener("click", function () {
        const echeance = state.echeances.find(function (e) { return e.id === b.dataset.modifier; });
        const saisie = prompt("Nouvelle date (AAAA-MM-JJ ou AAAA-MM-JJTHH:MM), vide pour effacer :", echeance.date || "");
        if (saisie === null) return;
        echeance.date = saisie.trim() === "" ? null : saisie.trim();
        echeance.statutDate = echeance.date ? (confirm("Cette date est-elle confirmée (officielle) ? Annuler = à vérifier") ? "confirmée" : "à vérifier") : "à vérifier";
        sauvegarderEtRendre();
      });
    });
    conteneur.querySelectorAll("[data-supprimer]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!confirm("Supprimer cette échéance ?")) return;
        state.echeances = state.echeances.filter(function (e) { return e.id !== b.dataset.supprimer; });
        sauvegarderEtRendre();
      });
    });
  }

  document.getElementById("formulaire-echeance").addEventListener("submit", function (e) {
    e.preventDefault();
    state.echeances.push({
      id: Util.uid("e"),
      titre: document.getElementById("ech-titre").value,
      date: document.getElementById("ech-date").value || null,
      statutDate: document.getElementById("ech-statut").value,
      description: document.getElementById("ech-description").value
    });
    e.target.reset();
    sauvegarderEtRendre();
  });

  function rendre() { dessinerListe(); }
  rendre();
})();
