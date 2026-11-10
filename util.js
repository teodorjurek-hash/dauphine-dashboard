/* ===========================================================
   util.js — Petits utilitaires partagés (dates, échéances)
   =========================================================== */

const Util = window.Util || {};

const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// iso peut être "2026-12-02" (date seule) ou "2026-12-02T18:30:00" (avec heure)
Util.formatDate = function (iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const avecHeure = iso.includes("T");
  let texte = JOURS[d.getDay()] + " " + d.getDate() + " " + MOIS[d.getMonth()] + " " + d.getFullYear();
  if (avecHeure) {
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    texte += ", " + h + "h" + m;
  }
  return texte;
};

Util.compteARebours = function (iso) {
  if (!iso) return null;
  const cible = new Date(iso).getTime();
  const maintenant = Date.now();
  const diffMs = cible - maintenant;
  if (diffMs <= 0) return "Passée";
  const jours = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return "Demain";
  return "Dans " + jours + " jours";
};

// Renvoie l'échéance future la plus proche (date connue uniquement), ou null
Util.prochaineEcheance = function (echeances) {
  const futures = echeances
    .filter(function (e) { return e.date; })
    .filter(function (e) { return new Date(e.date).getTime() > Date.now(); })
    .sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  return futures.length > 0 ? futures[0] : null;
};

Util.uid = function (prefixe) {
  return prefixe + "-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
};

window.Util = Util;
