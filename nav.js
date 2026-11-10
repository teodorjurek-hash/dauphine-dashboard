/* ===========================================================
   nav.js — Barre de navigation commune + bouton mode sombre
   Injectée dans <div id="nav-placeholder"></div> sur chaque page.
   La page indique sa propre identité via <body data-page="dashboard">.
   =========================================================== */

const Nav = window.Nav || {};

Nav.PAGES = [
  { id: "dashboard", href: "index.html", label: "Accueil", icone: "⌂" },
  { id: "notes", href: "notes.html", label: "Notes", icone: "✎" },
  { id: "echeances", href: "echeances.html", label: "Échéances", icone: "◷" },
  { id: "maths", href: "maths.html", label: "Maths", icone: "∑" },
  { id: "journal", href: "journal.html", label: "Journal", icone: "☰" },
  { id: "admission", href: "admission.html", label: "Dauphine", icone: "◆" }
];

Nav.appliquerTheme = function (theme) {
  const racine = document.documentElement;
  if (theme === "sombre") {
    racine.setAttribute("data-theme", "sombre");
  } else if (theme === "clair") {
    racine.setAttribute("data-theme", "clair");
  } else {
    racine.removeAttribute("data-theme"); // auto : suit le système
  }
};

Nav.init = function (state, utilisateur) {
  const pageActuelle = document.body.dataset.page;
  const placeholder = document.getElementById("nav-placeholder");
  if (!placeholder) return;

  const liens = Nav.PAGES.map(function (p) {
    const actif = p.id === pageActuelle ? " nav-actif" : "";
    return (
      '<a class="nav-item' + actif + '" href="' + p.href + '">' +
      '<span class="nav-icone" aria-hidden="true">' + p.icone + "</span>" +
      '<span class="nav-label">' + p.label + "</span>" +
      "</a>"
    );
  }).join("");

  placeholder.innerHTML =
    '<header class="entete">' +
    '<span class="entete-titre">Dauphine · Tableau de bord</span>' +
    '<div style="display:flex; align-items:center; gap:8px;">' +
    (utilisateur ? '<span class="chip" title="' + utilisateur.email + '">' + utilisateur.email + "</span>" : "") +
    (utilisateur ? '<button id="bouton-deconnexion" class="bouton bouton-discret bouton-petit" type="button">Déconnexion</button>' : "") +
    '<button id="bouton-theme" class="bouton-theme" type="button" aria-label="Changer de thème">🌓</button>' +
    "</div>" +
    "</header>" +
    '<nav class="nav-bas">' + liens + "</nav>";

  Nav.appliquerTheme(state.theme);

  document.getElementById("bouton-theme").addEventListener("click", function () {
    const ordre = ["auto", "clair", "sombre"];
    const suivant = ordre[(ordre.indexOf(state.theme) + 1) % ordre.length];
    state.theme = suivant;
    Storage.sauvegarder(state, utilisateur && utilisateur.uid);
    Nav.appliquerTheme(suivant);
  });

  if (utilisateur) {
    document.getElementById("bouton-deconnexion").addEventListener("click", Auth.deconnecter);
  }
};

window.Nav = Nav;
