# Ricettario – catalogo ingredienti

Questo è il contenuto del repository **pubblico** `ricettario-catalogo` (nell'account GitHub che userai a lungo).
`catalog.json` + la cartella `images/` sono ciò che l'app scarica per mostrare gli ingredienti a tutti.

Normalmente non serve toccarlo a mano: l'amministratore pubblica dall'app («📤 Pubblica nel catalogo»).
Dal pc, in questa cartella:
- `node add.mjs "Mascarpone" foto.jpg 🧀` aggiunge o aggiorna un ingrediente (foto ed emoji facoltative)
- `node fetch-photos.mjs` scarica da Wikipedia le foto di quelli che non ce l'hanno
- poi `git add . && git commit -m "catalogo" && git push`
