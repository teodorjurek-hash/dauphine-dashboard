/* ===========================================================
   admission.js — Logique de la page 6 (Admission Dauphine)
   Règle stricte : jamais de pourcentage de chances calculé ici.
   =========================================================== */

(async function () {
  const utilisateur = await Auth.exiger();
  const state = await Storage.charger(utilisateur.uid);
  Nav.init(state, utilisateur);

  function sauvegarderEtRendre() {
    Storage.sauvegarder(state, utilisateur.uid);
    rendre();
  }

  function dessinerLiens() {
    const conteneur = document.getElementById("liste-liens");
    conteneur.innerHTML = '<ul class="liste-simple">' + state.admission.liens.map(function (l) {
      return (
        "<li><a href=\"" + l.url + "\" target=\"_blank\" rel=\"noopener\"><strong>" + l.titre + "</strong></a>" +
        (l.note ? '<br><span class="carte-sous">' + l.note + "</span>" : "") +
        "</li>"
      );
    }).join("") + "</ul>";
  }

  function dessinerReleves() {
    const corps = document.getElementById("corps-table-releves");
    const liste = state.admission.releves.slice().sort(function (a, b) { return b.annee - a.annee; });
    if (liste.length === 0) {
      corps.innerHTML = '<tr><td colspan="7" class="vide">Aucun relevé pour le moment.</td></tr>';
      return;
    }
    corps.innerHTML = liste.map(function (r) {
      return (
        "<tr><td>" + r.annee + "</td><td>" + r.formation + "</td><td>" + (r.places || "à vérifier") + "</td><td>" +
        (r.taux || "à vérifier") + "</td><td>" + (r.profil || "—") + "</td><td>" + (r.notes || "") + "</td>" +
        '<td><button class="bouton bouton-discret bouton-petit" data-supprimer="' + r.id + '">✕</button></td></tr>'
      );
    }).join("");
    corps.querySelectorAll("[data-supprimer]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.admission.releves = state.admission.releves.filter(function (r) { return r.id !== b.dataset.supprimer; });
        sauvegarderEtRendre();
      });
    });
  }

  document.getElementById("formulaire-releve").addEventListener("submit", function (e) {
    e.preventDefault();
    state.admission.releves.push({
      id: Util.uid("rel"),
      annee: parseInt(document.getElementById("rel-annee").value, 10),
      formation: document.getElementById("rel-formation").value,
      places: document.getElementById("rel-places").value,
      taux: document.getElementById("rel-taux").value,
      profil: document.getElementById("rel-profil").value,
      notes: document.getElementById("rel-notes").value
    });
    e.target.reset();
    sauvegarderEtRendre();
  });

  function rendre() {
    dessinerLiens();
    dessinerReleves();
  }
  rendre();
})();
