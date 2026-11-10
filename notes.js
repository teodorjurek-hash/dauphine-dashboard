/* ===========================================================
   notes.js — Logique de la page 2 (Notes et calculateur)
   =========================================================== */

(async function () {
  const utilisateur = await Auth.exiger();
  const state = await Storage.charger(utilisateur.uid);
  Nav.init(state, utilisateur);

  let periode = state.trimestreActuel;
  let filtreMatiere = "toutes";

  function sauvegarderEtRendre() {
    Storage.sauvegarder(state, utilisateur.uid);
    rendre();
  }

  function remplirSelectMatieres(select) {
    select.innerHTML = state.matieres.map(function (m) {
      return '<option value="' + m + '">' + m + "</option>";
    }).join("");
  }

  function dessinerSelecteurPeriode() {
    const conteneur = document.getElementById("selecteur-periode");
    const options = ["T1", "T2", "T3", "ANNEE"];
    conteneur.innerHTML = options.map(function (p) {
      const actif = p === periode ? " bouton-primaire" : "";
      const libelle = p === "ANNEE" ? "Année" : p.replace("T", "Trimestre ");
      return '<button class="bouton bouton-petit' + actif + '" data-periode="' + p + '">' + libelle + "</button>";
    }).join("");
    conteneur.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { periode = b.dataset.periode; rendre(); });
    });
  }

  function dessinerReglages() {
    const champObjectif = document.getElementById("champ-objectif-general");
    champObjectif.value = state.objectifGeneral;
    champObjectif.onchange = function () {
      state.objectifGeneral = parseFloat(champObjectif.value) || 0;
      sauvegarderEtRendre();
    };

    const cleClasse = periode === "ANNEE" ? "T1" : periode;
    const champClasse = document.getElementById("champ-moyenne-classe-generale");
    champClasse.value = state.moyenneGeneraleClasse[cleClasse] !== null && state.moyenneGeneraleClasse[cleClasse] !== undefined
      ? state.moyenneGeneraleClasse[cleClasse] : "";
    champClasse.disabled = periode === "ANNEE";
    champClasse.onchange = function () {
      state.moyenneGeneraleClasse[cleClasse] = champClasse.value === "" ? null : parseFloat(champClasse.value);
      sauvegarderEtRendre();
    };

    const verif = Calc.verifierCoherenceObjectifs(state);
    const bloc = document.getElementById("avertissement-coherence");
    if (!verif.coherent) {
      bloc.hidden = false;
      bloc.textContent = "Tes objectifs par matière donnent une moyenne générale implicite de " +
        Calc.formatNombre(verif.objectifImplicite) + ", différente de ton objectif général (" +
        Calc.formatNombre(state.objectifGeneral) + ").";
    } else {
      bloc.hidden = true;
    }
  }

  function dessinerTableMatieres() {
    const corps = document.getElementById("corps-table-matieres");
    const cleClasse = periode === "ANNEE" ? "T1" : periode;

    corps.innerHTML = state.matieres.map(function (matiere) {
      const moy = Calc.moyenneMatiere(state.notes, matiere, periode);
      const moyClasse = state.moyennesClasse[matiere] ? state.moyennesClasse[matiere][cleClasse] : null;
      return (
        "<tr>" +
        "<td>" + matiere + "</td>" +
        '<td><input type="number" step="0.1" value="' + state.coefMatieres[matiere] + '" data-coef-matiere="' + matiere + '" style="width:64px"></td>' +
        '<td><input type="number" step="0.1" value="' + state.objectifs[matiere] + '" data-objectif-matiere="' + matiere + '" style="width:64px"></td>' +
        '<td><input type="number" step="0.01" value="' + (moyClasse !== null && moyClasse !== undefined ? moyClasse : "") +
          '" data-classe-matiere="' + matiere + '" style="width:72px" ' + (periode === "ANNEE" ? "disabled" : "") + "></td>" +
        "<td>" + Calc.formatNombre(moy) + "</td>" +
        "</tr>"
      );
    }).join("");

    corps.querySelectorAll("[data-coef-matiere]").forEach(function (input) {
      input.addEventListener("change", function () {
        state.coefMatieres[input.dataset.coefMatiere] = parseFloat(input.value) || 0;
        sauvegarderEtRendre();
      });
    });
    corps.querySelectorAll("[data-objectif-matiere]").forEach(function (input) {
      input.addEventListener("change", function () {
        state.objectifs[input.dataset.objectifMatiere] = parseFloat(input.value) || 0;
        sauvegarderEtRendre();
      });
    });
    corps.querySelectorAll("[data-classe-matiere]").forEach(function (input) {
      input.addEventListener("change", function () {
        if (!state.moyennesClasse[input.dataset.classeMatiere]) {
          state.moyennesClasse[input.dataset.classeMatiere] = { T1: null, T2: null, T3: null };
        }
        state.moyennesClasse[input.dataset.classeMatiere][cleClasse] = input.value === "" ? null : parseFloat(input.value);
        sauvegarderEtRendre();
      });
    });
  }

  function dessinerFiltreHistorique() {
    const conteneur = document.getElementById("filtre-matiere-historique");
    const options = ["toutes"].concat(state.matieres);
    conteneur.innerHTML = options.map(function (m) {
      const actif = m === filtreMatiere ? " bouton-primaire" : "";
      return '<button class="bouton bouton-petit' + actif + '" data-filtre="' + m + '">' + (m === "toutes" ? "Toutes les matières" : m) + "</button>";
    }).join("");
    conteneur.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { filtreMatiere = b.dataset.filtre; dessinerTableNotes(); dessinerFiltreHistorique(); });
    });
  }

  function dessinerTableNotes() {
    const corps = document.getElementById("corps-table-notes");
    let liste = state.notes.slice();
    if (filtreMatiere !== "toutes") liste = liste.filter(function (n) { return n.matiere === filtreMatiere; });
    liste.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });

    if (liste.length === 0) {
      corps.innerHTML = '<tr><td colspan="9" class="vide">Aucune note pour le moment.</td></tr>';
      return;
    }

    corps.innerHTML = liste.map(function (n) {
      const sur20 = n.type === "note" ? Calc.formatNombre(Calc.noteSur20(n.note, n.bareme)) : "—";
      const valeurAffichee = n.type === "absence" ? "Absent" : n.note + "/" + n.bareme;
      const badgeStatut = n.statut === "compte"
        ? '<span class="badge badge-vert">Compte</span>'
        : '<span class="badge badge-orange">En attente</span>';
      return (
        "<tr>" +
        "<td>" + n.matiere + "</td>" +
        "<td>" + n.trimestre + "</td>" +
        "<td>" + valeurAffichee + "</td>" +
        "<td>" + sur20 + "</td>" +
        "<td>" + n.coef + "</td>" +
        "<td>" + (n.date || "—") + "</td>" +
        "<td>" + badgeStatut + "</td>" +
        "<td>" + (n.commentaire || "") + "</td>" +
        '<td><button class="bouton bouton-discret bouton-petit" data-supprimer="' + n.id + '">✕</button></td>' +
        "</tr>"
      );
    }).join("");

    corps.querySelectorAll("[data-supprimer]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.notes = state.notes.filter(function (n) { return n.id !== b.dataset.supprimer; });
        sauvegarderEtRendre();
      });
    });
  }

  function initFormulaireNote() {
    const form = document.getElementById("formulaire-note");
    remplirSelectMatieres(document.getElementById("note-matiere"));
    document.getElementById("note-trimestre").value = periode === "ANNEE" ? "T1" : periode;
    document.getElementById("note-date").value = new Date().toISOString().slice(0, 10);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const type = document.getElementById("note-type").value;
      const nouvelleNote = {
        id: Util.uid("n"),
        matiere: document.getElementById("note-matiere").value,
        trimestre: document.getElementById("note-trimestre").value,
        type: type,
        note: type === "absence" ? null : parseFloat(document.getElementById("note-valeur").value),
        bareme: parseFloat(document.getElementById("note-bareme").value) || 20,
        coef: parseFloat(document.getElementById("note-coef").value) || 1,
        date: document.getElementById("note-date").value,
        statut: document.getElementById("note-statut").value,
        commentaire: document.getElementById("note-commentaire").value
      };
      state.notes.push(nouvelleNote);
      form.reset();
      document.getElementById("note-bareme").value = 20;
      document.getElementById("note-coef").value = 1;
      document.getElementById("note-date").value = new Date().toISOString().slice(0, 10);
      sauvegarderEtRendre();
    });
  }

  function initCalculateur() {
    remplirSelectMatieres(document.getElementById("calc-matiere"));
    document.getElementById("calc-trimestre").value = periode === "ANNEE" ? "ANNEE" : periode;

    const champMatiere = document.getElementById("calc-matiere");
    const champObjectif = document.getElementById("calc-objectif");
    function maj() { champObjectif.value = state.objectifs[champMatiere.value]; }
    champMatiere.addEventListener("change", maj);
    maj();

    document.getElementById("bouton-calculer").addEventListener("click", function () {
      const matiere = champMatiere.value;
      const trimestreCalc = document.getElementById("calc-trimestre").value;
      const objectif = parseFloat(champObjectif.value);
      const coefProchain = parseFloat(document.getElementById("calc-coef").value) || 1;
      const resultat = Calc.calculNoteRequise(state.notes, matiere, trimestreCalc, objectif, coefProchain);
      const zone = document.getElementById("resultat-calcul");

      if (resultat.cas === "atteint") {
        zone.innerHTML = '<span class="badge badge-vert">Objectif déjà assuré</span> — même un 0 au prochain contrôle ne te fait pas repasser sous l\'objectif.';
      } else if (resultat.cas === "possible") {
        zone.innerHTML = "Il te faut au moins <strong>" + Calc.formatNombre(resultat.note) + " / 20</strong> à ce contrôle (coef " + coefProchain + ") pour atteindre " + Calc.formatNombre(objectif) + ".";
      } else {
        zone.innerHTML = resultat.nbControles
          ? "Impossible en un seul contrôle. Il faudrait au moins <strong>" + resultat.nbControles + " contrôles à 20/20</strong> (coef " + coefProchain + " chacun) pour atteindre cet objectif sur la période."
          : "Cet objectif semble difficilement atteignable sur cette période avec des contrôles de ce coefficient. Essaie un objectif plus réaliste, ou vise l'année complète.";
      }
    });
  }

  function initSimulateur() {
    remplirSelectMatieres(document.getElementById("sim-matiere"));
    document.getElementById("sim-trimestre").value = periode === "ANNEE" ? "T1" : periode;

    document.getElementById("bouton-simuler").addEventListener("click", function () {
      const matiere = document.getElementById("sim-matiere").value;
      const trimestreSim = document.getElementById("sim-trimestre").value;
      const note = parseFloat(document.getElementById("sim-note").value);
      const bareme = parseFloat(document.getElementById("sim-bareme").value) || 20;
      const coef = parseFloat(document.getElementById("sim-coef").value) || 1;
      const resultat = Calc.simulerNote(state, matiere, trimestreSim, note, bareme, coef);
      const zone = document.getElementById("resultat-simulation");
      zone.innerHTML = "Nouvelle moyenne en " + matiere + " : <strong>" + Calc.formatNombre(resultat.moyenneMatiere) +
        "</strong> · Nouvelle moyenne générale (" + trimestreSim + ") : <strong>" + Calc.formatNombre(resultat.moyenneGenerale) +
        "</strong> <span class=\"carte-sous\">(non enregistré)</span>";
    });
  }

  function initSauvegarde() {
    document.getElementById("bouton-exporter").addEventListener("click", function () {
      Storage.exporterJSON(state);
    });
    const champFichier = document.getElementById("champ-import-fichier");
    document.getElementById("bouton-importer").addEventListener("click", function () {
      champFichier.click();
    });
    champFichier.addEventListener("change", function () {
      if (!champFichier.files[0]) return;
      Storage.importerJSON(champFichier.files[0], function (nouvelEtat) {
        Storage.sauvegarder(nouvelEtat, utilisateur.uid);
        window.location.reload();
      }, function () {
        alert("Le fichier n'a pas pu être importé. Vérifie qu'il s'agit bien d'un export JSON de ce tableau de bord.");
      });
    });
  }

  function rendre() {
    dessinerSelecteurPeriode();
    dessinerReglages();
    dessinerTableMatieres();
    dessinerTableNotes();
  }

  dessinerFiltreHistorique();
  initFormulaireNote();
  initCalculateur();
  initSimulateur();
  initSauvegarde();
  rendre();
})();
