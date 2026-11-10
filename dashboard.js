/* ===========================================================
   dashboard.js — Logique de la page 1 (Tableau de bord)
   =========================================================== */

(async function () {
  const utilisateur = await Auth.exiger();
  const state = await Storage.charger(utilisateur.uid);
  Nav.init(state, utilisateur);

  let periode = state.trimestreActuel; // "T1" | "T2" | "T3" | "ANNEE"

  function libellePeriode(p) {
    return p === "ANNEE" ? "Année" : p.replace("T", "Trimestre ");
  }

  function dessinerSelecteurPeriode() {
    const conteneur = document.getElementById("selecteur-periode");
    const options = ["T1", "T2", "T3", "ANNEE"];
    conteneur.innerHTML = options.map(function (p) {
      const actif = p === periode ? " bouton-primaire" : "";
      return '<button class="bouton bouton-petit' + actif + '" data-periode="' + p + '">' + libellePeriode(p) + "</button>";
    }).join("");
    conteneur.querySelectorAll("button").forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        periode = bouton.dataset.periode;
        rendre();
      });
    });
  }

  function dessinerMoyenneGenerale() {
    const moy = Calc.moyenneGenerale(state.notes, state.matieres, state.coefMatieres, periode);
    const objectif = state.objectifGeneral;
    const pourcentage = moy !== null ? Math.min(100, (moy / 20) * 100) : 0;
    const couleur = Calc.statutCouleur(moy, objectif);

    document.getElementById("moy-generale-valeur").textContent = Calc.formatNombre(moy) + " / 20";
    const barre = document.getElementById("moy-generale-barre");
    barre.style.width = pourcentage + "%";
    barre.className = "jauge-remplissage remplissage-" + couleur;

    document.getElementById("moy-generale-objectif-texte").textContent = "Objectif : " + Calc.formatNombre(objectif);
    const ecarte = moy !== null ? Calc.round2(objectif - moy) : null;
    document.getElementById("moy-generale-ecart-texte").textContent =
      ecarte === null ? "" : (ecarte <= 0 ? "Objectif atteint 🎉" : "Il manque " + Calc.formatNombre(ecarte) + " pt");

    // Vs moyenne de classe (pour l'instant seule la moyenne générale de classe T1 est saisie)
    const classeCle = periode === "ANNEE" ? "T1" : periode; // repli simple si T2/T3 non saisis
    const moyClasse = state.moyenneGeneraleClasse[classeCle];
    const ecartClasse = moy !== null && moyClasse !== null && moyClasse !== undefined ? Calc.round2(moy - moyClasse) : null;
    document.getElementById("moy-classe-ecart").textContent = ecartClasse === null ? "—" : (ecartClasse >= 0 ? "+" : "") + Calc.formatNombre(ecartClasse);
    document.getElementById("moy-classe-texte").textContent = moyClasse !== null && moyClasse !== undefined
      ? "Classe : " + Calc.formatNombre(moyClasse) + " / 20"
      : "Moyenne de classe non saisie";
  }

  function dessinerEcheance() {
    const prochaine = Util.prochaineEcheance(state.echeances);
    document.getElementById("echeance-compte-a-rebours").textContent = prochaine ? Util.compteARebours(prochaine.date) : "—";
    document.getElementById("echeance-texte").textContent = prochaine ? prochaine.titre : "Aucune date confirmée pour l'instant";
  }

  function dessinerMatieres() {
    const grille = document.getElementById("grille-matieres");
    const cartes = state.matieres.map(function (matiere) {
      const moy = Calc.moyenneMatiere(state.notes, matiere, periode);
      const objectif = state.objectifs[matiere];
      const classeCle = periode === "ANNEE" ? "T1" : periode;
      const moyClasse = state.moyennesClasse[matiere] ? state.moyennesClasse[matiere][classeCle] : null;
      const couleur = Calc.statutCouleur(moy, objectif);
      const pourcentage = moy !== null ? Math.min(100, (moy / 20) * 100) : 0;
      const ecart = moy !== null ? Calc.round2(objectif - moy) : null;

      return (
        '<div class="bento-carte">' +
        '<div class="carte-label">' + matiere + "</div>" +
        '<div class="carte-valeur">' + Calc.formatNombre(moy) + "</div>" +
        '<div class="jauge-barre">' +
        '<div class="jauge-remplissage remplissage-' + couleur + '" style="width:' + pourcentage + '%"></div>' +
        (moyClasse ? '<div class="jauge-repere" style="left:' + Math.min(100, (moyClasse / 20) * 100) + '%"></div>' : "") +
        "</div>" +
        '<div class="jauge-legende"><span>Obj. ' + Calc.formatNombre(objectif) + '</span><span>Classe ' + Calc.formatNombre(moyClasse) + "</span></div>" +
        (ecart !== null
          ? '<span class="badge badge-' + couleur + '">' + (ecart <= 0 ? "Objectif atteint" : "−" + Calc.formatNombre(ecart) + " pt") + "</span>"
          : '<span class="badge badge-neutre">Pas encore de note</span>') +
        "</div>"
      );
    }).join("");
    grille.innerHTML = cartes;
  }

  function dessinerGains() {
    const carte = document.getElementById("carte-gains");
    const classement = Calc.classementGains(state, periode).filter(function (r) { return r.ecart > 0; });

    if (classement.length === 0) {
      carte.innerHTML = '<div class="vide">Tous les objectifs atteints pour cette période, ou aucune note enregistrée.</div>';
      return;
    }

    carte.innerHTML = '<ul class="liste-simple">' + classement.map(function (r, i) {
      return (
        "<li>" +
        '<strong>' + (i + 1) + ". " + r.matiere + "</strong> — " +
        "actuellement " + Calc.formatNombre(r.moyenne) + ", objectif " + Calc.formatNombre(r.objectif) +
        '<br><span class="carte-sous">Écart : ' + Calc.formatNombre(r.ecart) + " pt · Gain sur la générale si atteint : " +
        (r.gainGenerale !== null ? "+" + Calc.formatNombre(r.gainGenerale) : "—") + "</span>" +
        "</li>"
      );
    }).join("") + "</ul>";
  }

  function dessinerCoherence() {
    const verif = Calc.verifierCoherenceObjectifs(state);
    const bloc = document.getElementById("avertissement-coherence");
    if (!verif.coherent) {
      bloc.hidden = false;
      bloc.textContent = "Tes objectifs par matière donnent une moyenne générale implicite de " +
        Calc.formatNombre(verif.objectifImplicite) + ", alors que ton objectif général est " +
        Calc.formatNombre(state.objectifGeneral) + ". Ajuste l'un des deux dans la page Notes.";
    } else {
      bloc.hidden = true;
    }
  }

  function rendre() {
    dessinerSelecteurPeriode();
    dessinerMoyenneGenerale();
    dessinerEcheance();
    dessinerMatieres();
    dessinerGains();
    dessinerCoherence();
  }

  rendre();
})();
