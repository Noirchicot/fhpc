/* L'erreur du bloc, nommée.

   Une classe plutôt qu'un `Error` nu pour la même raison que `LayerError` :
   un appelant doit pouvoir distinguer « la dérivation a refusé » de « le
   moteur a planté ». Un refus est un résultat ; un plantage est un défaut. */

export class BuildError extends Error {
  constructor(message) {
    super(message);
    this.name = "BuildError";
  }
}
