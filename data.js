/* ===========================================================
   data.js — Modèle de données par défaut (compte vierge).
   Ce fichier est public (sur GitHub) : il ne doit jamais contenir
   de vraies notes. Chaque utilisateur remplit ses propres données,
   qui sont alors sauvegardées sur son compte (Firestore), jamais ici.
   =========================================================== */

const App = window.App || {};

App.defaultState = function () {
  return {
    version: 1,
    trimestreActuel: "T1",
    objectifGeneral: 16,

    matieres: [
      "Anglais LV1",
      "EMC",
      "EPS",
      "Français",
      "Enseignement scientifique",
      "Histoire-géo",
      "Allemand LV2",
      "Mathématiques",
      "Physique-chimie",
      "SES"
    ],

    // Coefficient de chaque matière dans la moyenne générale (modifiable)
    coefMatieres: {
      "Anglais LV1": 1,
      "EMC": 1,
      "EPS": 1,
      "Français": 1,
      "Enseignement scientifique": 1,
      "Histoire-géo": 1,
      "Allemand LV2": 1,
      "Mathématiques": 1,
      "Physique-chimie": 1,
      "SES": 1
    },

    // Objectif personnel par matière (sur 20) — à ajuster dans la page Notes
    objectifs: {
      "Anglais LV1": 16,
      "EMC": 16,
      "EPS": 16,
      "Français": 16,
      "Enseignement scientifique": 16,
      "Histoire-géo": 16,
      "Allemand LV2": 16,
      "Mathématiques": 16,
      "Physique-chimie": 16,
      "SES": 16
    },

    // Moyenne de classe déclarée par matière et par trimestre
    moyennesClasse: {
      "Anglais LV1": { T1: null, T2: null, T3: null },
      "EMC": { T1: null, T2: null, T3: null },
      "EPS": { T1: null, T2: null, T3: null },
      "Français": { T1: null, T2: null, T3: null },
      "Enseignement scientifique": { T1: null, T2: null, T3: null },
      "Histoire-géo": { T1: null, T2: null, T3: null },
      "Allemand LV2": { T1: null, T2: null, T3: null },
      "Mathématiques": { T1: null, T2: null, T3: null },
      "Physique-chimie": { T1: null, T2: null, T3: null },
      "SES": { T1: null, T2: null, T3: null }
    },
    moyenneGeneraleClasse: { T1: null, T2: null, T3: null },

    // Notes. statut: "compte" | "attente" (ne compte pas encore). type: "note" | "absence"
    notes: [],

    echeances: [
      { id: "e1", titre: "Conseil de classe — 1er trimestre", date: null, statutDate: "à vérifier", description: "" },
      { id: "e2", titre: "Conseil de classe — 2e trimestre", date: null, statutDate: "à vérifier", description: "" },
      { id: "e3", titre: "Conseil de classe — 3e trimestre", date: null, statutDate: "à vérifier", description: "" },
      { id: "e4", titre: "Épreuve anticipée de français — écrit", date: null, statutDate: "à vérifier", description: "Bac de français, fin de première." },
      { id: "e5", titre: "Épreuve anticipée de français — oral", date: null, statutDate: "à vérifier", description: "Bac de français, fin de première." },
      { id: "e6", titre: "Autres épreuves anticipées de fin de première", date: null, statutDate: "à vérifier", description: "À compléter selon le calendrier officiel de ta promotion." },
      { id: "e7", titre: "Ouverture de Parcoursup", date: null, statutDate: "à vérifier", description: "Terminale." },
      { id: "e8", titre: "Formulation des vœux", date: null, statutDate: "à vérifier", description: "Terminale." },
      { id: "e9", titre: "Date limite de confirmation des vœux", date: null, statutDate: "à vérifier", description: "Terminale." },
      { id: "e10", titre: "Résultats de la phase principale", date: null, statutDate: "à vérifier", description: "Terminale." }
    ],

    maths: {
      lacunes: [
        { id: "l1", nom: "Fractions", statut: "à revoir" },
        { id: "l2", nom: "Puissances", statut: "à revoir" },
        { id: "l3", nom: "Racines", statut: "à revoir" },
        { id: "l4", nom: "Développer / factoriser", statut: "à revoir" },
        { id: "l5", nom: "Identités remarquables", statut: "à revoir" },
        { id: "l6", nom: "Équations et inéquations", statut: "à revoir" },
        { id: "l7", nom: "Signe d'une expression", statut: "à revoir" },
        { id: "l8", nom: "Valeur absolue", statut: "à revoir" }
      ],
      chapitres: [
        { id: "c1", nom: "Suites numériques", niveau: 1, derniereRevision: null },
        { id: "c2", nom: "Second degré", niveau: 1, derniereRevision: null },
        { id: "c3", nom: "Dérivation", niveau: 1, derniereRevision: null },
        { id: "c4", nom: "Fonction exponentielle", niveau: 1, derniereRevision: null },
        { id: "c5", nom: "Variables aléatoires", niveau: 1, derniereRevision: null },
        { id: "c6", nom: "Produit scalaire", niveau: 1, derniereRevision: null },
        { id: "c7", nom: "Trigonométrie", niveau: 1, derniereRevision: null }
      ],
      journalExercices: []
    },

    journalHebdo: [],

    admission: {
      liens: [
        { titre: "Fiche Parcoursup — Licence Maths-Informatique, Dauphine-PSL", url: "https://www.parcoursup.fr", note: "Chercher la formation exacte sur Parcoursup — le lien direct change chaque année." },
        { titre: "Fiche Parcoursup — Licence Sciences des organisations, Dauphine-PSL", url: "https://www.parcoursup.fr", note: "Chercher la formation exacte sur Parcoursup — le lien direct change chaque année." },
        { titre: "Rapports publics Parcoursup — Université Paris Dauphine-PSL", url: "https://dauphine.psl.eu", note: "À vérifier : chercher la page admissions / rapports Parcoursup du site de Dauphine." }
      ],
      releves: []
    },

    theme: "auto"
  };
};

window.App = App;
