/* ══ L'ORGANE DE GLISSER-DÉPOSER — lot 79, étape 2 ═══════════════════════
   📐 Croquis C (Wizard, 2ᵉ écran), et la consigne d'Eric du 2026-08-16 :
   *« on va tester le drag on verra »*, puis *« le tap sera peut-être plus
   approprié sur desktop, on peut construire les 2 en même temps »*.

   ⭐ DEUX GESTES, UNE SEULE SÉLECTION. Le même jeton se **tape** (il tombe
   dans le premier créneau libre) ou se **glisse** (il tombe dans le créneau
   visé). Ce n'est pas une redondance : le glisser désigne SA case, le tap
   laisse l'écran choisir — et sur un SE, viser une case de 44 px avec le
   pouce coûte plus cher que sur un trackpad.

   ⛔ PAS L'API HTML5 (`draggable`, `dragstart`), ET C'EST LA RAISON D'ÊTRE DE
   CE FICHIER : elle ne fonctionne pas sur Safari iOS, c'est-à-dire sur
   l'appareil où Eric teste. Tout passe par les ÉVÉNEMENTS POINTEUR, qui
   couvrent souris, doigt et stylet du même code.

   🔴 CE QUI DÉPARTAGE LE TAP DU GLISSER EST UNE DISTANCE, PAS UNE CIBLE.
   Le croquis pose les deux gestes sur le MÊME jeton (*« Tap on cantrip for
   info. Drag and drop to select »*) : on ne peut donc pas les séparer par
   l'endroit touché. Sous `SEUIL_GLISSER` px de déplacement, c'est un tap ;
   au-delà, un glisser. Un doigt n'est jamais parfaitement immobile — 6 px
   est le seuil qui laisse passer un tap tremblé sans déclencher de fantôme.

   ⛔ AUCUNE RÈGLE DE JEU ICI, comme partout : ce fichier reçoit des créneaux
   déjà calculés par le carnet et rend des actions. Il ne sait pas ce qu'est
   une compétence. */

const SEUIL_GLISSER = 6;

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/* ⛔ IL N'Y A PAS DE FANTÔME QUI SUIT LE DOIGT, ET C'EST UN GARDE QUI L'A
   DÉCIDÉ. La première écriture en posait un — une pastille flottante placée à
   chaque image par `element.style.left/top`. Le garde 7 des jetons interdit le
   style EN LIGNE dans tout `ui/` (« le décor va dans la feuille : un style en
   ligne échappe aux jetons, aux voiles et aux thèmes »), et son attaque montre
   que même `setProperty("--x", …)` est refusé : l'exception du moteur de dés
   n'est pas une porte dérobée.
   ⭐ CE QU'ON PERD EST PLUS PETIT QU'IL N'Y PARAÎT : sous un pouce, un fantôme
   est de toute façon caché par le doigt. Le retour visuel qui compte est
   ailleurs — le jeton pâlit (`data-glisse`), et le créneau SOUS le doigt
   s'allume (`data-vise`). Les deux sont des attributs, donc de la feuille.
   ⏳ Si Eric juge le geste trop sec à l'usage, le fantôme se rediscutera avec
   une exception ARGUMENTÉE au garde — pas en le contournant. */

/** Le créneau sous le pointeur, ou `null`. ⚠️ `elementFromPoint` et non une
 *  comparaison de rectangles : les créneaux peuvent défiler avec la scène, et
 *  un rectangle mémorisé au début du geste mentirait dès le premier pixel. */
function creneauSous(x, y) {
  if (typeof document.elementFromPoint !== "function") return null;
  const cible = document.elementFromPoint(x, y);
  return cible && typeof cible.closest === "function" ? cible.closest("[data-creneau]") : null;
}

/** ARME UN JETON pour les deux gestes.
 *  `onTap()` — relâché sans avoir bougé ; `onDepot(cheminDuCreneau)` — relâché
 *  sur un créneau. Un glisser relâché dans le vide ne fait RIEN, et c'est
 *  volontaire : annuler doit être possible en cours de geste. */
function armerJeton(jeton, { onTap, onDepot }) {
  jeton.addEventListener("pointerdown", (ev) => {
    if (jeton.disabled) return;
    /* ⛔ Le bouton par défaut d'un clic droit n'arme rien. */
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    const x0 = ev.clientX, y0 = ev.clientY;
    let glisse = false;
    let vise = null;
    /* La capture garde les événements sur CE jeton même si le doigt sort de
       sa boîte — sans elle, `pointerup` se perdrait dès le premier pixel.
       ⚠️ FACULTATIVE, ET POUR DEUX RAISONS RÉELLES : un pointeur peut avoir
       cessé d'exister entre l'événement et cet appel (le navigateur jette
       alors `NotFoundError`), et le geste doit rester ÉPROUVABLE hors
       navigateur — sans quoi le seul juge de cet organe serait l'œil. */
    if (typeof jeton.setPointerCapture === "function") {
      try { jeton.setPointerCapture(ev.pointerId); } catch { /* pointeur déjà fini */ }
    }

    const viser = (creneau) => {
      if (vise === creneau) return;
      if (vise) vise.dataset.vise = "false";
      vise = creneau;
      if (vise) vise.dataset.vise = "true";
    };

    const bouge = (e) => {
      if (!glisse && Math.hypot(e.clientX - x0, e.clientY - y0) < SEUIL_GLISSER) return;
      if (!glisse) {
        glisse = true;
        jeton.dataset.glisse = "true";
      }
      viser(creneauSous(e.clientX, e.clientY));
    };

    const fini = (e) => {
      jeton.removeEventListener("pointermove", bouge);
      jeton.removeEventListener("pointerup", fini);
      jeton.removeEventListener("pointercancel", fini);
      delete jeton.dataset.glisse;
      const cible = glisse ? creneauSous(e.clientX, e.clientY) : null;
      viser(null);
      if (!glisse) { onTap(); return; }          // sous le seuil : c'était un tap
      if (cible && e.type !== "pointercancel") onDepot(cible.dataset.creneau);
    };

    jeton.addEventListener("pointermove", bouge);
    jeton.addEventListener("pointerup", fini);
    jeton.addEventListener("pointercancel", fini);
  });
}

/** L'ÉCRAN DE CHOIX À CRÉNEAUX — même entrée que `renderSlotQcm` (carnet.mjs),
 *  autre forme. ⛔ Il ne le REMPLACE pas : le QCM sert encore l'espèce, sa
 *  bourse captive et le don d'origine. Deux formes, un seul contrat.
 *
 *  `slots` : ce que `planSlots` rend — chemin, index, options, `selected`,
 *  verrou. `onAction` reçoit exactement les mêmes actions que le QCM, donc le
 *  moteur ne voit aucune différence entre un choix tapé, glissé ou coché. */
export function renderChoixGlisses({ plan, slots, titre, mot, labelOf, refKind, onAction, consigne }) {
  if (!plan || !Array.isArray(slots) || slots.length === 0) return null;
  const act = onAction || (() => {});
  const bloc = el("section", "choix-glisse");
  bloc.dataset.status = plan.status;
  bloc.append(el("h3", null, [text(titre)]));
  bloc.append(el("p", "choix-glisse-compte", [text(`${plan.answered} of ${plan.expected} chosen`)]));

  const poser = (valeur, chemin) => act(refKind
    ? { kind: "choose", path: chemin, ref: { kind: refKind, id: valeur } }
    : { kind: "set", path: chemin, value: valeur });

  /* ── LE VIVIER : une pastille par option ──────────────────────────────
     ⭐ Une option DÉJÀ POSÉE est `disabled`, pas marquée « enfoncée » : elle
     n'est pas un interrupteur à deux états, elle est ailleurs. C'est aussi ce
     qui la tient hors du garde `aria-pressed` — un bouton à état devrait
     annoncer le sien, celui-ci n'en a pas. */
  /* ⚠️ `selected` EST UN TABLEAU, PAS UNE VALEUR — lu dans `decisions[]`, pas
     supposé : `catalogueCursor` fait déjà `plan.selected[0]`, et `renderPicker`
     reçoit le tableau entier. Le traiter comme un scalaire passait un objet à
     `query()`, qui a jeté « l'id doit être une chaîne ». Une forme se lit. */
  const choisiDe = (slot) => (Array.isArray(slot.selected) ? slot.selected[0] : slot.selected) || null;
  const posees = new Set(slots.map(choisiDe).filter(Boolean));
  const vivier = el("ul", "glisse-vivier");
  for (const id of slots[0].options || []) {
    const item = el("li", null);
    const jeton = el("button", "glisse-jeton", [text(labelOf ? labelOf(id) : id)]);
    jeton.type = "button";
    jeton.dataset.valeur = id;
    jeton.disabled = posees.has(id);
    armerJeton(jeton, {
      /* LE TAP : le premier créneau libre. S'il n'y en a plus, le geste ne
         fait rien — remplacer un choix au hasard serait pire que ne rien
         faire, et le joueur a un créneau à vider sous les yeux. */
      onTap: () => {
        const libre = slots.find((s) => !choisiDe(s));
        if (libre) poser(id, libre.path);
      },
      onDepot: (chemin) => poser(id, chemin)
    });
    item.append(jeton);
    vivier.append(item);
  }
  bloc.append(vivier);

  /* ── LES CRÉNEAUX : les cibles du glisser, et le seul endroit qui vide ── */
  const rangee = el("div", "glisse-creneaux");
  for (const slot of slots) {
    const creneau = el("button", "glisse-creneau");
    creneau.type = "button";
    creneau.dataset.creneau = slot.path;
    const choisi = choisiDe(slot);
    creneau.dataset.creneau = slot.path;
    creneau.dataset.rempli = choisi ? "true" : "false";
    const nom = `${mot || "Choice"} ${slot.index + 1}`;
    creneau.append(el("span", "glisse-creneau-nom", [text(nom)]));
    creneau.append(el("span", "glisse-creneau-valeur", [
      text(choisi ? (labelOf ? labelOf(choisi) : choisi) : "—")
    ]));
    /* Taper un créneau REMPLI le vide ; taper un créneau vide ne fait rien.
       C'est le seul geste de retrait, et il est à l'endroit qu'on regarde. */
    if (choisi) {
      creneau.setAttribute("aria-label", `${nom} — clear`);
      creneau.addEventListener("click", () => act({ kind: "clear", path: slot.path }));
    } else {
      creneau.setAttribute("aria-label", `${nom} — empty`);
    }
    rangee.append(creneau);
  }
  bloc.append(rangee);

  if (consigne) bloc.append(el("p", "glisse-consigne", [text(consigne)]));
  return bloc;
}
