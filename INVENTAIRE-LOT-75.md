# INVENTAIRE — LOT 75 « versions-modules »

**Le défaut.** GitHub Pages sert chaque fichier avec `cache-control:
max-age=600` (et un etag), compteur **par fichier**, à sa propre date de
chargement. Après un déploiement, une page pouvait tenir un `shell.mjs` neuf
et un `abilities-step.mjs` d'avant — vécu deux fois le 15 août (« 1 à 20 » à
l'écran, « 3 à 18 » dans le fichier livré). Les en-têtes ne se changent pas,
et la loi §0.9 interdit un serveur à nous.

**La propriété livrée.** Tout ce que la page charge porte `?v=<N>`, tous LE
MÊME <N>, et le seul décideur est `index.html` — fichier unique, qui ne peut
pas être « à moitié » à jour. Un graphe ancien reste entièrement ancien, un
frais entièrement frais. **Aucun hybride possible.** Prouvé au navigateur :
58 ressources demandées, une seule version vue, zéro URL nue, à 1440×900 et
à 360×780.

---

## 📌 Le geste d'incrémentation (publication)

    node bin/nouvelle-version.mjs      ← incrémente <N> PARTOUT, d'un coup,
                                         et RECALCULE l'import map
    npm test                           ← versions-graphe doit rester vert
    commit — puis push, geste d'Eric.

À faire **à chaque publication** qui touche `ui/`, `src/`, `layers/`,
`schemas/` ou `examples/`. Oublier le geste n'est PAS le défaut d'origine :
les visiteurs des dix minutes suivantes gardent l'ancien graphe ENTIER —
cohérent — puis basculent d'un bloc ; l'incrément ne sert qu'à percer le
cache immédiatement. Oublier UNE LIGNE, en revanche, remélangerait — et
c'est impossible en silence : le garde rougit en la nommant. Éprouvé :
aller-retour v=1 → v=2 → v=1 exact au diff près, 18/18 verts à v=2.

---

## Ce qui a changé

| Où | Quoi |
|---|---|
| `ui/builder/*.mjs` (13 fichiers) | **50 imports relatifs** portent `?v=1` — statiques ET dynamiques (47 balayés machine, 3 vers `version.mjs`) |
| `ui/builder/version.mjs` | **NOUVEAU** — `versionQuery(moduleUrl)` : la version lue dans `import.meta.url` du module appelant, jamais une constante recopiée ; la loi complète en tête de fichier |
| `ui/builder/engine.mjs` | les 3 `fetch` (5 couches, exemple, schéma) portent la version du module |
| `ui/builder/shell.mjs` | la coquille `fiche.shell.html` : version **dans le chemin** — `new URL(relatif, base)` JETTE la query de la base (mesuré) |
| `ui/builder/destiny-step.mjs` | `arcanaImageSrc()` et `ARCANA_BACK_SRC` (le dos de carte, pas listé au mandat) versionnés |
| `ui/builder/index.html` | 2 CSS + 1 module en `?v=1` ; **import map générée** (21 modules `src/` épinglés) ; commentaire de loi |
| `ui/builder/tokens.css` | les 2 `url()` (fonds jour/nuit) en `?v=1` |
| `bin/nouvelle-version.mjs` | **NOUVEAU** — LE geste : réécrit les `?v=` de `ui/`, recalcule la map depuis le graphe réel, refuse une query dans `src/` |
| `tests/versions-graphe.test.mjs` | **NOUVEAU** — 10 gardes + 8 attaques (détail plus bas) |
| `tests/review-export.test.mjs` | le marcheur du lot 67 retire la query avant de résoudre le fichier — ses dents anti-`node:` intactes |
| `tests/decor.test.mjs` (2ter) | exige le BON fichier par thème + UNE version — jamais un chiffre en dur, sinon chaque publication le rougirait |
| `TRAPS.md` | une ligne payée : query dans `src/` = kernel dédoublé sous Node ; `new URL` jette la query de la base |
| `QUESTIONS-ARCHITECTE.md` | question 75.1 : l'import map pour `src/`, à ratifier |

## La frontière `ui/` / `src/` — la découverte du lot, et une déviation assumée

Le mandat comptait « 43 imports dans 19 fichiers, dont trois vers
`../../src` » ; l'arbre à `1ceb151` en portait **47 dans 13**, et surtout la
fermeture réelle du graphe navigateur fait **28 fichiers `src/`** (7 entrées
+ 21 enfants internes). Premier relevé réseau : **21 modules `src/` chargés
sans version** — le mélange du 15 août restait possible un étage plus bas.

Étendre les queries dans `src/` : **35 tests rouges, mesurés** — Node tient
`registry.mjs` et `registry.mjs?v=1` pour deux modules, le kernel
(`blocks = new Map()`) se dédouble (« missing block(s): layers »), serveur
MCP sur le tuyau compris. Le piège n°1 du mandat : **bénin pour `ui/`**
(aucun état de niveau module hors `shell.mjs`, que rien n'importe versionné
— suite entière verte pour le prouver), **structurel pour `src/`**.

La clause du mandat (« si le piège n°1 est insoluble proprement — dis-le,
chiffre-le, propose ») est invoquée avec la plus petite déviation : la
conception tranchée reste ENTIÈRE sur `ui/` ; pour `src/`, les sources
restent **vierges** et c'est l'**import map d'`index.html`** — générée du
graphe réel par le geste de publication — qui donne au navigateur les URL
versionnées. Même propriété, même décideur unique. Détail, remèdes écartés
et prix chiffrés : `QUESTIONS-ARCHITECTE.md` § 75.1. **Réversible en un
commit** si l'architecte tranche autrement.

## Le garde laissé (`tests/versions-graphe.test.mjs`)

1. tout ce que `ui/` référence en relatif porte `?v=<N>` (imports statiques
   et dynamiques, `href`/`src`, `url()`) — planchers mesurés 50/3/2 pour que
   le relevé lui-même ne puisse pas s'éteindre en silence ;
2. UNE seule version dans tout le graphe, map comprise ;
3. `index.html` : ses trois chargements versionnés ;
4. 🔴 les sources `src/` de la fermeture VIERGES de query (46 arêtes) ;
5. 🔴 la map épingle EXACTEMENT les modules `src/` du graphe réel — ni trou,
   ni dérive, valeurs `clef?v=<N>` ;
6. la map précède le `<script type="module">` ;
7-9. preuves FONCTIONNELLES : `versionQuery` ; les arcanes sous `?v=888` ;
   le moteur monté sous `?v=888` demande couches/exemple/schéma sous sa
   version — et la pile monte, modules dédoublés compris ;
10. toute ligne `fetch(` de `ui/` lit sa version, coquille nommément.

⚔️ 8 attaques sur fixtures texte (aucun fichier temporaire), et sur l'arbre
réel pendant le lot : une ligne dénudée (`popup.mjs`) → garde 1 rouge qui la
nomme ; une clef de map supprimée (`registry`) → garde 5 rouge **avec le
geste de réparation dans le message** ; demi-bump → versions distinctes.

## Mesures

- `npm test` : **avant 1 079, après 1 097** (+18), EXIT=0 — et le veilleur
  `tree-immuable` rejoue toute la suite : verte aussi.
- États intermédiaires mesurés : 1 077/2 après le premier balayage (decor
  2ter + cascade du veilleur) ; **1 049/35** avec les queries dans `src/`
  (la mesure qui a tranché) ; 1 092 au commit `368b64d` ; 1 097 au final.
- Navigateur (serveur local 8099, worktree) : builder démarré aux **deux
  tailles** (1440×900, 360×780 — captures dans le fil du lot), app montée
  (6 enfants), `performance.getEntriesByType("resource")` : **58/58 en
  `?v=1`, zéro nue** — contre 37/58 versionnées avant la map.
- Témoin rAF : planté, **gelé à 1** (`visibilityState: "hidden"`) — le volet
  était masqué, exactement le piège du mandat. Les mesures visuelles ont été
  reprises volet présenté ; le relevé réseau, lui, ne dépend pas du rAF.

## Ce qui m'a surpris

1. **Les 21 modules `src/` nus au premier relevé** — le périmètre du mandat
   (43/19/3, compté avant les fusions 72/74) s'arrêtait un étage trop haut.
   La conclusion du lot : *l'unité de versionnement est le graphe, pas le
   dossier.*
2. **`git checkout` d'un fichier non commité** pour « restaurer » après une
   attaque = retour à HEAD : `popup.mjs` a perdu sa version en douce. C'est
   le GARDE qui l'a montré (54 occurrences au bump au lieu de 55). Leçon :
   committer l'état de base AVANT d'attaquer l'arbre réel.
3. **Mon propre commentaire de loi** dans `index.html` citait la balise
   `<script type="module">` — le contrôle de position mesurait la citation,
   pas la balise. Décapage des commentaires ajouté au garde 6.
4. `new URL(relatif, base)` **jette la query de la base** : `import.meta.url`
   versionné ne suffit pas, la version doit être dans le chemin (coquille).
5. Le demi-bump que j'ai « testé » sur `carnet.mjs`… qui n'a aucun import
   relatif : attaque à blanc. Refaite sur une vraie cible. Une attaque doit
   vérifier qu'elle a mordu.

## Attaqué sans qu'on le demande

- `ARCANA_BACK_SRC` (le dos de carte) — chargement d'exécution absent de la
  liste du mandat ;
- la discipline `fetch` généralisée (garde 10) : tout `fetch` FUTUR de `ui/`
  devra lire sa version, pas seulement les quatre d'aujourd'hui ;
- l'exactitude **bidirectionnelle** de la map (une clef en trop = une map
  qui dérive du graphe réel = faute nommée) ;
- `?v=beta` compte comme nu (attaque 6) — une version non entière ne perce
  rien de prévisible ;
- la position de la map avant le module (garde 6) — déclarée après, elle ne
  s'appliquerait pas et TOUT `src/` redeviendrait nu, page verte.

## Conditions de sortie

- ✅ `npm test` vert : 1 079 → 1 097, EXIT=0 ;
- ✅ builder démarré aux deux tailles, captures à l'appui, témoin rAF géré ;
- ✅ graphe cohérent prouvé par les URL réellement demandées (58/58 même
  version) ;
- ✅ commits sur `75-versions-modules` uniquement — rien poussé, rien
  fusionné dans `main`.
