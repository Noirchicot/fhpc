#!/usr/bin/env python3
# ══ L'ATELIER DES IMAGES DE FICHE ════════════════════════════════════════
#
#   python3 bin/image-de-fiche.py ~/Desktop/Claude\ Drop/mage.png wizard
#   python3 bin/image-de-fiche.py --controle ~/Desktop/Claude\ Drop/mage.png
#   python3 bin/image-de-fiche.py --liste
#
# ⭐ POURQUOI CET OUTIL EXISTE. Les cotes d'une image de fiche sont arrêtées
# et mesurées (vault : « FHPCv2 — Images de fiche »), mais elles se posaient
# À LA MAIN, une image à la fois, avec une conversation à chaque fois. Ce
# fichier est cette recette, mécanisée : contrôle du rapport et de la boîte
# alpha, réduction au gabarit, WebP SANS PERTE, dépôt sous le nom que le
# builder déduit tout seul.
#
# 🔴 LE LEVIER DU POIDS EST LA TAILLE, PAS LA QUALITÉ — et c'est une leçon
# payée le 2026-08-16. Compresser l'illustration d'origine en WebP q82 lui
# « faisait perdre son relief » (Eric) : écart moyen 2,88 et **43 niveaux au
# pire** dans les tons sombres opaques. Réduire à la cote du cadre et garder
# le SANS PERTE donne un fichier plus léger ET rigoureusement identique.
# ⛔ Ce script ne propose donc AUCUN réglage de qualité. Il n'y en a pas.
#
# ⚠️ ET IL VÉRIFIE CE QU'IL AVANCE : après l'encodage, il relit le fichier
# écrit et compare les pixels là où alpha > 0. La bonne métrique est
# celle-là — le nombre de teintes distinctes compte le bruit de compression
# comme de la nuance, et un écart calculé sur TOUTE l'image inclut les
# pixels totalement transparents, dont le RVB est arbitraire. Deux métriques
# fausses ont été employées avant de trouver celle-ci.

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import numpy as np
    from PIL import Image
except ImportError as manque:  # pragma: no cover — dit ce qui manque, ne devine pas
    sys.exit(f"Il manque une dépendance de l'atelier : {manque}. `pip3 install --user pillow numpy`")

RACINE = Path(__file__).resolve().parent.parent
FICHES = RACINE / "ui" / "builder" / "assets" / "fiches"

# ── LES COTES, ET ELLES NE SE DÉDUISENT PAS ICI ──────────────────────────
# Elles viennent du vault (« FHPCv2 — Images de fiche »), qui les tient de
# la page servie. Ce script les CITE ; si une cote change, elle change
# là-bas d'abord.
EXPORT_L, EXPORT_H = 350, 600      # le double du cadre couché (175 × 299)
RAPPORT_VISE = 0.583               # dessiner pour le plus étroit des deux cadres
MARGE_VISEE = 0.05                 # « nothing touches the edges »
POIDS_VISE_KO = 160                # le mage pèse 157 Ko
ECRAN_DE_DOUZE_MO = 1.8            # les douze fiches se chargent ENSEMBLE


def noms_acceptes():
    """Les noms de fichier que le builder sait déduire — lus dans les COUCHES,
    jamais recopiés. `imageDeFiche` (class-step.mjs) prend le dernier segment
    de l'identifiant du record : `srd:class:en:wizard` → `wizard.webp`."""
    noms = {}
    for fichier, blocs in (("srd-5.2.1-en.layer.json", ("class",)),
                           ("fh-species-en.layer.json", ("species",))):
        couche = json.loads((RACINE / "layers" / fichier).read_text("utf-8"))
        for bloc in blocs:
            for identifiant in couche["records"].get(bloc, {}):
                noms[identifiant.split(":")[-1]] = (bloc, identifiant)
    return noms


def boite_alpha(image):
    """La boîte du SUJET (là où l'alpha n'est pas nul), et ses quatre marges
    en pour-cent de la toile. C'est le seul contrôle qui dise si le dessin
    respire — un sujet qui touche un bord sera collé au cadre."""
    alpha = image.getchannel("A")
    boite = alpha.getbbox()
    if boite is None:
        return None, None
    gauche, haut, droite, bas = boite
    largeur, hauteur = image.size
    marges = {
        "gauche": gauche / largeur, "droite": (largeur - droite) / largeur,
        "haut": haut / hauteur, "bas": (hauteur - bas) / hauteur,
    }
    return boite, marges


def reduire(image, largeur_max=EXPORT_L, hauteur_max=EXPORT_H):
    """Réduit SANS RECADRER — `object-fit: contain` côté page, même loi ici
    (Eric, 16/08 : « c'est un png faut pas couper »). L'échelle est celle qui
    fait entrer l'image entière dans le gabarit ; le rapport ne bouge pas.

    🔴 LA RÉDUCTION SE FAIT EN ALPHA PRÉMULTIPLIÉ. Un rééchantillonnage naïf
    mélange la couleur des pixels TRANSPARENTS (dont le RVB est arbitraire)
    à celle des pixels visibles, et pose un halo sur toute la silhouette —
    exactement là où le prompt demande un liseré chaud. Prémultiplier, puis
    diviser par l'alpha réduit, ne fait entrer dans le mélange que ce qui se
    voit."""
    largeur, hauteur = image.size
    echelle = min(largeur_max / largeur, hauteur_max / hauteur)
    cible = (max(1, round(largeur * echelle)), max(1, round(hauteur * echelle)))
    if cible == image.size:
        return image, echelle

    donnees = np.asarray(image, dtype=np.float64) / 255.0
    alpha = donnees[..., 3:4]
    premultiplie = np.concatenate([donnees[..., :3] * alpha, alpha], axis=2)
    reduit = np.asarray(
        Image.fromarray((premultiplie * 255.0 + 0.5).astype(np.uint8))
        .resize(cible, Image.LANCZOS),
        dtype=np.float64) / 255.0
    a2 = reduit[..., 3:4]
    rvb = np.divide(reduit[..., :3], a2, out=np.zeros_like(reduit[..., :3]), where=a2 > 0)
    sortie = np.concatenate([np.clip(rvb, 0, 1), a2], axis=2)
    return Image.fromarray((sortie * 255.0 + 0.5).astype(np.uint8)), echelle


def encoder(image, destination):
    """WebP sans perte. `cwebp -z 9` s'il est là (il compresse mieux que
    Pillow à contenu IDENTIQUE), Pillow sinon — et le script DIT lequel a
    servi plutôt que de laisser croire à une recette unique."""
    with tempfile.TemporaryDirectory() as tampon:
        source = Path(tampon) / "reduit.png"
        image.save(source, "PNG")
        if shutil.which("cwebp"):
            subprocess.run(
                ["cwebp", "-lossless", "-z", "9", "-alpha_q", "100", "-quiet",
                 str(source), "-o", str(destination)],
                check=True)
            return "cwebp -lossless -z 9"
    image.save(destination, "WEBP", lossless=True, quality=100, method=6)
    return "Pillow lossless (cwebp absent)"


def ecart_la_ou_ca_se_voit(avant, apres):
    """L'écart entre l'image réduite et le fichier RELU, mesuré UNIQUEMENT
    là où alpha > 0. Sans perte veut dire zéro ; toute autre valeur est un
    aveu, pas un détail."""
    a = np.asarray(avant, dtype=np.int16)
    b = np.asarray(apres.convert("RGBA"), dtype=np.int16)
    if a.shape != b.shape:
        return None, None
    visible = a[..., 3] > 0
    if not visible.any():
        return 0.0, 0
    diff = np.abs(a[..., :3][visible] - b[..., :3][visible])
    return float(diff.mean()), int(diff.max())


def poids_du_dossier(sauf=None):
    total = 0
    for fichier in FICHES.glob("*.webp"):
        if sauf is not None and fichier.name == sauf:
            continue
        total += fichier.stat().st_size
    return total


def controler(chemin):
    """Ce que l'atelier voit AVANT de toucher quoi que ce soit. Rend l'image
    ouverte et la liste des réserves — aucune n'arrête le traitement toute
    seule : c'est Eric qui décide si un dessin passe."""
    image = Image.open(chemin)
    original = image.size
    reserves = []
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    boite, marges = boite_alpha(image)
    if boite is None:
        reserves.append("l'image est ENTIÈREMENT transparente — il n'y a rien à poser")
        return image, original, None, None, reserves
    opaque_partout = np.asarray(image)[..., 3].min() > 0
    if opaque_partout:
        reserves.append(
            "aucune transparence : le fond est plein. La fiche compose l'image sur une "
            "dalle de verre, un fond plein y fera un rectangle — le prompt demande un PNG "
            "à fond transparent")
    rapport = original[0] / original[1]
    if abs(rapport - RAPPORT_VISE) > 0.06:
        reserves.append(
            f"rapport {rapport:.3f} au lieu de {RAPPORT_VISE} visé : rien ne sera coupé "
            "(le cadre est en `contain`), mais l'illustration rapetissera pour entrer")
    # Une marge courte se DIT une fois, pas quatre : quatre lignes pour un même
    # défaut noient la réserve qui compte (le sujet coupé au bord).
    touchees = [c for c, v in (marges or {}).items() if v < 0.005]
    courtes = [c for c, v in (marges or {}).items() if 0.005 <= v < MARGE_VISEE]
    if touchees:
        reserves.append(
            f"le sujet TOUCHE le bord ({', '.join(touchees)}) : rien ne sera coupé, mais la "
            "figure viendra buter contre le cadre, sans l'air que le prompt demande")
    if courtes:
        reserves.append(
            f"marge courte ({', '.join(courtes)}), sous les {MARGE_VISEE * 100:.0f} % visés — "
            "à l'œil, c'est une gêne, pas un défaut")
    if original[0] < EXPORT_L or original[1] < EXPORT_H:
        reserves.append(
            f"source {original[0]}×{original[1]}, plus petite que le gabarit "
            f"{EXPORT_L}×{EXPORT_H} : elle sera POSÉE telle quelle, jamais agrandie")
    return image, original, boite, marges, reserves


def rapporter(titre, lignes):
    print(f"\n{titre}")
    for ligne in lignes:
        print(f"  {ligne}")


def main():
    arguments = argparse.ArgumentParser(
        description="Pose un PNG d'illustration au gabarit des fiches du builder FHPC.")
    arguments.add_argument("source", nargs="?", help="le PNG à poser")
    arguments.add_argument("nom", nargs="?",
                           help="le nom du record : wizard, barbarian, elf… (`--liste` les donne)")
    arguments.add_argument("--controle", action="store_true",
                           help="mesure et n'écrit RIEN")
    arguments.add_argument("--liste", action="store_true",
                           help="les noms acceptés, et ce que le dossier porte déjà")
    opts = arguments.parse_args()

    noms = noms_acceptes()

    if opts.liste:
        existants = {f.stem: f.stat().st_size for f in FICHES.glob("*.webp")}
        for bloc in ("class", "species"):
            rapporter(f"── {bloc} ──", [
                f"{nom:<12} {'✔ ' + str(existants[nom] // 1024) + ' Ko' if nom in existants else '—'}"
                for nom, (b, _) in sorted(noms.items()) if b == bloc])
        orphelins = sorted(set(existants) - set(noms))
        if orphelins:
            rapporter("⚠️ dans le dossier, mais AUCUN record ne porte ce nom",
                      [f"{nom}.webp — aucun écran ne le chargera" for nom in orphelins])
        print(f"\ntotal du dossier : {poids_du_dossier() / 1024:.0f} Ko "
              f"(plafond de l'écran de douze : {ECRAN_DE_DOUZE_MO} Mo)")
        return 0

    if not opts.source:
        arguments.error("il faut une source (ou `--liste`)")
    chemin = Path(opts.source).expanduser()
    if not chemin.exists():
        sys.exit(f"introuvable : {chemin}")

    image, original, boite, marges, reserves = controler(chemin)
    rapporter(f"── LA SOURCE — {chemin.name} ──", [
        f"toile      {original[0]} × {original[1]}  (rapport {original[0] / original[1]:.3f})",
        f"sujet      {boite}" if boite else "sujet      aucun (tout transparent)",
        "marges     " + ("  ".join(f"{c} {v * 100:.1f} %" for c, v in marges.items())
                         if marges else "—"),
    ])
    if reserves:
        rapporter("⚠️ RÉSERVES — elles n'arrêtent rien, elles se lisent", [f"· {r}" for r in reserves])

    if opts.controle:
        print("\n(--controle : rien n'a été écrit)")
        return 0

    if not opts.nom:
        arguments.error("il faut un nom de record (`--liste` les donne), ou `--controle`")
    nom = opts.nom.lower().strip()
    if nom not in noms:
        proches = [n for n in noms if n.startswith(nom[:3])]
        sys.exit(f"« {nom} » n'est le nom d'aucun record. "
                 + (f"Peut-être : {', '.join(sorted(proches))}. " if proches else "")
                 + "`--liste` donne les 24.")
    bloc, identifiant = noms[nom]

    reduit, echelle = reduire(image)
    destination = FICHES / f"{nom}.webp"
    remplacement = destination.exists()
    ancien = destination.stat().st_size if remplacement else 0
    recette = encoder(reduit, destination)
    moyen, pire = ecart_la_ou_ca_se_voit(reduit, Image.open(destination))
    poids = destination.stat().st_size

    rapporter("── CE QUI A ÉTÉ ÉCRIT ──", [
        f"fichier    {destination.relative_to(RACINE)}",
        f"record     {identifiant}",
        f"gabarit    {reduit.size[0]} × {reduit.size[1]}  (échelle {echelle:.3f})",
        f"encodage   {recette}",
        f"poids      {poids / 1024:.0f} Ko" + (f"  (avant : {ancien / 1024:.0f} Ko)" if remplacement else ""),
        f"sans perte écart moyen {moyen:.2f}, pire {pire} — mesuré là où alpha > 0"
        if moyen is not None else "sans perte non vérifiable (taille relue différente)",
    ])

    suites = []
    if moyen:
        suites.append("🔴 L'ÉCART N'EST PAS NUL : l'encodage n'est pas resté sans perte. "
                      "Ne publie pas cette image sans comprendre pourquoi.")
    if poids / 1024 > POIDS_VISE_KO:
        suites.append(f"⚠️ {poids / 1024:.0f} Ko pour {POIDS_VISE_KO} Ko visés — c'est la TAILLE "
                      "du dessin qui pèse, jamais la qualité (elle est fixe).")
    total = (poids_du_dossier() ) / 1024 / 1024
    suites.append(f"écran de douze : {total:.2f} Mo aujourd'hui, plafond {ECRAN_DE_DOUZE_MO} Mo.")
    if bloc == "species":
        suites.append("⚠️ AUCUN ÉCRAN NE CHARGE ENCORE LES IMAGES D'ESPÈCE : seul `class-step.mjs` "
                      "déduit le chemin (`imageDeFiche`). Le fichier est en place, il attend son écran.")
    if remplacement:
        suites.append("🔴 C'EST UN REMPLACEMENT, donc `node bin/nouvelle-version.mjs` AVANT de "
                      "publier : GitHub Pages garde l'ancienne image dix minutes par fichier, et "
                      "l'URL ne change qu'avec le `?v=`.")
    rapporter("── LA SUITE ──", [f"· {s}" for s in suites])
    return 0


if __name__ == "__main__":
    sys.exit(main())
