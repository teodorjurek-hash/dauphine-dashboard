/* ===========================================================
   journal.js — Logique de la page 5 (Journal de bord hebdomadaire)
   =========================================================== */

(async function () {
  const utilisateur = await Auth.exiger();
  const state = await Storage.charger(utilisateur.uid);
  Nav.init(state, utilisateur);

  function sauvegarderEtRendre() {
    Storage.sauvegarder(state, utilisateur.uid);
    rendre();
  }

  function echapper(texte) {
    const div = document.createElement("div");
    div.textContent = texte || "";
    return div.innerHTML;
  }

  function dessinerListe() {
    const conteneur = document.getElementById("liste-journal");
    const liste = state.journalHebdo.slice().sort(function (a, b) { return b.semaineDebut.localeCompare(a.semaineDebut); });

    if (liste.length === 0) {
      conteneur.innerHTML = '<div class="vide">Aucune entrée pour le moment. Commence par celle de cette semaine.</div>';
      return;
    }

    conteneur.innerHTML = liste.map(function (entree) {
      return (
        '<div class="bento-carte" style="margin-bottom:12px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
        "<strong>Semaine du " + Util.formatDate(entree.semaineDebut) + "</strong>" +
        '<button class="bouton bouton-discret bouton-petit" data-supprimer="' + entree.id + '">✕</button>' +
        "</div>" +
        (entree.travaille ? '<p class="carte-sous"><strong>Travaillé :</strong> ' + echapper(entree.travaille) + "</p>" : "") +
        (entree.aMarche ? '<p class="carte-sous"><strong>A marché :</strong> ' + echapper(entree.aMarche) + "</p>" : "") +
        (entree.coince ? '<p class="carte-sous"><strong>Coince :</strong> ' + echapper(entree.coince) + "</p>" : "") +
        (entree.objectifSuivant ? '<p class="carte-sous"><strong>Objectif suivant :</strong> ' + echapper(entree.objectifSuivant) + "</p>" : "") +
        "</div>"
      );
    }).join("");

    conteneur.querySelectorAll("[data-supprimer]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!confirm("Supprimer cette entrée du journal ?")) return;
        state.journalHebdo = state.journalHebdo.filter(function (e) { return e.id !== b.dataset.supprimer; });
        sauvegarderEtRendre();
      });
    });
  }

  document.getElementById("formulaire-journal").addEventListener("submit", function (e) {
    e.preventDefault();
    state.journalHebdo.push({
      id: Util.uid("j"),
      semaineDebut: document.getElementById("j-semaine").value,
      travaille: document.getElementById("j-travaille").value,
      aMarche: document.getElementById("j-marche").value,
      coince: document.getElementById("j-coince").value,
      objectifSuivant: document.getElementById("j-objectif").value
    });
    e.target.reset();
    document.getElementById("j-semaine").value = new Date().toISOString().slice(0, 10);
    sauvegarderEtRendre();
  });

  function rendre() { dessinerListe(); }

  document.getElementById("j-semaine").value = new Date().toISOString().slice(0, 10);
  rendre();
})();
