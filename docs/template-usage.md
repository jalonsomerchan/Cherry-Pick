# Template Usage

La app se organiza como HTML estático ligero:

- `index.html` contiene la pantalla principal en español.
- `en/index.html` contiene la entrada equivalente para inglés.
- `src/scripts/` contiene JavaScript nativo de cliente para experiencias interactivas.
- `src/data/` contiene datos del juego.
- `src/i18n/` contiene traducciones compartidas.
- `assets/` contiene assets estáticos referenciados con rutas relativas.

Mantén cada fichero con una responsabilidad principal y extrae datos compartidos a `src/data/`.
