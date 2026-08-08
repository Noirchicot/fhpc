# FHPC — Fate's Hand Player Companion (v2)

Constructeur de personnage indépendant sur SRD 5.2, à couches de règles
empilables (FH livrée, homebrew par MJ). Le personnage appartient au joueur,
la campagne au MJ ; FHPC est un serveur MCP qui laisse l'IA du joueur le
porter dans les VTT.

Date dure unique : **2026-11-07, la table d'Eric joue.**

- Architecture : [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Pièges déjà payés : [`TRAPS.md`](TRAPS.md)
- Contrats de blocs : [`contracts/`](contracts/)

## Le serveur MCP

```sh
node bin/fhpc-mcp.mjs      # JSON-RPC 2.0 sur stdio, protocole MCP 2026-07-28
```

Il ne lit ni n'écrit aucun fichier : les couches entrent par leur texte, le
personnage sort par la resource `fh-char:///open` ou l'outil `mcp.document`, et
c'est l'appelant qui l'enregistre. Surface, invariants et version de protocole
vérifiée : [`contracts/mcp.md`](contracts/mcp.md).
