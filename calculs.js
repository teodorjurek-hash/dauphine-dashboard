/* ===========================================================
   calculs.js — Fonctions de calcul pures (aucune lecture/écriture
   de localStorage ici, seulement des nombres en entrée/sortie).
   C'est le fichier qu'on peut tester isolément (voir tests.html).
   =========================================================== */

const Calc = window.Calc || {};

Calc.round2 = function (x) {
  if (x === null || x === undefined || Number.isNaN(x)) return null;
  return Math.round((x + Number.EPSILON) * 100) / 100;
};

/**
 * Convertit une note sur son barème en équivalent /20, arrondi à 2 décimales.
 * On arrondit ici (comme EcoleDirecte à l'affichage) avant de pondérer :
 * c'est ce qui fait correspondre nos moyennes à celles affichées par ED.
 */
Calc.noteSur20 = function (note, bareme) {
  return Calc.round2((note / bareme) * 20);
};

// Notes "comptantes" (statut compte, type note) d'une matière, pour un trimestre donné ou "ANNEE"
Calc.notesPourMatiere = function (notes, matiere, trimestre) {
  return notes.filter(function (n) {
    if (n.matiere !== matiere) return false;
    if (n.type !== "note") return false; // absences exclues
    if (n.statut !== "compte") return false; // "attente" exclu
    if (trimestre !== "ANNEE" && n.trimestre !== trimestre) return false;
    return true;
  });
};

/**
 * Moyenne d'une matière = Σ(noteSur20 × coef) / Σ(coef)
 * Retourne null si aucune note ne compte encore.
 */
Calc.moyenneMatiere = function (notes, matiere, trimestre) {
  const liste = Calc.notesPourMatiere(notes, matiere, trimestre);
  if (liste.length === 0) return null;
  let sommePoints = 0;
  let sommeCoefs = 0;
  liste.forEach(function (n) {
    sommePoints += Calc.noteSur20(n.note, n.bareme) * n.coef;
    sommeCoefs += n.coef;
  });
  if (sommeCoefs === 0) return null;
  return Calc.round2(sommePoints / sommeCoefs);
};

/**
 * Moyenne générale = moyenne des moyennes de matières ayant au moins
 * une note comptante, pondérée par le coefficient de chaque matière.
 */
Calc.moyenneGenerale = function (notes, matieres, coefMatieres, trimestre) {
  let sommePoints = 0;
  let sommeCoefs = 0;
  matieres.forEach(function (matiere) {
    const moy = Calc.moyenneMatiere(notes, matiere, trimestre);
    if (moy === null) return; // matière sans note : exclue
    const coef = coefMatieres[matiere] || 1;
    sommePoints += moy * coef;
    sommeCoefs += coef;
  });
  if (sommeCoefs === 0) return null;
  return Calc.round2(sommePoints / sommeCoefs);
};

/**
 * Calculateur "Quelle note me faut-il ?"
 * x = (objectif × (C + c) − S) / c
 * où S = Σ(noteSur20 × coef) et C = Σ coef, sur les notes déjà comptantes
 * de la matière/trimestre visé, et c le coefficient du prochain contrôle.
 *
 * Retour :
 *  - { cas: "atteint" }                         si l'objectif est déjà assuré (x ≤ 0)
 *  - { cas: "possible", note: x }                si 0 < x ≤ 20
 *  - { cas: "impossible", nbControles, note }     si x > 20 : il faut plusieurs contrôles
 */
Calc.calculNoteRequise = function (notes, matiere, trimestre, objectif, coefProchain) {
  const liste = Calc.notesPourMatiere(notes, matiere, trimestre);
  let S = 0;
  let C = 0;
  liste.forEach(function (n) {
    S += Calc.noteSur20(n.note, n.bareme) * n.coef;
    C += n.coef;
  });

  const x = (objectif * (C + coefProchain) - S) / coefProchain;

  if (x <= 0) {
    return { cas: "atteint" };
  }
  if (x <= 20) {
    return { cas: "possible", note: Calc.round2(x) };
  }

  // Impossible en un seul contrôle : on cherche combien de contrôles à 20/20
  // (même coefficient chacun) permettraient d'atteindre l'objectif.
  for (let n = 2; n <= 12; n++) {
    const xn = (objectif * (C + n * coefProchain) - S) / (n * coefProchain);
    if (xn <= 20) {
      return { cas: "impossible", nbControles: n, note: 20 };
    }
  }
  return { cas: "impossible", nbControles: null, note: 20 };
};

/**
 * Simulateur "Et si…" : ajoute une note hypothétique sans toucher aux données
 * réelles, et renvoie les nouvelles moyennes (matière + générale).
 */
Calc.simulerNote = function (state, matiere, trimestre, note, bareme, coef) {
  const noteHypo = {
    matiere: matiere,
    trimestre: trimestre,
    type: "note",
    statut: "compte",
    note: note,
    bareme: bareme,
    coef: coef
  };
  const notesSimulees = state.notes.concat([noteHypo]);
  return {
    moyenneMatiere: Calc.moyenneMatiere(notesSimulees, matiere, trimestre),
    moyenneGenerale: Calc.moyenneGenerale(notesSimulees, state.matieres, state.coefMatieres, trimestre)
  };
};

/**
 * Classement "Où gagner le plus de points" : pour chaque matière ayant une
 * moyenne, calcule le gain sur la générale si elle atteignait son objectif.
 */
Calc.classementGains = function (state, trimestre) {
  const generaleActuelle = Calc.moyenneGenerale(state.notes, state.matieres, state.coefMatieres, trimestre);
  const resultats = [];

  state.matieres.forEach(function (matiere) {
    const moy = Calc.moyenneMatiere(state.notes, matiere, trimestre);
    const objectif = state.objectifs[matiere];
    if (moy === null) return;

    // Générale si cette matière atteignait exactement son objectif, autres inchangées
    let sommePoints = 0;
    let sommeCoefs = 0;
    state.matieres.forEach(function (m) {
      const coef = state.coefMatieres[m] || 1;
      const valeur = m === matiere ? objectif : Calc.moyenneMatiere(state.notes, m, trimestre);
      if (valeur === null) return;
      sommePoints += valeur * coef;
      sommeCoefs += coef;
    });
    const generaleSimulee = sommeCoefs > 0 ? Calc.round2(sommePoints / sommeCoefs) : null;
    const gain = generaleSimulee !== null && generaleActuelle !== null
      ? Calc.round2(generaleSimulee - generaleActuelle)
      : null;

    resultats.push({
      matiere: matiere,
      moyenne: moy,
      objectif: objectif,
      ecart: Calc.round2(objectif - moy),
      gainGenerale: gain
    });
  });

  resultats.sort(function (a, b) { return b.ecart - a.ecart; });
  return resultats;
};

/**
 * Vérifie que les objectifs par matière, une fois pondérés comme la moyenne
 * générale, sont cohérents avec l'objectif général déclaré (tolérance 0,1 point).
 */
Calc.verifierCoherenceObjectifs = function (state) {
  let sommePoints = 0;
  let sommeCoefs = 0;
  state.matieres.forEach(function (matiere) {
    const coef = state.coefMatieres[matiere] || 1;
    const objectif = state.objectifs[matiere];
    if (objectif === null || objectif === undefined) return;
    sommePoints += objectif * coef;
    sommeCoefs += coef;
  });
  const objectifImplicite = sommeCoefs > 0 ? Calc.round2(sommePoints / sommeCoefs) : null;
  const ecart = objectifImplicite !== null ? Calc.round2(objectifImplicite - state.objectifGeneral) : null;
  return {
    objectifImplicite: objectifImplicite,
    ecart: ecart,
    coherent: ecart === null || Math.abs(ecart) <= 0.5
  };
};

// Couleur de statut (vert / orange / rouge) selon l'écart à l'objectif
Calc.statutCouleur = function (moyenne, objectif) {
  if (moyenne === null || objectif === null || objectif === undefined) return "neutre";
  const ecart = moyenne - objectif;
  if (ecart >= 0) return "vert";
  if (ecart >= -1.5) return "orange";
  return "rouge";
};

// Affichage à la française : virgule décimale, "—" si valeur manquante
Calc.formatNombre = function (x, decimales) {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  return x.toFixed(decimales === undefined ? 2 : decimales).replace(".", ",");
};

window.Calc = Calc;
