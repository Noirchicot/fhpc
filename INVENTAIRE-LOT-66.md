# INVENTAIRE — LOT 66 « Equipment »

| | |
|---|---|
| **Avant** | **993** tests, 0 échec |
| **Après** | **995** tests, 0 échec, `EXIT=0` |

## La mesure

| | |
|---|---|
| **À l'origine** (§3bis) | **17 660 px** |
| Après la barre fixe | 7 054 px |
| **Après** | **1 272 px** — et **13 records** au lieu de 133 quand on filtre `Armor` |

## Ce que B8 demandait

**B8.1** le budget **flotte**, « sans trop prendre de place » · une **molette
horizontale** qui catégorise · un **`?`** à côté du budget · ⏳ la **loupe**,
posée au conditionnel — *« si on a la place »*. La place existe : le bandeau
tient en **101 px**, et replier la recherche derrière la loupe **évite une
cinquième barre fixe** (le cumul que B7.6 signalait).

**B8.2** « What you already have » **explique POURQUOI** : le paquet de la
classe (sa phrase exacte, recopiée), la bourse, ce qu'on a ajouté. Le `?` la
rappelle, un clic dehors la ferme.

**B8.3** deux lignes par item, `+` et 👁 sur toute la hauteur. **L'œil ouvre
le popup partagé** — sa **troisième** occurrence annoncée (B7.7, B8.2, B8.3),
et il n'a pas fallu en écrire une ligne de plus.

⭐ **Et la contrainte d'une seule ligne (B7.3c) ne s'applique PAS ici** :
Compétences comprime, Equipment empile. C'est délibéré, et ça règle au
passage les trois noms d'outils que Compétences devait couper.

## 👀 Trois défauts trouvés à l'œil

1. 🔴 **UNE VIRGULE MANQUANTE TUAIT TOUTE L'APPLICATION — page blanche — ET
   LES 993 TESTS RESTAIENT VERTS.** La cause est structurelle : `shell.mjs`
   n'a aucun harnais de rendu, tous ses gardes le lisent **en octets**, et
   **personne ne l'importe**. Un fichier qu'aucun test n'importe peut être
   syntaxiquement mort sans qu'une suite bronche. → **garde F** : chaque
   module de `ui/` doit se parser (`node --check`), avec l'attaque qui rejoue
   la virgule.
2. **Les 133 lignes « repliées » occupaient 7 054 px** : `[hidden]` **ne bat
   pas** un `display: flex` d'auteur. Et on ne pouvait pas répondre par un
   `display: none` — le garde des jetons l'interdit (défaut n°3). La bonne
   réponse était de **ne pas les construire** : on ne rend que ce qui
   s'affiche, par `swapContent`.
3. **La molette ne filtrait rien** — elle aurait été un décor.

## Ce qui a migré, plutôt que disparu

La **phrase d'équipement de classe** quittait un bloc permanent pour la
fenêtre « What you already have ». Eric décrit une fenêtre qui *« dit ce
qu'on possède déjà ET EXPLIQUE POURQUOI »* : le paquet de classe est
exactement ça. En bloc permanent, il coûtait de la hauteur à un écran qui en
manque. Les tests qui le gardaient prouvent la même chose, au même octet.
