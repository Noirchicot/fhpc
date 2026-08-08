/* L'erreur du bloc, nommée.

   Même partage que `BuildError` et `LayerError` : un appelant doit pouvoir
   distinguer « le magasin a refusé » de « le bloc a planté ». Un refus est un
   résultat ; un plantage est un défaut.

   ⚠️ `this.name` est POSÉ, contrairement à `LayerError` — mesuré au lot 10 :
   une classe qui ne pose pas son nom se présente comme un `Error` nu, et le
   nom de la classe est ce qui traverse la surface MCP (contrats/mcp.md,
   invariant 5). */

export class DocError extends Error {
  constructor(message) {
    super(message);
    this.name = "DocError";
  }
}
