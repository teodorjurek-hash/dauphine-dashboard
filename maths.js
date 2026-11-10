/* ===========================================================
   maths.js — Logique de la page 4 (Maths : lacunes et entraînement)
   =========================================================== */

(async function () {
  const utilisateur = await Auth.exiger();
  const state = await Storage.charger(utilisateur.uid);
  Nav.init(state, utilisateur);

  function sauvegarderEtRendre() {
    Storage.sauvegarder(state, utilisateur.uid);
    rendre();
  }

  const COULEUR_LACUNE = { "à revoir": "rouge", "en cours": "orange", "maîtrisé": "vert" };

  function dessinerLacunes() {
    const grille = document.getElementById("grille-lacunes");
    grille.innerHTML = state.maths.lacunes.map(function (l) {
      return (
        '<div class="bento-carte">' +
        '<div class="carte-label">' + l.nom + "</div>" +
        '<select data-lacune="' + l.id + '" class="champ" style="margin-top:6px; width:100%; padding:8px; border-radius:10px; border:1px solid var(--bordure); background:var(--surface); color:var(--texte);">' +
        ["à revoir", "en cours", "maîtrisé"].map(function (s) {
          return '<option value="' + s + '"' + (s === l.statut ? " selected" : "") + ">" + s + "</option>";
        }).join("") +
        "</select>" +
        '<span class="badge badge-' + COULEUR_LACUNE[l.statut] + '" style="margin-top:8px;">' + l.statut + "</span>" +
        '<button class="bouton bouton-discret bouton-petit" data-supprimer-lacune="' + l.id + '" style="float:right;">✕</button>' +
        "</div>"
      );
    }).join("");

    grille.querySelectorAll("[data-lacune]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        const lacune = state.maths.lacunes.find(function (l) { return l.id === sel.dataset.lacune; });
        lacune.statut = sel.value;
        sauvegarderEtRendre();
      });
    });
    grille.querySelectorAll("[data-supprimer-lacune]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.maths.lacunes = state.maths.lacunes.filter(function (l) { return l.id !== b.dataset.supprimerLacune; });
        sauvegarderEtRendre();
      });
    });
  }

  function dessinerChapitres() {
    const grille = document.getElementById("grille-chapitres");
    grille.innerHTML = state.maths.chapitres.map(function (c) {
      return (
        '<div class="bento-carte">' +
        '<div class="carte-label">' + c.nom + "</div>" +
        '<div class="groupe-boutons" style="margin:6px 0;">' +
        [1, 2, 3, 4, 5].map(function (n) {
          const actif = n <= c.niveau ? " bouton-primaire" : "";
          return '<button class="bouton bouton-petit' + actif + '" data-niveau="' + c.id + '" data-valeur="' + n + '" style="padding:6px 10px;">' + n + "</button>";
        }).join("") +
        "</div>" +
        '<label class="carte-sous">Dernière révision</label>' +
        '<input type="date" data-revision="' + c.id + '" value="' + (c.derniereRevision || "") + '" style="width:100%; padding:8px; border-radius:10px; border:1px solid var(--bordure); background:var(--surface); color:var(--texte);">' +
        '<button class="bouton bouton-discret bouton-petit" data-supprimer-chapitre="' + c.id + '" style="margin-top:6px;">Supprimer</button>' +
        "</div>"
      );
    }).join("");

    grille.querySelectorAll("[data-niveau]").forEach(function (b) {
      b.addEventListener("click", function () {
        const chapitre = state.maths.chapitres.find(function (c) { return c.id === b.dataset.niveau; });
        chapitre.niveau = parseInt(b.dataset.valeur, 10);
        sauvegarderEtRendre();
      });
    });
    grille.querySelectorAll("[data-revision]").forEach(function (input) {
      input.addEventListener("change", function () {
        const chapitre = state.maths.chapitres.find(function (c) { return c.id === input.dataset.revision; });
        chapitre.derniereRevision = input.value || null;
        sauvegarderEtRendre();
      });
    });
    grille.querySelectorAll("[data-supprimer-chapitre]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.maths.chapitres = state.maths.chapitres.filter(function (c) { return c.id !== b.dataset.supprimerChapitre; });
        sauvegarderEtRendre();
      });
    });
  }

  function remplirSelectChapitres() {
    const select = document.getElementById("exo-chapitre");
    select.innerHTML = state.maths.chapitres.map(function (c) { return '<option value="' + c.nom + '">' + c.nom + "</option>"; }).join("");
  }

  function dessinerTableExercices() {
    const corps = document.getElementById("corps-table-exercices");
    const liste = state.maths.journalExercices.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    if (liste.length === 0) {
      corps.innerHTML = '<tr><td colspan="7" class="vide">Aucun exercice enregistré pour le moment.</td></tr>';
      return;
    }
    corps.innerHTML = liste.map(function (ex) {
      return (
        "<tr><td>" + ex.date + "</td><td>" + ex.chapitre + "</td><td>" + ex.nombreExos + "</td><td>" + ex.difficulte + "/5</td><td>" +
        (ex.reussiSeul ? "Seul" : "Avec correction") + "</td><td>" + ex.tempsMinutes + " min</td>" +
        '<td><button class="bouton bouton-discret bouton-petit" data-supprimer-exo="' + ex.id + '">✕</button></td></tr>'
      );
    }).join("");
    corps.querySelectorAll("[data-supprimer-exo]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.maths.journalExercices = state.maths.journalExercices.filter(function (ex) { return ex.id !== b.dataset.supprimerExo; });
        sauvegarderEtRendre();
      });
    });
  }

  // Numéro de semaine ISO simplifié : on regroupe par lundi de la semaine
  function lundiDeLaSemaine(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const jour = (d.getDay() + 6) % 7; // lundi = 0
    d.setDate(d.getDate() - jour);
    return d.toISOString().slice(0, 10);
  }

  function dessinerGraphiqueSemaines() {
    const conteneur = document.getElementById("graphique-semaines");
    const semaines = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      semaines.push(lundiDeLaSemaine(d.toISOString().slice(0, 10)));
    }
    const semainesUniques = Array.from(new Set(semaines));
    const totaux = semainesUniques.map(function (lundi) {
      return state.maths.journalExercices
        .filter(function (ex) { return lundiDeLaSemaine(ex.date) === lundi; })
        .reduce(function (s, ex) { return s + ex.nombreExos; }, 0);
    });
    const max = Math.max(1, Math.max.apply(null, totaux));

    if (state.maths.journalExercices.length === 0) {
      conteneur.innerHTML = '<div class="vide">Ajoute des entrées au journal pour voir apparaître le graphique.</div>';
      return;
    }

    conteneur.innerHTML = semainesUniques.map(function (lundi, i) {
      const hauteur = Math.round((totaux[i] / max) * 80) + 4;
      return (
        '<div style="display:inline-flex; flex-direction:column; align-items:center; width:' + (100 / semainesUniques.length) + '%; vertical-align:bottom;">' +
        '<div style="height:84px; display:flex; align-items:flex-end;">' +
        '<div style="width:60%; height:' + hauteur + 'px; background:var(--accent); border-radius:6px 6px 0 0;"></div>' +
        "</div>" +
        '<div class="carte-sous" style="font-size:11px;">' + totaux[i] + "</div>" +
        '<div class="carte-sous" style="font-size:10px;">' + lundi.slice(5) + "</div>" +
        "</div>"
      );
    }).join("");
  }

  function dessinerCorrelationNotes() {
    const conteneur = document.getElementById("correlation-notes");
    const notesMaths = state.notes
      .filter(function (n) { return n.matiere === "Mathématiques" && n.type === "note"; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); });

    if (notesMaths.length === 0) {
      conteneur.innerHTML = '<div class="vide">Pas encore de note de maths à comparer.</div>';
      return;
    }

    conteneur.innerHTML = '<ul class="liste-simple">' + notesMaths.map(function (n) {
      const quatorzeJoursAvant = new Date(n.date);
      quatorzeJoursAvant.setDate(quatorzeJoursAvant.getDate() - 14);
      const exosAvant = state.maths.journalExercices.filter(function (ex) {
        return ex.date >= quatorzeJoursAvant.toISOString().slice(0, 10) && ex.date <= n.date;
      }).reduce(function (s, ex) { return s + ex.nombreExos; }, 0);
      return (
        "<li>" + n.date + " — note : <strong>" + Calc.formatNombre(Calc.noteSur20(n.note, n.bareme)) + "/20</strong>" +
        '<br><span class="carte-sous">' + exosAvant + " exercices faits dans les 14 jours précédents</span></li>"
      );
    }).join("") + "</ul>";
  }

  document.getElementById("formulaire-lacune").addEventListener("submit", function (e) {
    e.preventDefault();
    const champ = document.getElementById("lacune-nom");
    state.maths.lacunes.push({ id: Util.uid("l"), nom: champ.value, statut: "à revoir" });
    champ.value = "";
    sauvegarderEtRendre();
  });

  document.getElementById("formulaire-chapitre").addEventListener("submit", function (e) {
    e.preventDefault();
    const champ = document.getElementById("chapitre-nom");
    state.maths.chapitres.push({ id: Util.uid("c"), nom: champ.value, niveau: 1, derniereRevision: null });
    champ.value = "";
    sauvegarderEtRendre();
  });

  document.getElementById("formulaire-exercice").addEventListener("submit", function (e) {
    e.preventDefault();
    state.maths.journalExercices.push({
      id: Util.uid("ex"),
      date: document.getElementById("exo-date").value,
      chapitre: document.getElementById("exo-chapitre").value,
      nombreExos: parseInt(document.getElementById("exo-nombre").value, 10) || 1,
      difficulte: parseInt(document.getElementById("exo-difficulte").value, 10) || 3,
      reussiSeul: document.getElementById("exo-reussi").value === "seul",
      tempsMinutes: parseInt(document.getElementById("exo-temps").value, 10) || 0
    });
    e.target.reset();
    document.getElementById("exo-date").value = new Date().toISOString().slice(0, 10);
    document.getElementById("exo-nombre").value = 5;
    document.getElementById("exo-difficulte").value = 3;
    document.getElementById("exo-temps").value = 30;
    sauvegarderEtRendre();
  });

  function rendre() {
    dessinerLacunes();
    dessinerChapitres();
    remplirSelectChapitres();
    dessinerTableExercices();
    dessinerGraphiqueSemaines();
    dessinerCorrelationNotes();
  }

  document.getElementById("exo-date").value = new Date().toISOString().slice(0, 10);
  rendre();
})();
